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
})();