(() => {
  const loading  = document.getElementById('loading');
  const studio   = document.getElementById('studio');
  const row      = document.getElementById('imageRow');
  const images   = Array.from(document.querySelectorAll('#imageRow img'));
  const overlay  = document.querySelector('.overlay');
  const titleEl  = document.getElementById('title');
  const subEl    = document.getElementById('subtitle');
  titleEl.textContent = 'Trinkets';
  subEl.textContent   = 'The stories we carry';
  const timeouts = [];
  const wait = (ms) => new Promise(res => { const id = setTimeout(res, ms); timeouts.push(id); });
  function clearAllTimeouts() { timeouts.forEach(clearTimeout); timeouts.length = 0; }

  // Skip
  function showStudio({ instant = false } = {}) {
    clearAllTimeouts();
    removeSkip();
    removeTilt();

    if (instant) {
      loading.style.transition = 'none';
      loading.style.opacity = '0';
      loading.style.display = 'none';
    } else {
      loading.style.opacity = '0';
      const id = setTimeout(() => { loading.style.display = 'none'; }, 900);
      timeouts.push(id);
    }
    studio.classList.remove('hidden');
    document.body.style.overflow = 'auto';
  }
  function skipNow(e){ e?.preventDefault?.(); showStudio({ instant:true }); }
  function addSkip(){
    window.addEventListener('click', skipNow, { passive:false, once:true });
    window.addEventListener('keydown', skipNow, { passive:false, once:true });
    window.addEventListener('touchstart', skipNow, { passive:false, once:true });
  }
  function removeSkip(){
    window.removeEventListener('click', skipNow, { passive:false });
    window.removeEventListener('keydown', skipNow, { passive:false });
    window.removeEventListener('touchstart', skipNow, { passive:false });
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafQueued = false;
  let lastPointer = { x: window.innerWidth/2, y: window.innerHeight/2 };

  function onPointerMove(e){
    if (prefersReduced) return;
    const t = e.touches?.[0] || e;
    lastPointer.x = t.clientX;
    lastPointer.y = t.clientY;
    if (!rafQueued){
      rafQueued = true;
      requestAnimationFrame(applyTilts);
    }
  }
  function applyTilts(){
    rafQueued = false;
    const maxDeg = 14;
    for (const img of images){
      const r = img.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top  + r.height/2;
      const dx = (lastPointer.x - cx) / Math.max(r.width, 1);
      const dy = (lastPointer.y - cy) / Math.max(r.height, 1);
      const ry = Math.max(-1, Math.min(1, dx)) * maxDeg;
      const rx = Math.max(-1, Math.min(1, -dy)) * maxDeg;
      img.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      img.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    }
  }
  function addTilt(){
    if (prefersReduced) return;
    window.addEventListener('mousemove', onPointerMove, { passive:true });
    window.addEventListener('touchmove', onPointerMove, { passive:true });
    applyTilts();
  }
  function removeTilt(){
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    images.forEach(img => {
      img.style.removeProperty('--rx');
      img.style.removeProperty('--ry');
    });
  }

  // title font
  function flashTitleFonts(el, { step = 500, duration = 2000 } = {}){
    if (!el) return;
    const FINAL = '"Bitter", serif';
    if (prefersReduced) { el.style.fontFamily = FINAL; return; }

    const FONTS = [
      '"Cossette Titre", sans-serif',
      '"Bitcount Grid Double", system-ui',
      '"League Script", cursive',
      '"UnifrakturMaguntia", cursive'
    ];
    let i = 0;
    const tick = () => {
      el.style.fontFamily = FONTS[i % FONTS.length];
      i++;
    };
    tick();
    const swap = setInterval(tick, step);
    setTimeout(() => { clearInterval(swap); el.style.fontFamily = FINAL; }, duration);
  }

  window.addEventListener('DOMContentLoaded', async () => {
    addSkip();
    addTilt();

    const STEP = 600;
    images.forEach((img, i) => {
      const id = setTimeout(() => img.classList.add('show'), i * STEP);
      timeouts.push(id);
    });

    await wait(images.length * STEP + 300);
    row.classList.add('fade-out');
    removeTilt();
    await wait(500);
    overlay.classList.add('show');
    flashTitleFonts(titleEl, { step: 500, duration: 2000 });
    await wait(3500);
    loading.style.opacity = '0';
    await wait(1000);
    showStudio({ instant:false });
  });
})();

// Konva
(() => {
  const stageHost = document.getElementById('konvaStage');
  if (!stageHost || !window.Konva) return;

  const BASE_W = 1200, BASE_H = 800;

  const stage = new Konva.Stage({
    container: stageHost,
    width: stageHost.clientWidth,
    height: stageHost.clientHeight,
  });

  const layer   = new Konva.Layer();
  const content = new Konva.Group();
  stage.add(layer);
  layer.add(content);

  function fitStage() {
    const cw = stageHost.clientWidth, ch = stageHost.clientHeight;
    stage.size({ width: cw, height: ch });
    const s = Math.min(cw / BASE_W, ch / BASE_H);
    content.scale({ x: s, y: s });
    content.position({ x: (cw - BASE_W * s) / 2, y: (ch - BASE_H * s) / 2 });
    layer.batchDraw();
  }
  fitStage();
  window.addEventListener('resize', fitStage);

  // Tools
  const colorEl = document.getElementById('brushColor');
  const sizeEl  = document.getElementById('brushSize');
  const clearEl = document.getElementById('clearCanvas');
  const saveEl  = document.getElementById('savePNG');
  const submit  = document.getElementById('submitTrinket');

  let painting = false, line = null;

  function localPointer() {
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    const inv = content.getAbsoluteTransform().copy().invert();
    return inv.point(pos);
  }

  function start() {
    painting = true;
    const { x, y } = localPointer();
    line = new Konva.Line({
      points: [x, y],
      stroke: colorEl?.value || '#111',
      strokeWidth: Number(sizeEl?.value || 6),
      lineCap: 'round',
      lineJoin: 'round',
    });
    content.add(line);
    layer.batchDraw();
  }
  function move() {
    if (!painting || !line) return;
    const { x, y } = localPointer();
    line.points(line.points().concat([x, y]));
    layer.batchDraw();
  }
  function end() { painting = false; line = null; }

  stage.on('mousedown touchstart', start);
  stage.on('mousemove touchmove', move);
  stage.on('mouseup touchend touchcancel', end);

  clearEl?.addEventListener('click', () => {
    content.destroyChildren();
    layer.draw();
  });

  saveEl?.addEventListener('click', () => {
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'my-trinket.png';
    a.click();
  });

  // buttons
submit?.addEventListener('click', async () => {
  const drawing = stage.toDataURL({ pixelRatio: 2 });
  const name    = document.getElementById('trinketName')?.value || '';
  const text    = document.getElementById('trinketText')?.value || '';

  try {
    const res = await fetch('/api/trinkets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, story: text, drawing })
    });
    if (!res.ok) throw new Error('Failed to submit');
    const saved = await res.json();

    // Option A: redirect to the street page immediately
    window.location.href = '/street.html';

    // Option B: or go to a single item view if you add it later:
    // window.location.href = `/street.html?id=${saved.id}`;
  } catch (e) {
    alert('Sorry, failed to submit your trinket.');
    console.error(e);
  }
});
})();
