(() => {
  const loading  = document.getElementById('loading');
  const studio   = document.getElementById('studio');
  const row      = document.getElementById('imageRow');
  const images   = document.querySelectorAll('#imageRow img');
  const overlay  = document.querySelector('.overlay');
  const titleEl  = document.getElementById('title');
  const subEl    = document.getElementById('subtitle');

  titleEl.textContent = 'Trinkets';
  subEl.textContent   = 'The stories we carry';

  const timeouts = [];
  const wait = (ms) => new Promise(res => {
    const id = setTimeout(res, ms);
    timeouts.push(id);
  });
  function clearAllTimeouts() {
    for (const id of timeouts) clearTimeout(id);
    timeouts.length = 0;
  }

  function showStudio({ instant = false } = {}) {
    clearAllTimeouts();
    removeSkipListeners();

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

// Skip
  function skipNow(e) {
    e?.preventDefault?.();
    showStudio({ instant: true });
  }

  function addSkipListeners() {
    window.addEventListener('click', skipNow, { passive: false, once: true });
    window.addEventListener('keydown', skipNow, { passive: false, once: true });
    window.addEventListener('touchstart', skipNow, { passive: false, once: true });
  }
  function removeSkipListeners() {
    window.removeEventListener('click', skipNow, { passive: false });
    window.removeEventListener('keydown', skipNow, { passive: false });
    window.removeEventListener('touchstart', skipNow, { passive: false });
  }

  window.addEventListener('DOMContentLoaded', async () => {
    addSkipListeners();

    const STEP = 350; //img stagger delay
    images.forEach((img, i) => {
      const id = setTimeout(() => img.classList.add('show'), i * STEP);
      timeouts.push(id);
    });

    await wait(images.length * STEP + 300);
    row.classList.add('fade-out');

    await wait(500);
    overlay.classList.add('show');

// Text Hold
    await wait(1600);

    loading.style.opacity = '0';
    await wait(900);
    showStudio({ instant: false });
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

  submit?.addEventListener('click', () => {
  const drawing = stage.toDataURL({ pixelRatio: 2 });
  const name    = document.getElementById('trinketName')?.value || '';
  const text    = document.getElementById('trinketText')?.value || '';
  console.log('Submitted:', { name, text, drawing });
  alert('Your trinket has been submitted! (check console)');
});

  submit?.addEventListener('click', () => {
    const drawing = stage.toDataURL({ pixelRatio: 2 });
    const text    = document.getElementById('trinketText')?.value || '';
    console.log('Submitted:', { drawing, text });
    alert('Your trinket has been submitted! (check console)');
  });
})();
