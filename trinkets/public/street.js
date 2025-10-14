// Street: keep exactly TARGET_LEGS walkers on screen.
// - Maintain 10 "empty" base legs that NEVER auto-fade.
// - On new trinket: replace an empty (or oldest) with a trinket walker (name popup shows 10s with pop-in).
// - Trinket walkers auto-fade after 2 minutes; when they do (or are deleted in admin), an empty is spawned to restore 10.
// - Admin controls: spawn_leg (only if below target), clear_legs (clears then refills to target).
// - Robust admin channel: BroadcastChannel + localStorage queue fallback.
// - Per-leg walking speed variation + periodic re-speeding with easing.
// - Prune active trinkets if admin deleted them.
// - Popup positions via screen rects to stay right next to the sprite.
// - NEW: Admin "replay" gets enqueued and spawned through the same staggered pipeline (no refresh).

const API_BASE = "";
const LIST_URL = `${API_BASE}/api/trinkets`;

const DEBUG = true;
const POLL_MS = 5000;
const TARGET_LEGS = 10;

/* ---- Leg variants & anchors (your values) ---- */
const LEG_VARIANTS = [
  "assets/leg1_default.gif",
  "assets/leg1_bag.gif",
  "assets/leg1_sling.gif",
];

const ATTACH_POINTS = {
  default: { x:  0,    y: 0.30 }, // middle of legs
  bag:     { x: -0.15, y: 0.18 }, // middle-left (bag)
  sling:   { x: -0.05, y: 0.20 }, // middle-top (sling)
};

const GLOBAL_TRINKET_SCALE = 0.5;
const TRINKET_SCALES = { default: 0.3, bag: 0.4, sling: 0.3 };

/* ---- Popup behaviour ---- */
const BUBBLE_LIFETIME_MS = 10000;     // show for 10s
const BUBBLE_SHIFT = { x: 14, y: 18 } // screen-pixel nudge from anchor

/* ---- DOM & background containment ---- */
let bgFrame = document.getElementById("bgFrame");
if (!bgFrame) { bgFrame = document.createElement("div"); bgFrame.id = "bgFrame"; document.body.appendChild(bgFrame); }
let layer = document.getElementById("walkerLayer");
if (!layer) { layer = document.createElement("div"); layer.id = "walkerLayer"; bgFrame.appendChild(layer); }

let bgRect = { left: 0, top: 0, width: 0, height: 0 };

