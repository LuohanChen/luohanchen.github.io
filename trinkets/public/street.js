// street.js — final version with fade-in/out, random spawn, updated attach points & scales.

const API_BASE = "";
const LIST_URL = `${API_BASE}/api/trinkets`;

const DEBUG = true;
const SHOW_BG_OUTLINE = false; // set true to visualize the bg clipping frame

/* ---------- Leg variants & attachment points ---------- */
const LEG_VARIANTS = [
  "assets/leg1_default.gif",
  "assets/leg1_bag.gif",
  "assets/leg1_sling.gif",
];

/* Attachment points (fractions of walker box, origin = top-left)
   x: +right / -left (auto-mirrored when moving left)
   y: down from top of the walker box */
const ATTACH_POINTS = {
  default: { x:  0,    y: 0.30 }, // middle of legs
  bag:     { x: -0.15, y: 0.18 }, // middle-left (bag)
  sling:   { x: -0.05, y: 0.20 }, // middle-top (sling)
};

/* Trinket size adjusters */
const GLOBAL_TRINKET_SCALE = 0.5; // overall size multiplier
const TRINKET_SCALES = {
  default: 0.3,
  bag:     0.4,
  sling:   0.3,
};

/* ---------- DOM setup ---------- */
let bgFrame = document.getElementById("bgFrame");
if (!bgFrame) {
  bgFrame = document.createElement("div");
  bgFrame.id = "bgFrame";
  document.body.appendChild(bgFrame);
}
let layer = document.getElementById("walkerLayer");
if (!layer) {
  layer = document.createElement("div");
  layer.id = "walkerLayer";
  bgFrame.appendChild(layer);
}

/* Optional outline (debug) */
let outline = document.getElementById("bgOutline");
if (!outline && SHOW_BG_OUTLINE) {
  outline = document.createElement("div");
  Object.assign(outline.style, {
    position: "fixed",
    pointerEvents: "none",
    border: "2px dashed rgba(255,0,0,.7)",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,.35)",
    zIndex: 9999,
  });
  document.body.appendChild(outline);
}

/* ---------- Background rect ---------- */
let bgRect = { left: 0, top: 0, width: 0, height: 0 };

function applyBgRect() {
  Object.assign(bgFrame.style, {
    position: "fixed",
    overflow: "hidden",
    pointerEvents: "none",
    left: `${bgRect.left}px`,
    top: `${bgRect.top}px`,
    width: `${bgRect.width}px`,
    height: `${bgRect.height}px`,
  });
  if (outline)
    Object.assign(outline.style, {
      left: `${bgRect.left}px`,
      top: `${bgRect.top}px`,
      width: `${bgRect.width}px`,
      height: `${bgRect.height}px`,
    });
}

function getViewportBox(el) {
  const w = el.clientWidth || document.documentElement.clientWidth;
  const h = el.clientHeight || document.documentElement.clientHeight;
  return { w, h };
}

function parseBgUrl() {
  const str = getComputedStyle(document.body).backgroundImage;
  if (!str || str === "none") return null;
  const m = str.match(/url\(["']?(.*?)["']?\)/i);
  return m ? m[1] : null;
}

function computeContainRect(imgW, imgH, boxW, boxH) {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const dispW = imgW * scale,
    dispH = imgH * scale;
  return {
    left: (boxW - dispW) / 2,
    top: (boxH - dispH) / 2,
    width: dispW,
    height: dispH,
  };
}

async function measureBackground() {
  const url = parseBgUrl();
  const { w, h } = getViewportBox(document.body);
  if (!url) {
    bgRect = { left: 0, top: 0, width: w, height: h };
    applyBgRect();
    return;
  }

  await new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      bgRect = computeContainRect(
        img.naturalWidth || 1,
        img.naturalHeight || 1,
        w,
        h
      );
      applyBgRect();
      res();
    };
    img.onerror = () => {
      bgRect = { left: 0, top: 0, width: w, height: h };
      applyBgRect();
      res();
    };
    img.src = url;
  });
}

