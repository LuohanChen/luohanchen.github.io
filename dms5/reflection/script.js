document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.popupBox');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const title = button.getAttribute('data-title');
      const content = button.getAttribute('data-content');

      const panel = document.createElement('div');
      panel.className = 'popup-panel';

      panel.innerHTML = `
        <div class="panel-header">
          <span>${title}</span>
          <span class="close-btn">&times;</span>
        </div>
        <div class="panel-body">${content}</div>
      `;

      document.body.appendChild(panel);

      const closeBtn = panel.querySelector('.close-btn');
      closeBtn.addEventListener('click', () => {
        panel.remove();
      });

      makeDraggable(panel);
    });
  });
});

function makeDraggable(element) {
  const header = element.querySelector('.panel-header');
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.zIndex = parseInt(Date.now() / 1000);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}