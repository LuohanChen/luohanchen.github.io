// ------------ Start screen + sequence + floating images ------------
(() => {
  const loading     = document.getElementById('loading');
  const studio      = document.getElementById('studio');
  const startBtn    = document.getElementById('startBtn');
  const startTitle  = document.getElementById('startTitle');
  const seqWrap     = document.getElementById('sequence');
  const storiesWord = document.getElementById('storiesWord');
  const finalPrompt = document.getElementById('finalPrompt');
  const floatLayer  = document.getElementById('floatLayer');

  // Typewriter timings (working version)
  const WORDS = ["our passions", "our love", "our friendships", "our fight"];
  const TYPE_SPEED       = 90;
  const ERASE_SPEED      = 65;
  const HOLD_AFTER_TYPE  = 900;
  const HOLD_AFTER_ERASE = 350;
  const FINAL_HOLD       = 1300;

  // Fades (working version)
  const FADE_OUT_FIRST_MS = 900;
  const FADE_IN_SECOND_MS = 1000;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const IMAGE_SRCS = [
    "image/feature1square.jpg",
    "image/feature2square.jpg",
    "image/feature3square.jpg",
    "image/feature4square.jpg",
    "image/feature5square.jpg",
    "image/feature6square.jpg",
    "image/feature7square.jpg",
    "image/feature8square.jpg",
  ];

function makeShuffler(items) {
  let pool = [];
  function refill() {
    pool = items.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  refill();
  return function next() {
    if (pool.length === 0) refill();
    return pool.pop();
  };
}


  // --- Skip / guard flags ---
  let hasEnteredStudio = false;
  let skipRequested = false;

function revealStudio() {
  loading.style.opacity = '0';
  setTimeout(() => {
    loading.classList.add('hidden');
    studio.classList.remove('hidden');
    studio.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'auto';

    // NEW: ensure Konva measures AFTER the studio is visible
    if (window.__konvaEnsure) {
      window.__konvaEnsure();
      // safety: call again next frame in case of CSS transitions/layout settling
      requestAnimationFrame(window.__konvaEnsure);
    }
  }, 720);
}

  function fadeOut(el, ms) {
    if (ms) el.style.setProperty('--fade-ms', `${ms}ms`);
    el.classList.add('fade-out');
    el.classList.remove('fade-in');
  }
  function fadeIn(el, ms) {
    if (ms) el.style.setProperty('--fade-ms', `${ms}ms`);
    el.classList.add('fade-in');
    el.classList.remove('fade-out','hidden');
  }

  // Floating images (fade-in on first paint)
function startFloatingImages() {
  if (!floatLayer) return;

  // --- Responsiveness buckets ---
  const W = window.innerWidth;
  const isSmall  = W < 640;
  const isMedium = W >= 640 && W < 1024;
  const isLarge  = W >= 1024;

  // Count: fewer sprites overall -> feels less "repeating"
  const count = isSmall ? 5 : isMedium ? 8 : 11;

  // Size ranges (smaller on small screens)
  const sizeMin = isSmall ? 90  : isMedium ? 130 : 180;
  const sizeMax = isSmall ? 150 : isMedium ? 220 : 360;

  // Slower float (longer durations = each image repeats less often)
  const durMin  = isSmall ? 36 : isMedium ? 48 : 60;   // seconds
  const durMax  = isSmall ? 65 : isMedium ? 80 : 110;

  // Use shuffler so initial sprites don't repeat the same src too quickly
  const nextSrc = makeShuffler(IMAGE_SRCS);

  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.className = 'float-img';
    img.src = nextSrc();

    // Responsive size
    const size = Math.round(randBetween(sizeMin, sizeMax));
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    // Random vertical lane (keep away from edges a bit)
    img.style.top = `${randBetween(4, 92)}%`;

    // Slow, varied duration; negative delay so some are already mid-flight
    const dur = randBetween(durMin, durMax);
    const delay = -randBetween(0, dur); // spread across full duration window
    img.style.animation = `floatLeft ${dur}s linear infinite`;
    img.style.animationDelay = `${delay}s`;

    // Append at opacity:0 (CSS), then force reflow and show (Approach A)
    floatLayer.appendChild(img);
    void img.offsetWidth;            // <-- force reflow
    img.classList.add('visible');    // <-- triggers the CSS fade to 1

    // On each loop: randomize lane and duration a bit; keep opacity 1
    img.addEventListener('animationiteration', () => {
      img.style.top = `${randBetween(4, 92)}%`;

      // Slightly vary size each pass (still responsive)
      const nsize = Math.round(randBetween(sizeMin, sizeMax));
      img.style.width = `${nsize}px`;
      img.style.height = `${nsize}px`;

      // Re-randomize duration so repeats stay unpredictable (and slower)
      const ndur = randBetween(durMin, durMax);
      img.style.animationDuration = `${ndur}s`;
    });
  }
}




  function randBetween(min, max) { return Math.random() * (max - min) + min; }
  function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

  // Typewriter
  async function typeWord(el, text) {
    for (let i = 1; i <= text.length; i++) {
      if (skipRequested) return;
      el.textContent = text.slice(0, i);
      await wait(TYPE_SPEED);
    }
    await wait(HOLD_AFTER_TYPE);
    for (let i = text.length; i >= 0; i--) {
      if (skipRequested) return;
      el.textContent = text.slice(0, i);
      await wait(ERASE_SPEED);
    }
    await wait(HOLD_AFTER_ERASE);
  }

  // Main sequence
  async function runSequence() {
    if (skipRequested) return revealStudio();

    // Hide the button & hint
    startBtn.style.pointerEvents = 'none';
    startBtn.classList.add('fade-out');
    document.querySelector('.start-hint')?.classList.add('fade-out');
    setTimeout(() => {
      startBtn.classList.add('hidden');
      document.querySelector('.start-hint')?.classList.add('hidden');
    }, 300);

    if (!prefersReduced) startFloatingImages();

    // Fade out first sentence
    fadeOut(startTitle, FADE_OUT_FIRST_MS);
    await wait(FADE_OUT_FIRST_MS + 50);
    if (skipRequested) return revealStudio();
    startTitle.classList.add('hidden');

    // Fade in "Stories of:"
    seqWrap.classList.remove('hidden');
    seqWrap.setAttribute('aria-hidden', 'false');
    fadeIn(seqWrap, FADE_IN_SECOND_MS);
    await wait(FADE_IN_SECOND_MS + 50);
    if (skipRequested) return revealStudio();

    if (prefersReduced) {
      for (const w of WORDS) {
        if (skipRequested) return revealStudio();
        storiesWord.textContent = w;
        await wait(900);
      }
    } else {
      for (const w of WORDS) {
        if (skipRequested) return revealStudio();
        await typeWord(storiesWord, w);
      }
    }

    // Final prompt
    storiesWord.textContent = '';
    fadeOut(seqWrap);
    await wait(450);
    if (skipRequested) return revealStudio();
    seqWrap.classList.add('hidden');

    finalPrompt.classList.remove('hidden');
    fadeIn(finalPrompt, 700);
    await wait(FINAL_HOLD);
    if (skipRequested) return revealStudio();

    fadeOut(finalPrompt, 500);
    await wait(550);
    revealStudio();
  }

  // ----------- Interceptors: skip on ANY interaction EXCEPT Start -----------
  function requestSkipToStudio(e) {
    if (hasEnteredStudio) return;

    // Allow the Start button to play the sequence:
    const isStartClick =
      e &&
      (
        e.target === startBtn ||
        (startBtn && startBtn.contains(e.target)) ||
        (
          e.type === 'keydown' &&
          (e.key === 'Enter' || e.key === ' ') &&
          document.activeElement === startBtn
        )
      );

    if (isStartClick) {
      // Don't skip; let the Start button's own handler run the sequence
      return;
    }

    // Any other interaction skips
    skipRequested = true;
    revealStudio();
  }

  function addStartInterceptors() {
    // capture phase so we beat other handlers
    window.addEventListener('click', requestSkipToStudio, { capture: true });
    window.addEventListener('touchstart', requestSkipToStudio, { capture: true });
    window.addEventListener('keydown', requestSkipToStudio, { capture: true });
  }
  function removeStartInterceptors() {
    window.removeEventListener('click', requestSkipToStudio, { capture: true });
    window.removeEventListener('touchstart', requestSkipToStudio, { capture: true });
    window.removeEventListener('keydown', requestSkipToStudio, { capture: true });
  }

  function onKeyStart(e) {
    // Secondary handler: Enter/Space anywhere still starts the sequence,
    // but the capture interceptor above will skip unless focus is on the Start button.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      runSequence();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';
    studio.classList.add('hidden');
    studio.setAttribute('aria-hidden', 'true');

    addStartInterceptors();

    startBtn?.addEventListener('click', runSequence);
    window.addEventListener('keydown', onKeyStart, { passive: false });

    // Ensure the opening title is visible
    startTitle.classList.add('fade-in');
  });
})();

