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

// Card tilt while cursor is hovering over the page (elaborate)
const cards = document.querySelectorAll(".modalcard");

function updateTiltAndShadow(event) {
  const x = event.clientX - window.innerWidth / 2;
  const y = event.clientY - window.innerHeight / 2;

  const tiltAmount = 50;
  const tiltX = (x / window.innerWidth) * tiltAmount;
  const tiltY = (-y / window.innerHeight) * tiltAmount;

  const boxShadowOffsetX = (-tiltX / 100) * 20;
  const boxShadowOffsetY = (tiltY / 100) * 20;

  cards.forEach((card) => {
    card.style.transform = `perspective(900px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
    card.style.boxShadow = `${boxShadowOffsetX}px ${boxShadowOffsetY}px 50px rgb(249, 210, 122, 0.3)`;
  });
}

window.addEventListener("mousemove", updateTiltAndShadow);

// Randomization (elaborate)
function randomizeOrder() {
  const randomElements = Array.from(document.querySelectorAll(".random"));

  randomElements.forEach((element) => {
    const randomIndex = Math.floor(Math.random() * randomElements.length);
    const temp = randomElements[randomIndex];
    randomElements[randomIndex] = element;
    element.parentNode.insertBefore(temp, element);
  });

  const textAnimation = document.getElementById("textAnimation");
  textAnimation.style.display = "block";
  setTimeout(() => {
    // Hide the text animation after the reshuffling is done
    textAnimation.style.display = "none";
  }, 2000); // Match the duration of the animation
}