/* ---------- Helpers ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
function normalizeSrc(t) {
  if (!t) return "";
  if (/^(data:|https?:|\/)/i.test(t)) return t;
  return t.startsWith("uploads/") ? `/${t}` : t;
}
const getRowId = (r) =>
  r?.id ?? r?._id ?? r?.uuid ?? r?.guid ?? r?.pk ?? JSON.stringify(r);
const getRowSrc = (r) =>
  r?.image_path ?? r?.image ?? r?.src ?? r?.drawing ?? "";
function variantKeyFromSrc(src) {
  if (/sling/i.test(src)) return "sling";
  if (/bag/i.test(src)) return "bag";
  return "default";
}

/* ---------- Walker ---------- */
function spawnWalker(trinketSrc) {
  const el = document.createElement("div");
  el.className = "walker";
  el.style.opacity = "0";
  layer.appendChild(el);

  const legSrc = pick(LEG_VARIANTS);
  const vKey = variantKeyFromSrc(legSrc);

  const leg = document.createElement("img");
  leg.className = "gif";
  leg.alt = "legs";
  leg.src = `${legSrc}?cb=${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
  el.appendChild(leg);

  let tr = null;
  if (trinketSrc) {
    tr = document.createElement("img");
    tr.className = "trinket";
    tr.alt = "trinket";
    tr.src = normalizeSrc(trinketSrc);
    const scale = (TRINKET_SCALES[vKey] ?? 1) * GLOBAL_TRINKET_SCALE;
    tr.style.setProperty("--scale", scale);
    el.appendChild(tr);
  }

  const size = el.offsetWidth || parseFloat(getComputedStyle(el).width) || 180;
  const ap = ATTACH_POINTS[vKey] || ATTACH_POINTS.default;
  const baseTX = size * ap.x;
  const baseTY = size * ap.y;

  let x = Math.random() * Math.max(0, bgRect.width - size);
  const yBase = bgRect.height * 0.70;
  let y = clamp(
    yBase + (Math.random() * 0.2 - 0.1) * bgRect.height,
    0,
    bgRect.height - size - 10
  );

  let vx = (Math.random() < 0.5 ? 1 : -1) * (20 + Math.random() * 15);
  let vy = (Math.random() * 2 - 1) * 4;
  let last = performance.now();

  // fade in
  requestAnimationFrame(() => (el.style.opacity = "1"));

  // fade out & remove after 2 minutes
  setTimeout(() => {
    el.style.transition = "opacity 2s ease-in";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 2200);
  }, 120000);

  function step(t) {
    const now = t || performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    x += vx * dt;
    y += vy * dt;
    vy += (Math.random() * 2 - 1) * 2 * dt;
    vy *= 0.98;

    leg.style.transform = `translateX(-50%) scaleX(${vx < 0 ? -1 : 1})`;
    if (tr) {
      const tx = vx < 0 ? -baseTX : baseTX;
      tr.style.setProperty("--tx", `${tx}px`);
      tr.style.setProperty("--ty", `${baseTY}px`);
    }

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
    }
    if (x >= bgRect.width - size) {
      x = bgRect.width - size;
      vx = -Math.abs(vx);
    }
    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
    }
    if (y >= bgRect.height - size) {
      y = bgRect.height - size;
      vy = -Math.abs(vy);
    }

    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Sync ---------- */
async function fetchJSON(u) {
  try {
    const r = await fetch(u, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`${u} -> ${r.status}`);
    return await r.json();
  } catch (e) {
    DEBUG && console.warn("[street] fetch fail", u, e);
    return [];
  }
}

const seenTrinketIds = new Set();
async function syncTrinkets() {
  const rows = await fetchJSON(LIST_URL);
  if (!Array.isArray(rows)) return;
  if (DEBUG) {
    console.groupCollapsed("[street] /api/trinkets");
    console.table(rows);
    console.groupEnd();
  }
  let delay = 0,
    stagger = 300 + Math.random() * 200;
  for (const row of rows) {
    const id = getRowId(row);
    if (seenTrinketIds.has(id)) continue;
    const src = normalizeSrc(getRowSrc(row));
    if (!src) continue;
    seenTrinketIds.add(id);
    delay += stagger;
    setTimeout(() => spawnWalker(src), delay);
  }
}

/* ---------- Resize ---------- */
addEventListener("resize", () => {
  clearTimeout(window._bgR);
  window._bgR = setTimeout(measureBackground, 120);
});

/* ---------- Boot ---------- */
(async function start() {
  await measureBackground();
  await syncTrinkets();
  setInterval(syncTrinkets, 2000);
  DEBUG && console.log("[street] ready");
})();
