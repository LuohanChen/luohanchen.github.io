// Needed functionalities (JS):
// random selection button, fortune cookie onclick change image, fortune cookie randomiser button, canvas scroll in/out, canvas draggable
const container = document.querySelector(".canvas");

let currentZoom = 1;
let minZoom = 1;
let maxZoom = 5;
let stepSize = 0.05;

container.addEventListener("wheel", function (event) {
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
  let image = document.querySelector(".canvas");
  image.style.transform = "scale(" + currentZoom + ")";
}

function onMouseDrag({ movementX, movementY }) {
  let getContainerStyle = window.getComputedStyle(container);
  let leftValue = parseInt(getContainerStyle.left);
  let topValue = parseInt(getContainerStyle.top);
  container.style.left = `${leftValue + movementX}px`;
  container.style.top = `${topValue + movementY}px`;
}
container.addEventListener("mousedown", () => {
  container.addEventListener("mousemove", onMouseDrag);
});
document.addEventListener("mouseup", () => {
  container.removeEventListener("mousemove", onMouseDrag);
});
