// street.js
// Desynced walkers + support for "plain leggies" from /api/leggies.

const API_BASE = "";
const LIST_URL = `${API_BASE}/api/trinkets`;
const LEGGIES_URL = `${API_BASE}/api/leggies`;

let layer = document.getElementById("walkerLayer");
if (!layer) {
  layer = document.createElement("div");
  layer.id = "walkerLayer";
  document.body.appendChild(layer);
}

/* ---------- TUNABLES ---------- */
// Visibility band (keeps body offscreen; increases to move legs down)
const MIN_VISIBLE = 1220;
const MAX_VISIBLE = 1260;
const GLOBAL_DROP = 24;

// Speed range (px/s)
const SPEED_MIN = 30;
const SPEED_MAX = 120;

// Vertical wiggle range (px/s baseline; randomized per walker)
const VY_MIN = -18;
const VY_MAX = 18;

// Stagger new spawns (ms)
const STAGGER_MIN = 3000;
const STAGGER_MAX = 5000;

// Leggy scale (CSS fallback; can also override in CSS via --leggy-scale)
const DEFAULT_SCALE = 8;
/* -------------------------------- */

const seenTrinketIds = new Set();
const seenLeggyIds = new Set();
const walkers = []; // { el,x,y,w,h,vx,vy,dir,phase,phaseSpeed,bounds:{minY,maxY}, id, kind }

function env() { return { W: innerWidth, H: innerHeight }; }
function rand(a, b) { return Math.random() * (b - a) + a; }
function normalizeSrc(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (t.startsWith("http") || t.startsWith("/")) return t;
  return t.startsWith("uploads/") ? `/${t}` : t;
}

function buildWalkerElement(trinketSrc) {
  const el = document.createElement("div");
  el.className = "walker";
  el.style.setProperty("--leggy-scale", `${DEFAULT_SCALE}`);

  // main gif
  const gif = document.createElement("img");
  gif.className = "gif";
  gif.src = `assets/leggy1.gif?cb=${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`; // cache-bust for desynced gif loops
  gif.alt = "walker";

  el.appendChild(gif);

  if (trinketSrc) {
    const tr = document.createElement("img");
    tr.className = "trinket";
    tr.src = trinketSrc;
    tr.alt = "Trinket";
    tr.style.setProperty("--offset-x", `${Math.round((Math.random() - 0.5) * 30)}px`);
    tr.style.setProperty("--offset-y", `${Math.round((Math.random() - 0.5) * 20) - 10}px`);
    el.appendChild(tr);
  }

  // subtle pulse (desynced)
  el.style.animationDelay = `${-Math.floor(rand(0, 2000))}ms`;

  layer.appendChild(el);
  return { el, gif };
}

function computeBand(w) {
  const minY = -w.h + MIN_VISIBLE + GLOBAL_DROP;
  const maxY = -w.h + MAX_VISIBLE + GLOBAL_DROP;
  w.bounds = { minY, maxY };
  if (w.y < minY) w.y = minY;
  if (w.y > maxY) w.y = maxY;
}

function createWalker({ trinketSrc = null, id, kind = "trinket" }) {
  const { el, gif } = buildWalkerElement(trinketSrc);

  let w = 180, h = 180;
  const measure = () => {
    const r = gif.getBoundingClientRect();
    if (r.width && r.height) { w = r.width; h = r.height; }
  };
  measure();

  const fromLeft = Math.random() < 0.5;
  const speed = rand(SPEED_MIN, SPEED_MAX) * (fromLeft ? 1 : -1);
  const baseVy = rand(VY_MIN, VY_MAX);
  const phase = rand(0, Math.PI * 2);
  const phaseSpeed = rand(0.4, 1.2);

  const { W } = env();
  const startX = fromLeft ? -w - 20 : W + 20;
  let startY = -h + (MIN_VISIBLE + MAX_VISIBLE) / 2 + GLOBAL_DROP;

  const walker = {
    el, x: startX, y: startY, w, h,
    vx: speed, vy: baseVy,
    dir: fromLeft ? 1 : -1,
    phase, phaseSpeed,
    bounds: { minY: -h + MIN_VISIBLE + GLOBAL_DROP, maxY: -h + MAX_VISIBLE + GLOBAL_DROP },
    id, kind
  };

  // finalize after gif load
  gif.addEventListener("load", () => {
    measure();
    walker.w = w; walker.h = h;
    computeBand(walker);
    walker.y = rand(walker.bounds.minY, walker.bounds.maxY);
    place(walker, true);
    requestAnimationFrame(() => el.classList.add("show"));
  });

  computeBand(walker);
  walker.y = rand(walker.bounds.minY, walker.bounds.maxY);

  // Stagger appearance so walkers don't all move at once
  const appearDelay = Math.floor(rand(100, 1800));
  setTimeout(() => {
    place(walker, true);
    el.classList.add("show");
  }, appearDelay);

  walkers.push(walker);
  return walker;
}

function place(w, instant = false) {
  const t = `translate3d(${w.x}px, ${w.y}px, 0) scale(${w.dir < 0 ? -1 : 1}, 1)`;
  if (instant) {
    w.el.style.transition = "none";
    w.el.style.transform = t;
    requestAnimationFrame(() => (w.el.style.transition = ""));
  } else {
    w.el.style.transform = t;
  }
}

let last = performance.now();
function tick(now = performance.now()) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const { W } = env();

  for (const w of walkers) {
    // wiggle by sine with per-walker offset
    w.phase += w.phaseSpeed * dt;
    const wiggle = Math.sin(w.phase) * rand(6, 10);
    w.x += w.vx * dt;
    w.y += (w.vy * 0.2 + wiggle) * dt;

    if (w.y < w.bounds.minY) { w.y = w.bounds.minY; w.vy *= -1; }
    if (w.y > w.bounds.maxY) { w.y = w.bounds.maxY; w.vy *= -1; }

    // horizontal bounce offscreen edges
    if (w.x < -w.w - 60) { w.x = -w.w - 60; w.vx *= -1; w.dir *= -1; }
    if (w.x > W + 60) { w.x = W + 60; w.vx *= -1; w.dir *= -1; }

    place(w);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// --- Helper for staggered spawn ---
function staggerSpawn(fn) {
  const delay = Math.floor(rand(STAGGER_MIN, STAGGER_MAX));
  setTimeout(fn, delay);
}

// ---------- POLLING ----------
async function fetchJSON(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch {
    return [];
  }
}

async function syncTrinkets() {
  const rows = await fetchJSON(LIST_URL);
  for (const row of rows) {
    if (seenTrinketIds.has(row.id)) continue;
    seenTrinketIds.add(row.id);
    const src = normalizeSrc(row.image_path);
    staggerSpawn(() =>
      createWalker({ trinketSrc: src, id: row.id, kind: "trinket" })
    );
  }
}

async function syncLeggies() {
  const rows = await fetchJSON(LEGGIES_URL);
  for (const r of rows) {
    if (seenLeggyIds.has(r.id)) continue;
    seenLeggyIds.add(r.id);
    staggerSpawn(() =>
      createWalker({ trinketSrc: null, id: r.id, kind: "leggy" })
    );
  }
}

function resync() {
  syncTrinkets();
  syncLeggies();
}
resync();
setInterval(resync, 3000);

// Recompute band on resize
let rz;
addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    for (const w of walkers) {
      computeBand(w);
      place(w, true);
    }
  }, 120);
});
  