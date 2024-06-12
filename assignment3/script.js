// Needed functionalities (JS):
// random selection button, fortune cookie onclick change image, fortune cookie randomiser button, canvas scroll in/out, canvas draggable

const zoomElement = document.querySelector(".cookies");
let zoom = 1;
const ZOOM_SPEED = 0.1;

document.addEventListener("wheel", function (e) {
  if (e.deltaY > 0) {
    zoomElement.style.transform = `scale(${(zoom += ZOOM_SPEED)})`;
  } else {
    zoomElement.style.transform = `scale(${(zoom -= ZOOM_SPEED)})`;
  }
});
