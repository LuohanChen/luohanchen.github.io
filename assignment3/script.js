// Needed functionalities (JS):
// random selection button, fortune cookie onclick change image, fortune cookie randomiser button, canvas scroll in/out, canvas draggable

const zoomElement = document.querySelector("canvas");

let currentZoom = 1;
let minZoom = 0.3;
let maxZoom = 3;
let stepSize = 0.05;

canvas.addEventListener("wheel", function (event) {
  let direction = event.deltaY > 0 ? -1 : 1;
  zoomImage(direction);
});

function zoomImage(direction) {
  let newZoom = currentZoom + direction * stepSize;

  // Limit the zoom level to the minimum and maximum values
  if (newZoom < minZoom || newZoom > maxZoom) {
    return;
  }

  currentZoom = newZoom;

  // Update the CSS transform of the image to scale it
  let image = document.querySelector("#canvas");
  image.style.transform = "scale(" + currentZoom + ")";
}
