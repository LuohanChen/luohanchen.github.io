// Needed functionalities (JS):
// random selection button, fortune cookie onclick change image, fortune cookie randomiser button, canvas scroll in/out, canvas draggable

// const track = document.getElementById("card-container");

// window.onmousedown = (e) => {
//   track.dataset.mouseDownAt = e.clientX;
// };

// window.onmousemove = (e) => {
//   if (track.dataset.mouseDownAt === "0") return;

//   const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
//     maxDelta = window.innerWidth / 2;

//   const percentage = (mouseDelta / maxDelta) * -100,
//     nextPercentage = parseFloat(track.dataset.prevPercentage) + percentage;

//   track.dataset.percentage = nextPercentage;

//   track.style.transform = `translate(${nextPercentage}%, -50%)`;
// };

// window.onmouseup = () => {
//   track.dataset.mouseDownAt = "0";
//   track.dataset.prevPercentage = track.dataset.percentage;
// };

document.addEventListener("DOMContentLoaded", function () {});

document.addEventListener("DOMContentLoaded", function () {
  var stream = document.querySelector(".gallery__stream");
  var items = document.querySelectorAll(".gallery__item");
  var prev = document.querySelector(".gallery__prev");
  var next = document.querySelector(".gallery__next");
});

document.addEventListener("DOMContentLoaded", function () {
  var stream = document.querySelector(".gallery__stream");
  var items = document.querySelectorAll(".gallery__item");
  var prev = document.querySelector(".gallery__prev");
  var next = document.querySelector(".gallery__next");
  prev.addEventListener("click", function () {
    stream.insertBefore(items[items.length - 1], items[0]);
    items = document.querySelectorAll(".gallery__item");
  });
  next.addEventListener("click", function () {
    stream.appendChild(items[0]);
    items = document.querySelectorAll(".gallery__item");
  });
});