function parseBgUrl() {
  const str = getComputedStyle(document.body).backgroundImage;
  if (!str || str === "none") return null;
  const m = str.match(/url\(["']?(.*?)["']?\)/i);
  return m ? m[1] : null;
}
function computeContainRect(imgW, imgH, boxW, boxH) {
  const s = Math.min(boxW / imgW, boxH / imgH);
  const w = imgW * s, h = imgH * s;
  return { left: (boxW - w)/2, top: (boxH - h)/2, width: w, height: h };
}
function applyBgRect() {
  Object.assign(bgFrame.style, {
    position: "fixed", overflow: "hidden", pointerEvents: "none",
    left: `${bgRect.left}px`, top: `${bgRect.top}px`,
    width: `${bgRect.width}px`, height: `${bgRect.height}px`,
  });
}
async function measureBackground() {
  const url = parseBgUrl();
  const boxW = document.documentElement.clientWidth;
  const boxH = document.documentElement.clientHeight;
  if (!url) {
    bgRect = { left:0, top:0, width:boxW, height:boxH };
    applyBgRect();
    return;
  }
  await new Promise((res)=>{
    const img = new Image();
    img.onload  = ()=>{ bgRect = computeContainRect(img.naturalWidth||1, img.naturalHeight||1, boxW, boxH); applyBgRect(); res(); };
    img.onerror = ()=>{ bgRect = { left:0, top:0, width:boxW, height:boxH }; applyBgRect(); res(); };
    img.src = url;
  });
}
addEventListener("resize", () => {
  clearTimeout(window._bgR);
  window._bgR = setTimeout(measureBackground, 120);
});

/* ---- Utils ---- */
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const pick  = (arr)=>arr[(Math.random()*arr.length)|0];
const randBetween = (a,b)=>Math.random()*(b-a)+a;

function normalizeSrc(t){
  if (!t) return "";
  if (/^(data:|https?:|\/)/i.test(t)) return t;
  return t.startsWith("uploads/") ? `/${t}` : t;
}
const getRowId  = r => r?.id ?? r?._id ?? r?.uuid ?? r?.guid ?? r?.pk ?? null;
const getRowSrc = r => r?.image_path ?? r?.image ?? r?.src ?? r?.drawing ?? "";
const getRowName = r => r?.trinketName ?? r?.name ?? r?.displayName ?? r?.title ?? r?.label ?? r?.filename ?? "";

/* ---- Fade helpers ---- */
function raf(){ return new Promise(r => requestAnimationFrame(r)); }
async function fadeInEl(el, ms=480){
  el.style.transition = 'none';
  el.style.opacity = '0';
  await raf(); await raf();
  el.style.transition = `opacity ${ms}ms ease-out`;
  el.style.opacity = '1';
}
async function fadeOutEl(el, ms=400){
  el.style.transition = `opacity ${ms}ms ease-in`;
  el.style.opacity = '0';
  return new Promise(r => setTimeout(r, ms));
}

/* ---- Popup builder (outer follows position; inner “pops in”) ---- */
function makeNameBubble(text){
  if (!text || !String(text).trim()) return null;

  const outer = document.createElement('div'); // positioned in layer coords
  Object.assign(outer.style, {
    position: 'absolute',
    left: '0px',
    top: '0px',
    transform: 'translate(-9999px,-9999px)', // offscreen until first tick
    pointerEvents: 'none',
    zIndex: '999999'
  });

  const inner = document.createElement('div'); // visual box (white bg, pop-in)
  inner.textContent = String(text).trim();
  Object.assign(inner.style, {
    background: '#ffffff',
    color: '#000000',
    padding: '6px 10px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: '1.25',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    opacity: '0',
    transform: 'scale(0.82)',
    transition: 'opacity 260ms ease-out, transform 260ms cubic-bezier(.2,.9,.25,1.2)'
  });

  outer.appendChild(inner);

  // expose inner for pop-in/out
  outer._inner = inner;
  // helper methods
  outer._popIn = () => {
    requestAnimationFrame(() => {
      inner.style.opacity = '1';
      inner.style.transform = 'scale(1)';
    });
  };
  outer._popOut = (ms=220) => new Promise(res=>{
    inner.style.transition = `opacity ${ms}ms ease-in, transform ${ms}ms ease-in`;
    inner.style.opacity = '0';
    inner.style.transform = 'scale(0.9)';
    setTimeout(res, ms+20);
  });

  return outer;
}

/* ---- Walker registry (track type + sourceId for trinkets) ---- */
const walkers = new Map(); // id -> { el, type: 'empty'|'trinket', sourceId: string|null, removeTimer|null, bornAt, refs:{} }
const emptyIds = new Set();
const trinketIds = new Set();

function genId(){ return `w_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

function getWalkerCount(){ return walkers.size; }
function getEmptyCount(){ return emptyIds.size; }
function getTrinketCount(){ return trinketIds.size; }

function oldestWalkerId(preferType=null){
  let bestId = null, bestAge = Infinity;
  for (const [id, rec] of walkers.entries()) {
    if (preferType && rec.type !== preferType) continue;
    if (rec.bornAt < bestAge) { bestAge = rec.bornAt; bestId = id; }
  }
  if (!bestId && preferType) {
    for (const [id, rec] of walkers.entries()) {
      if (rec.bornAt < bestAge) { bestAge = rec.bornAt; bestId = id; }
    }
  }
  return bestId;
}

async function removeWalker(id, fadeMs=300){
  const rec = walkers.get(id);
  if (!rec) return;
  if (rec.removeTimer) clearTimeout(rec.removeTimer);

  if (rec.refs?.bubble && rec.refs.bubble.parentNode) {
    rec.refs.bubble.remove();
  }

  await fadeOutEl(rec.el, fadeMs);
  rec.el.remove();
  walkers.delete(id);
  emptyIds.delete(id);
  trinketIds.delete(id);
}

/* ---- Spawn walker (trinketSrc may be null for empty) ---- */
function spawnWalker(trinketSrc, meta = {}) {
  const { name, sourceId = null } = meta;
  const wid = genId();

  const el = document.createElement("div");
  el.className = "walker";
  el.dataset.walkerId = wid;
  layer.appendChild(el);

  const legSrc = pick(LEG_VARIANTS);
  const vKey   = /sling/i.test(legSrc) ? "sling" : /bag/i.test(legSrc) ? "bag" : "default";

  const leg = document.createElement("img");
  leg.className = "gif";
  leg.alt = "legs";
  leg.src = `${legSrc}?cb=${Date.now()}_${Math.random().toString(36).slice(2)}`;
  el.appendChild(leg);

  let type = "empty";
  let tr = null;
  if (trinketSrc) {
    type = "trinket";
    tr = document.createElement("img");
    tr.className = "trinket";
    tr.alt = "trinket";
    tr.src = normalizeSrc(trinketSrc);
    const scale = (TRINKET_SCALES[vKey] ?? 1) * GLOBAL_TRINKET_SCALE;
    tr.style.setProperty("--scale", scale);
    el.appendChild(tr);
  }

  // Popup for NEW trinkets only (10s with pop-in)
  let bubble = null, bubbleKillTimer = null;
  if (type === "trinket") {
    const cleanName = (name || "").trim();
    if (cleanName) {
      bubble = makeNameBubble(cleanName);
      if (bubble) {
        layer.appendChild(bubble);
        bubble._popIn();
        // Auto remove after 10s
        bubbleKillTimer = setTimeout(async () => {
          await bubble._popOut(200);
          bubble.remove();
        }, BUBBLE_LIFETIME_MS);
      }
    }
  }

  // Size & anchors (for internal trinket placement)
  const size   = el.offsetWidth || parseFloat(getComputedStyle(el).width) || 180;
  const ap     = ATTACH_POINTS[vKey] || ATTACH_POINTS.default;
  const baseTX = size * ap.x;
  const baseTY = size * ap.y;

  // Random spawn positions
  let x = Math.random() * Math.max(0, bgRect.width - size);
  const yBase = bgRect.height * 0.70;
  let y = clamp(yBase + (Math.random()*0.2 - 0.1) * bgRect.height, 0, bgRect.height - size - 10);

  // ----- Motion with speed variation -----
  const speedMin = (type === "trinket") ? 18 : 14;
  const speedMax = (type === "trinket") ? 40 : 32;
  let dir = Math.random() < 0.5 ? 1 : -1;
  let speed = randBetween(speedMin, speedMax);
  let vx = dir * speed;
  let vy = (Math.random()*2 - 1) * 4;

  let nextSpeedChange = performance.now() + randBetween(2000, 6000);
  function retargetSpeed(now) {
    if (Math.random() < 0.20) dir *= -1; // 20% flip
    speed = randBetween(speedMin, speedMax);
    nextSpeedChange = now + randBetween(2000, 6000);
  }

  // Fade in walker
  fadeInEl(el, 480);

  // Auto remove timer ONLY for trinket walkers (empty walkers NEVER auto-fade)
  let removeTimer = null;
  if (type === "trinket") {
    removeTimer = setTimeout(async () => {
      if (bubbleKillTimer) { clearTimeout(bubbleKillTimer); bubbleKillTimer = null; }
      if (bubble && bubble.parentNode) { await bubble._popOut(160); bubble.remove(); }
      await fadeOutEl(el, 400);
      walkers.delete(wid);
      emptyIds.delete(wid);
      trinketIds.delete(wid);
      el.remove();
      // Replace trinket with an empty to maintain TARGET_LEGS
      ensurePopulation();
    }, 120000);
  }

  const rec = { el, type, sourceId, removeTimer, bornAt: performance.now(), refs: { leg, tr, bubble } };
  walkers.set(wid, rec);
  if (type === "empty") emptyIds.add(wid); else trinketIds.add(wid);

  // Animation loop
  let last = performance.now();
  function step(t){
    const now = t || performance.now();
    const dt  = Math.min(0.05, (now - last)/1000);
    last = now;

    if (now >= nextSpeedChange) retargetSpeed(now);

    const targetVx = dir * speed;
    vx += (targetVx - vx) * Math.min(1, 0.8 * dt * 10);

    x += vx * dt;
    y += vy * dt;

    vy += (Math.random()*2 - 1) * 2 * dt;
    vy *= 0.98;

    // face direction + keep trinket attached (mirror X)
    leg.style.transform = `translateX(-50%) scaleX(${vx < 0 ? -1 : 1})`;
    if (tr) {
      const tx = (vx < 0 ? -baseTX : baseTX);
      const ty = baseTY;
      tr.style.setProperty("--tx", `${tx}px`);
      tr.style.setProperty("--ty", `${ty}px`);
    }

    // containment + bounce
    if (x <= 0) { x = 0; dir = 1; vx = Math.abs(vx); }
    if (x >= bgRect.width - size) { x = bgRect.width - size; dir = -1; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    if (y >= bgRect.height - size) { y = bgRect.height - size; vy = -Math.abs(vy); }

    el.style.transform = `translate(${x}px, ${y}px)`;

    // ----- Bubble positioning via DOM rects -----
    if (rec.refs.bubble) {
      const bubble = rec.refs.bubble;
      const anchorEl = rec.refs.tr || rec.refs.leg;
      const aRect = anchorEl.getBoundingClientRect();
      const lRect = layer.getBoundingClientRect();

      const anchorX = aRect.left + aRect.width / 2;
      const anchorY = aRect.top;

      const side = vx < 0 ? -1 : 1;
      const bx = (anchorX - lRect.left) + side * BUBBLE_SHIFT.x;
      const by = (anchorY - lRect.top) - BUBBLE_SHIFT.y;

      bubble.style.transform = `translate(${Math.round(bx)}px, ${Math.round(by)}px)`;
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  return wid;
}

/* ---- Population management ---- */
function ensurePopulation() {
  while (getWalkerCount() < TARGET_LEGS) {
    spawnWalker(null, { name: "" }); // empty base leg (immortal)
  }
  while (getWalkerCount() > TARGET_LEGS) {
    const victim = oldestWalkerId('empty') || oldestWalkerId(null);
    if (!victim) break;
    removeWalker(victim, 200);
  }
}

/* ---- Replace a walker with a trinket walker ---- */
async function replaceWithTrinket(trinketSrc, name, sourceId) {
  let victim = null;
  if (getEmptyCount() > 0) {
    victim = oldestWalkerId('empty');
  }
  if (!victim) {
    victim = oldestWalkerId(null);
  }
  if (victim) {
    await removeWalker(victim, 150);
  }
  spawnWalker(trinketSrc, { name, sourceId });
}

/* ---- API polling ---- */
async function fetchJSON(u){
  try{
    const r = await fetch(u, {
      headers: { "Accept": "application/json", "Cache-Control": "no-cache" },
      cache: "no-store"
    });
    if (!r.ok) throw new Error(`${u} -> ${r.status}`);
    return await r.json();
  }catch(e){
    DEBUG && console.warn("[street] fetch fail", u, e);
    return [];
  }
}

let seenTrinketIds = new Set();

/* Queue used by both polling and admin "replay" */
const pendingQueue = [];
let processingQueue = false;

function enqueueTrinket(id, name, src){
  pendingQueue.push({ id: id != null ? String(id) : null, name: name || "", src: src || "" });
  processQueueSoon();
}

function processQueueSoon(){
  if (processingQueue) return;
  processingQueue = true;
  // Slight delay to gather multiple enqueues and then stagger
  setTimeout(processPendingQueue, 60);
}

function processPendingQueue(){
  let delay = 0;
  const staggerStep = 200 + Math.random() * 150;
  while (pendingQueue.length) {
    const { id, name, src } = pendingQueue.shift();
    const normSrc = normalizeSrc(src);
    delay += staggerStep;
    setTimeout(() => replaceWithTrinket(normSrc, (name||"").trim(), id), delay);
  }
  processingQueue = false;
}

function idsFromRows(rows){
  const s = new Set();
  for (const r of rows) {
    const id = getRowId(r);
    if (id != null) s.add(String(id));
  }
  return s;
}

async function syncTrinkets(){
  const rows = await fetchJSON(LIST_URL);
  if (!Array.isArray(rows)) return;

  if (DEBUG) { console.groupCollapsed("[street] /api/trinkets (poll)"); console.table(rows); console.groupEnd(); }

  // Enqueue any new items from server that we haven't shown yet
  for (const row of rows) {
    const id  = getRowId(row);
    if (id == null) continue;
    const strId = String(id);

    if (seenTrinketIds.has(strId)) continue;

    const src = getRowSrc(row);
    if (!src) continue;

    const name = (getRowName(row) || "").trim();
    enqueueTrinket(strId, name, src);
  }

  // Prune any active trinket walkers whose sourceId no longer exists (deleted in admin)
  const currentIds = idsFromRows(rows);
  await pruneDeletedTrinkets(currentIds);

  // Refresh the seen set to what's on the server now
  seenTrinketIds = new Set(currentIds);
}

async function pruneDeletedTrinkets(currentIds){
  const toRemove = [];
  for (const [wid, rec] of walkers.entries()) {
    if (rec.type === 'trinket' && rec.sourceId) {
      if (!currentIds.has(String(rec.sourceId))) {
        toRemove.push(wid);
      }
    }
  }
  if (toRemove.length && DEBUG) console.log('[street] pruning deleted trinkets:', toRemove);

  for (const wid of toRemove) {
    await removeWalker(wid, 200);
  }
  ensurePopulation(); // keep the street at target
}

/* ---- Admin command intake (BroadcastChannel + localStorage queue) ---- */
function handleReplayTrinket(payload){
  if (!payload || !payload.trinket) return;
  const { id, name, src } = payload.trinket;
  // Always enqueue even if we've seen this id before (replay by design)
  enqueueTrinket(id, name, src);
}

try {
  const adminBC = new BroadcastChannel('admin-legs');
  adminBC.onmessage = async (ev) => {
    const msg = ev.data || {};
    if (DEBUG) console.log('[street] BC received:', msg);
    if (msg.type === 'spawn_leg') {
      if (getWalkerCount() < TARGET_LEGS) {
        spawnWalker(null, { name: "" });
      } else {
        DEBUG && console.log('[street] at capacity; ignoring spawn_leg');
      }
    } else if (msg.type === 'clear_legs') {
      const ids = Array.from(walkers.keys());
      for (const id of ids) await removeWalker(id, 150);
      ensurePopulation(); // refill with immortals to target
    } else if (msg.type === 'replay_trinket') {
      handleReplayTrinket(msg);
    }
  };
  DEBUG && console.log("[street] admin BroadcastChannel ready");
} catch {
  DEBUG && console.warn("[street] BroadcastChannel not supported");
}

// localStorage queue fallback
let processedCmdIds = new Set();

function pullLocalQueue() {
  try {
    const raw = localStorage.getItem('adminCmdQueue');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function processLocalQueue() {
  const cmds = pullLocalQueue();
  for (const cmd of cmds) {
    if (!cmd || !cmd._id || processedCmdIds.has(cmd._id)) continue;
    processedCmdIds.add(cmd._id);
    if (DEBUG) console.log('[street] localQueue received:', cmd);

    if (cmd.type === 'spawn_leg') {
      if (getWalkerCount() < TARGET_LEGS) {
        spawnWalker(null, { name: "" });
      } else {
        DEBUG && console.log('[street] at capacity; ignoring spawn_leg');
      }
    } else if (cmd.type === 'clear_legs') {
      (async () => {
        const ids = Array.from(walkers.keys());
        for (const id of ids) await removeWalker(id, 150);
        ensurePopulation();
      })();
    } else if (cmd.type === 'replay_trinket') {
      handleReplayTrinket(cmd);
    }
  }
  if (processedCmdIds.size > 2000) {
    processedCmdIds = new Set(Array.from(processedCmdIds).slice(-1000));
  }
}
window.addEventListener('storage', (e) => {
  if (e.key === 'adminCmdQueue') processLocalQueue();
});
setInterval(processLocalQueue, 1000);

/* ---- Boot ---- */
(async function start(){
  await measureBackground();
  ensurePopulation();         // start with TARGET_LEGS empty walkers (immortal)
  await syncTrinkets();
  setInterval(syncTrinkets, POLL_MS);
  // Also process any replays queued before first poll
  processQueueSoon();
  DEBUG && console.log("[street] ready; target legs:", TARGET_LEGS, "polling every", POLL_MS, "ms");
})();
