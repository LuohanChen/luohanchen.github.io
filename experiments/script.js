// Add CSS to card to make it LARGER, then return back to original state after time.
var clickStyle = document.getElementById("cardContainer");

function toggleStyle() {
  clickStyle.classList.toggle("is-clicked");

  setTimeout(function () {
    clickStyle.classList.remove("is-clicked");
  }, 1000);
}

// Modal controls
var modal = document.getElementById("modal");
var open = document.getElementById("btn");
var span = document.getElementsByClassName("close")[0];

open.onclick = function () {
  modal.style.visibility = "visible";
  modal.style.opacity = "1";
};

span.onclick = function () {
  modal.style.visibility = "hidden";
  modal.style.opacity = "0";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
  }
};

// Card tilt while cursor is hovering over the page (elaborate)
document.addEventListener("DOMContentLoaded", function (event) {
  const card = document.getElementById("modalcard");
  const rect = card.getBoundingClientRect();

  document.addEventListener("mousemove", function (e) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    let tiltX = ((x - centerX) / centerX) * -5;
    let tiltY = ((y - centerY) / centerY) * -10;

    tiltX = Math.min(Math.max(tiltX, -30), 30);
    tiltY = Math.min(Math.max(tiltY, -30), 30);

    card.style.transform = `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
    card.style.boxShadow = `${tiltX}px ${tiltY}px 30px rgb(249, 210, 122, 0.3)`;
  });
});
