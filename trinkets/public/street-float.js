let seenIds = new Set();

function toAbsoluteURL(pathOrData) {
  if (!pathOrData) return '';
  // Support legacy base64 data URLs (they'll load as-is)
  if (/^data:image\//i.test(pathOrData)) return pathOrData;
  // If it's already absolute (http/https), keep it
  if (/^https?:\/\//i.test(pathOrData)) return pathOrData;
  // Otherwise treat as server-relative (ensure leading slash)
  const rel = pathOrData.startsWith('/') ? pathOrData : `/${pathOrData}`;
  return `${window.location.origin}${rel}`;
}

function addFloatingTrinket(row) {
  if (!row || seenIds.has(row.id)) return;
  seenIds.add(row.id);

  // Your API should send `image_path` like "/uploads/abc.png".
  // Fallback to `drawing` (base64) for older rows if present.
  const src = toAbsoluteURL(row.image_path || row.drawing);
  if (!src) {
    console.warn('[float] missing image for id', row.id, row);
    return;
  }

  const img = document.createElement('img');
  img.className = 'trinket-float';
  img.src = src;

  // helpful debugging if a URL 404s
  img.addEventListener('error', () => {
    console.error('[float] image failed to load:', src, 'for id', row.id);
  });

  // random vertical position
  const y = Math.max(0, Math.random() * (window.innerHeight - 150));
  img.style.top = `${y}px`;

  // random direction & speed
  const duration = 15 + Math.random() * 10; // seconds
  const leftToRight = Math.random() < 0.5;

  if (leftToRight) {
    img.style.left = `-200px`;
    img.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${window.innerWidth + 400}px)` }],
      { duration: duration * 1000, iterations: Infinity }
    );
  } else {
    img.style.left = `${window.innerWidth + 200}px`;
    img.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${window.innerWidth + 400}px)` }],
      { duration: duration * 1000, iterations: Infinity }
    );
  }

  document.body.appendChild(img);
}

async function fetchTrinkets() {
  try {
    const res = await fetch('/api/trinkets');
    if (!res.ok) throw new Error(`GET /api/trinkets ${res.status}`);
    const rows = await res.json();
    rows.forEach(addFloatingTrinket);
  } catch (err) {
    console.error('Failed to fetch trinkets:', err);
  }
}

// initial load + polling for new ones
fetchTrinkets();
setInterval(fetchTrinkets, 5000);