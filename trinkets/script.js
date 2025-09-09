(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // CONTROLS
  const WORLD_SCALE = 2;
  const SPREAD_MULT = 2;
  const MAX_PARALLAX = 48;
  const LERP_FACTOR = 0.05;


  function hash32(str){
    let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = (h1 ^ (h2 >>> 7)) >>> 0;
    return h1 >>> 0;
  }
  function mulberry32(a){
    let t = a >>> 0;
    return function(){
      t |= 0; t = (t + 0x6D2B79F5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  const imgs = Array.from(hero.querySelectorAll('img'));
  const fileSig = imgs.map(img => img.getAttribute('src') || '').join('|');
  const RNG = mulberry32(hash32('TRINKETS_SALT_v14::' + fileSig));

  const tiles = [];
  imgs.forEach((img) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const dRand = RNG() * 2 - 1; // -1..1
    const depth = (0.2 + 0.7 * Math.abs(dRand)) * Math.sign(dRand || 1);
    tile.dataset.depth = depth.toFixed(3);
    img.replaceWith(tile);
    tile.appendChild(img);
    tiles.push(tile);
  });

  const pxToNum = v => Number(String(v).replace('px','')) || 0;
  const readVars = () => {
    const cs = getComputedStyle(document.documentElement);
    return {
      tileSize: pxToNum(cs.getPropertyValue('--tile-size')),
      gap: pxToNum(cs.getPropertyValue('--gap')),
      pad: pxToNum(cs.getPropertyValue('--canvas-pad')),
    };
  };

  let basePositions = [];
  let world = { w: 0, h: 0 };
  let view  = { w: 0, h: 0 };

  function placeDeterministic() {
    const { tileSize, gap, pad } = readVars();
    const rect = hero.getBoundingClientRect();
    const W = rect.width, H = rect.height;

    view.w = Math.max(0, W - pad * 2);
    view.h = Math.max(0, H - pad * 2);
    world.w = Math.max(view.w, view.w * WORLD_SCALE);
    world.h = Math.max(view.h, view.h * WORLD_SCALE);
    const baseMin = tileSize + gap * 0.5;
    const minDist = baseMin * SPREAD_MULT;
    const maxAttempts = 400;

    function ok(x, y, md){
      const cx = x + tileSize / 2;
      const cy = y + tileSize / 2;
      const md2 = md * md;
      for (const p of basePositions){
        const dx = (p.x + tileSize/2) - cx;
        const dy = (p.y + tileSize/2) - cy;
        if (dx*dx + dy*dy < md2) return false;
      }
      return true;
    }

    basePositions = [];
    for (let i = 0; i < tiles.length; i++){
      let x = 0, y = 0, placed = false, attempts = 0;
      let localMin = minDist;

      while (!placed && attempts < maxAttempts){
        x = Math.floor(RNG() * (world.w - tileSize));
        y = Math.floor(RNG() * (world.h - tileSize));
        if (ok(x, y, localMin)) { placed = true; break; }
        attempts++;
        if (attempts === 150) localMin *= 0.94;
        if (attempts === 250) localMin *= 0.90;
      }

      if (!placed){
        let r = gap, angle = 0;
        for (let k = 0; k < 360; k++){
          angle += Math.PI / 12; r += 2;
          const cx = Math.max(0, Math.min(x + Math.cos(angle) * r, world.w - tileSize));
          const cy = Math.max(0, Math.min(y + Math.sin(angle) * r, world.h - tileSize));
          if (ok(cx, cy, minDist * 0.85)) { x = cx; y = cy; placed = true; break; }
        }
      }

      basePositions.push({ x: Math.round(x), y: Math.round(y) });
    }

    applyTransforms(true);
  }

  let pointer = { x: 0.5, y: 0.5 };
  let target  = { x: 0.5, y: 0.5 };

  function setTargetFromEvent(e){
    const rect = hero.getBoundingClientRect();
    let cx, cy;
    if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }
    const x = Math.min(Math.max(cx - rect.left, 0), rect.width);
    const y = Math.min(Math.max(cy - rect.top, 0), rect.height);
    target.x = rect.width  ? x / rect.width  : 0.5;
    target.y = rect.height ? y / rect.height : 0.5;
  }

  hero.addEventListener('mousemove', setTargetFromEvent, { passive: true });
  hero.addEventListener('touchstart', setTargetFromEvent, { passive: true });
  hero.addEventListener('touchmove', setTargetFromEvent, { passive: true });
  function applyTransforms(initial = false){
    if (!initial){
      pointer.x += (target.x - pointer.x) * LERP_FACTOR;
      pointer.y += (target.y - pointer.y) * LERP_FACTOR;
    }

    const { pad } = readVars();
    const camX = (world.w - view.w) * pointer.x;
    const camY = (world.h - view.h) * pointer.y;

    const ox = pointer.x - 0.5;
    const oy = pointer.y - 0.5;

    for (let i = 0; i < tiles.length; i++){
      const tile = tiles[i];
      const base = basePositions[i] || { x:0, y:0 };
      const depth = parseFloat(tile.dataset.depth) || 0;

      const sx = base.x - camX + pad;
      const sy = base.y - camY + pad;

      const px = -ox * MAX_PARALLAX * depth;
      const py = -oy * MAX_PARALLAX * depth;

      tile.style.transform = `translate3d(${(sx+px).toFixed(2)}px, ${(sy+py).toFixed(2)}px, 0)`;
    }
  }

  function tick(){
    applyTransforms();
    requestAnimationFrame(tick);
  }

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyReduced(){
    if (mq.matches){
      tiles.forEach((t,i) => {
        const { pad } = readVars();
        const base = basePositions[i] || {x:0,y:0};
        const x = base.x - (world.w - view.w)/2 + pad;
        const y = base.y - (world.h - view.h)/2 + pad;
        t.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      hero.removeEventListener('mousemove', setTargetFromEvent);
      hero.removeEventListener('touchstart', setTargetFromEvent);
      hero.removeEventListener('touchmove', setTargetFromEvent);
      return true;
    }
    return false;
  }
  mq.addEventListener?.('change', () => {
    if (!applyReduced()) requestAnimationFrame(tick);
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { placeDeterministic(); }, 120);
  });

  placeDeterministic();
  if (!applyReduced()) requestAnimationFrame(tick);
})();

(() => {
  // Smooth scroll to studio
  const btn = document.getElementById('gotoStudio');
  const studio = document.getElementById('studio');
  if (btn && studio) {
    btn.addEventListener('click', () => {
      studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // --- Konva setup ---
  const stageHost = document.getElementById('konvaStage');
  if (!stageHost || !window.Konva) return;

  // Internal logical drawing resolution
  const BASE_W = 1200;
  const BASE_H = 800;

  // Stage matches the host's current pixel size (no CSS transforms!)
  const stage = new Konva.Stage({
    container: stageHost,
    width: stageHost.clientWidth,
    height: stageHost.clientHeight,
  });

  // One layer, one "content" group that we scale/position to fit
  const layer = new Konva.Layer();
  stage.add(layer);

  const content = new Konva.Group();
  layer.add(content);

  // Helper: fit content group into the host
  function fitStage() {
    const cw = stageHost.clientWidth;
    const ch = stageHost.clientHeight;

    stage.size({ width: cw, height: ch });

    const scale = Math.min(cw / BASE_W, ch / BASE_H);
    content.scale({ x: scale, y: scale });

    // Center the content group within the stage
    const ox = (cw - BASE_W * scale) / 2;
    const oy = (ch - BASE_H * scale) / 2;
    content.position({ x: ox, y: oy });

    layer.batchDraw();
  }

  fitStage();
  window.addEventListener('resize', fitStage);

  // Tools
  const colorEl = document.getElementById('brushColor');
  const sizeEl  = document.getElementById('brushSize');
  const clearEl = document.getElementById('clearCanvas');
  const saveEl  = document.getElementById('savePNG');

  let isPainting = false;
  let currentLine = null;

  // Convert screen pointer -> content (logical) coordinates
  function getPointerPosInContent() {
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };

    // Invert the group's absolute transform to map to its local space
    const transform = content.getAbsoluteTransform().copy().invert();
    const pt = transform.point(pos);
    // Clamp to canvas bounds (optional)
    return {
      x: Math.max(0, Math.min(pt.x, BASE_W)),
      y: Math.max(0, Math.min(pt.y, BASE_H)),
    };
  }

  function startLine() {
    isPainting = true;
    const { x, y } = getPointerPosInContent();
    currentLine = new Konva.Line({
      points: [x, y],
      stroke: colorEl?.value || '#111',
      strokeWidth: Number(sizeEl?.value || 6),
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0,
    });
    content.add(currentLine);
    layer.batchDraw();
  }

  function extendLine() {
    if (!isPainting || !currentLine) return;
    const { x, y } = getPointerPosInContent();
    const pts = currentLine.points();
    pts.push(x, y);
    currentLine.points(pts);
    layer.batchDraw();
  }

  function endLine() {
    isPainting = false;
    currentLine = null;
  }

  stage.on('mousedown touchstart', startLine);
  stage.on('mousemove touchmove', extendLine);
  stage.on('mouseup touchend touchcancel', endLine);

  // Clear & Save
  clearEl?.addEventListener('click', () => {
    content.destroyChildren();
    layer.batchDraw();
  });

  saveEl?.addEventListener('click', () => {
    // Render only the content group area at base resolution
    const dataURL = stage.toDataURL({
      x: content.x(),
      y: content.y(),
      width: BASE_W * content.scaleX(),
      height: BASE_H * content.scaleY(),
      pixelRatio: 1 / content.scaleX(), // export at logical BASE_*
    });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'my-trinket.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // --- Submit button (if you added it) ---
  const submitBtn = document.getElementById('submitTrinket');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const drawing = stage.toDataURL({
        x: content.x(),
        y: content.y(),
        width: BASE_W * content.scaleX(),
        height: BASE_H * content.scaleY(),
        pixelRatio: 1 / content.scaleX(),
      });
      const text = document.getElementById('trinketText')?.value || '';
      console.log('Submitted Trinket:', { drawing, text });
      alert('Your trinket has been submitted! (Check console for data)');
    });
  }
})();