// ----------------- Konva drawing tools (unchanged) -----------------
// ----------------- Konva drawing tools (deferred + robust sizing) -----------------
(() => {
  const stageHost = document.getElementById('konvaStage');
  if (!stageHost || !window.Konva) return;

  const BASE_W = 1200, BASE_H = 800;

  let stage = null, layer = null, content = null;
  let ro = null;

  function createStageIfNeeded() {
    if (stage) return;
    const rect = stageHost.getBoundingClientRect();
    const cw = Math.max(1, rect.width);
    const ch = Math.max(1, rect.height);

    // Only create once the container is actually measurable
    if (cw === 1 && ch === 1) return;

    stage = new Konva.Stage({
      container: stageHost,
      width: cw,
      height: ch,
    });

    layer = new Konva.Layer({ listening: true });
    content = new Konva.Group();
    stage.add(layer);
    layer.add(content);

    // Make sure touch doesn’t convert to scrolling instead of drawing
    stage.getContent().style.touchAction = 'none';

    wireDrawingTools();
  }

  function fitStage() {
    if (!stage || !content) return;
    const rect = stageHost.getBoundingClientRect();
    const cw = Math.max(1, rect.width);
    const ch = Math.max(1, rect.height);
    stage.size({ width: cw, height: ch });

    const s = Math.min(cw / BASE_W, ch / BASE_H);
    content.scale({ x: s, y: s });
    content.position({
      x: (cw - BASE_W * s) / 2,
      y: (ch - BASE_H * s) / 2
    });
    layer.batchDraw();
  }

  // Public hook you can call after the studio becomes visible
  function ensureAndFit() {
    createStageIfNeeded();
    // fit twice: once now, again next frame after layout settles
    fitStage();
    requestAnimationFrame(fitStage);
  }
  window.__konvaEnsure = ensureAndFit;

  // Observe size changes of the host; when it becomes non-zero, init + fit
  try {
    ro = new ResizeObserver(() => ensureAndFit());
    ro.observe(stageHost);
  } catch {
    window.addEventListener('resize', ensureAndFit);
  }

  // If it’s already visible at load (e.g., you navigated back), init now
  ensureAndFit();

  // ---- Drawing tools (unchanged from your version) ----
  function wireDrawingTools() {
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
        // const saved = await res.json();
        window.location.href = '/street.html';
      } catch (e) {
        alert('Sorry, failed to submit your trinket.');
        console.error(e);
      }
    });
  }
})();

