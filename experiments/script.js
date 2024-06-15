function toggleStyle() {
  var element = document.getElementById("cardContainer");
  element.classList.toggle("is-clicked");

  setTimeout(function () {
    element.classList.remove("is-clicked");
  }, 1000);
}

var modal = document.getElementById("modal");
var open = document.getElementById("btn");
var span = document.getElementsByClassName("close")[0];

open.onclick = function () {
  modal.style.display = "flex";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
