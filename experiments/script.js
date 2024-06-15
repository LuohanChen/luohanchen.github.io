// Add CSS to card to make it LARGER, then return back to original state after time.
var clickStyle = document.querySelectorAll(".column");

function toggleStyle() {
  clickStyle.classList.toggle("is-clicked");
}

clickStyle.forEach((column, index) => {
  // Use index to associate each column with its modal
  column.addEventListener("click", function () {
    this.classList.toggle("is-clicked");

    setTimeout(function () {
      clickStyle.forEach((col) => col.classList.remove("is-clicked"));
    }, 3000);

    // Open the associated modal
    var modal = document.getElementById(`modal${index + 1}`); // Adjust the modal ID based on the column index
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
  });
});

// Close modal logic remains unchanged
var closes = document.querySelectorAll(".close");

closes.forEach((close) => {
  close.addEventListener("click", function () {
    var modal = this.closest(".modalbox");
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
  });
});

window.addEventListener("click", function (event) {
  var modals = document.querySelectorAll(".modalbox");
  modals.forEach((modal) => {
    if (
      event.target === modal ||
      event.target === modal.querySelector(".modalcard")
    ) {
      modal.style.visibility = "hidden";
      modal.style.opacity = "0";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Card tilt while cursor is hovering over the page (elaborate)
  const cards = document.querySelectorAll(".modalcard");
  let rect;

  cards.forEach((card) => {
    rect = card.getBoundingClientRect();
  });

  document.addEventListener("mousemove", function (e) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    let tiltX = ((x - centerX) / centerX) * -5;
    let tiltY = ((y - centerY) / centerY) * -10;

    tiltX = Math.min(Math.max(tiltX, -30), 30);
    tiltY = Math.min(Math.max(tiltY, -30), 30);

    // Apply transformation to each card individually
    cards.forEach((card) => {
      card.style.transform = `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
      card.style.boxShadow = `${tiltX}px ${tiltY}px 30px rgb(249, 210, 122, 0.3)`;
    });
  });
});
