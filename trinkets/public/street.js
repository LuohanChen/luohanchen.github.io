(async function(){
  const list = document.getElementById('gallery');
  const tpl  = document.getElementById('card-tpl');

  try {
    const res = await fetch(`${window.location.origin}/api/trinkets`);
    if (!res.ok) throw new Error('Failed to load street');
    const items = await res.json();

    list.innerHTML = '';
    for (const it of items){
      const node = tpl.content.cloneNode(true);
      const img  = node.querySelector('.shot');
      const name = node.querySelector('.name');
      const story= node.querySelector('.story');
      const time = node.querySelector('.time');

      img.src = it.image_path;
      img.alt = `Drawing: ${it.name || 'Unnamed Trinket'}`;
      name.textContent = it.name || 'Unnamed Trinket';
      story.textContent = it.story || '';
      time.textContent = new Date(it.created_at).toLocaleString();

      list.appendChild(node);
    }
  } catch (e) {
    console.error(e);
    const err = document.createElement('p');
    err.textContent = 'Failed to load submissions.';
    list.appendChild(err);
  }

  async function loadFloatingTrinkets() {
  try {
    const res = await fetch("/api/trinkets");
    const trinkets = await res.json();

    trinkets.forEach((t) => {
      const img = document.createElement("img");
      img.src = t.drawing; // stored base64 image from DB
      img.className = "trinket-float";

      // Random vertical position
      const y = Math.random() * (window.innerHeight - 150);
      img.style.top = `${y}px`;

      // Random speed (duration of float across screen)
      const duration = 15 + Math.random() * 10; // 15–25s
      const direction = Math.random() < 0.5 ? "left" : "right";

      // Define animation
      if (direction === "left") {
        img.style.left = `${window.innerWidth + 200}px`;
        img.animate(
          [
            { transform: `translateX(0)` },
            { transform: `translateX(-${window.innerWidth + 400}px)` }
          ],
          {
            duration: duration * 1000,
            iterations: Infinity
          }
        );
      } else {
        img.style.left = `-200px`;
        img.animate(
          [
            { transform: `translateX(0)` },
            { transform: `translateX(${window.innerWidth + 400}px)` }
          ],
          {
            duration: duration * 1000,
            iterations: Infinity
          }
        );
      }

      document.body.appendChild(img);
    });
  } catch (err) {
    console.error("Failed to load trinkets:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadFloatingTrinkets);
})();