const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.touchAction = "none";
canvas.style.userSelect = "none";

let offset = { x: canvas.width / 2, y: canvas.height / 2 };
let scale = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;

const imageWidth = 300;
const imageHeight = 300;
const padding = 5;
const tileSizeX = imageWidth + padding;
const tileSizeY = imageHeight + padding;

const domImages = Array.from(document.querySelectorAll("#imagePool img"));

const tileCache = new Map();

function generateRandomTile() {
  const shuffled = [...domImages].sort(() => 0.5 - Math.random());
  const layout = [];
  const used = new Set();

  for (let i = 0; i < shuffled.length; i++) {
    let attempts = 0;
    let col, row;
    do {
      col = Math.floor(Math.random() * 5);
      row = Math.floor(Math.random() * 2);
      attempts++;
    } while (used.has(`${col},${row}`) && attempts < 100);
    used.add(`${col},${row}`);
    layout.push({
      img: shuffled[i],
      x: col * tileSizeX,
      y: row * tileSizeY,
      width: imageWidth,
      height: imageHeight,
      type: shuffled[i].id
    });
  }

  return layout;
}

function getTile(col, row) {
  const key = `${col},${row}`;
  if (!tileCache.has(key)) {
    tileCache.set(key, generateRandomTile());
  }
  return tileCache.get(key);
}

let activeFilter = "all";

document.querySelectorAll(".filter-bar button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.type;
    document.querySelectorAll(".filter-bar button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    draw();
  });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);

  const tileW = tileSizeX * 5;
  const tileH = tileSizeY * 2;
  const cols = Math.ceil(canvas.width / (tileW * scale)) + 2;
  const rows = Math.ceil(canvas.height / (tileH * scale)) + 2;
  const originX = -offset.x / scale;
  const originY = -offset.y / scale;
  const startCol = Math.floor(originX / tileW) - 1;
  const startRow = Math.floor(originY / tileH) - 1;

  for (let col = startCol; col < startCol + cols; col++) {
    for (let row = startRow; row < startRow + rows; row++) {
      const tile = getTile(col, row);
      const baseX = col * tileW;
      const baseY = row * tileH;

      tile.forEach(({ img, x, y, type }) => {
        if (activeFilter !== "all" && type !== activeFilter) return;

        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scaleCover = Math.max(imageWidth / iw, imageHeight / ih);
        const displayW = iw * scaleCover;
        const displayH = ih * scaleCover;
        const offsetX = (imageWidth - displayW) / 2;
        const offsetY = (imageHeight - displayH) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(baseX + x, baseY + y, imageWidth, imageHeight);
        ctx.clip();
        ctx.drawImage(
          img,
          baseX + x + offsetX,
          baseY + y + offsetY,
          displayW,
          displayH
        );
        ctx.restore();
      });
    }
  }

  ctx.restore();
}

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoomFactor = 1.05;
  const direction = e.deltaY < 0 ? 1 : -1;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const wx = (mouseX - offset.x) / scale;
  const wy = (mouseY - offset.y) / scale;
  const proposedScale = scale * (direction > 0 ? zoomFactor : 1 / zoomFactor);
  if (proposedScale < MIN_SCALE || proposedScale > MAX_SCALE) return;
  scale = proposedScale;
  offset.x = mouseX - wx * scale;
  offset.y = mouseY - wy * scale;
  draw();
}, { passive: false });

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let momentumFrame;
let lastMoveTime = 0;

canvas.addEventListener("pointerdown", e => {
  e.preventDefault();
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  velocity = { x: 0, y: 0 };
  cancelAnimationFrame(momentumFrame);
});

canvas.addEventListener("pointermove", e => {
  e.preventDefault();
  lastMoveTime = Date.now();
  if (!isDragging) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  offset.x += dx;
  offset.y += dy;
  velocity = { x: dx, y: dy };
  dragStart = { x: e.clientX, y: e.clientY };
  draw();
});

canvas.addEventListener("pointerup", e => {
  e.preventDefault();
  isDragging = false;
  momentum();
});
canvas.addEventListener("pointerleave", e => {
  e.preventDefault();
  isDragging = false;
});

function momentum() {
  velocity.x *= 0.95;
  velocity.y *= 0.95;
  offset.x += velocity.x;
  offset.y += velocity.y;
  draw();
  if (Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5) {
    momentumFrame = requestAnimationFrame(momentum);
  }
}

let lastTouchDistance = null;

canvas.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const centerX = (t1.clientX + t2.clientX) / 2;
    const centerY = (t1.clientY + t2.clientY) / 2;

    if (lastTouchDistance !== null) {
      const delta = dist / lastTouchDistance;
      const wx = (centerX - offset.x) / scale;
      const wy = (centerY - offset.y) / scale;
      const proposedScale = scale * delta;
      if (proposedScale >= MIN_SCALE && proposedScale <= MAX_SCALE) {
        scale = proposedScale;
        offset.x = centerX - wx * scale;
        offset.y = centerY - wy * scale;
        draw();
      }
    }

    lastTouchDistance = dist;
  }
}, { passive: false });

canvas.addEventListener("touchend", () => {
  lastTouchDistance = null;
});

canvas.addEventListener("click", e => {
  const now = Date.now();
  const timeSinceLastMove = now - lastMoveTime;
  if (timeSinceLastMove < 150) return;

  const wx = (e.clientX - offset.x) / scale;
  const wy = (e.clientY - offset.y) / scale;
  const tileW = tileSizeX * 5;
  const tileH = tileSizeY * 2;
  const tileX = Math.floor(wx / tileW);
  const tileY = Math.floor(wy / tileH);
  const localX = wx - tileX * tileW;
  const localY = wy - tileY * tileH;
  const tile = getTile(tileX, tileY);
  const match = tile.find(({ x, y, width, height }) =>
    localX >= x && localX <= x + width &&
    localY >= y && localY <= y + height
  );
  if (match) {
    const overlay = document.getElementById("overlay");
    const overlayImg = document.getElementById("overlayImg");
    overlayImg.src = match.img.src;
    overlay.style.display = "flex";
  }
});

document.getElementById("overlay").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "none";
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("overlay").style.display = "none";
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});

draw();