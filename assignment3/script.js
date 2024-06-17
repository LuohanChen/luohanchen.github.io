//My chosen interaction for this site is hover, so most of these javascript codes work to append CSS into the html using javascript in order to facilitate the hover and click based interactions. Explinations of the interaction are split between the Javascript code comments and the CSS code comments.

//This block of code finds the .column class in the HTML, and detect whether the element in .column is clicked or not. When the element is clicked, the CSS element "column.is-clicked" gets activated and immediately the setTimeout function removes the is-clicked element after a 1 second delay.
// This facilitates the card to be follow up from it's hover effect in css by transforming the card up and out of the screen to indicate that the card has been selected by the user. The card then returns after the setTimeout function so the user can reselect it.
var clickStyle = document.querySelectorAll(".column");

function toggleStyle() {
  clickStyle.classList.toggle("is-clicked");
}

clickStyle.forEach((column, index) => {
  column.addEventListener("click", function () {
    this.classList.toggle("is-clicked");

    setTimeout(function () {
      clickStyle.forEach((col) => col.classList.remove("is-clicked"));
    }, 1000);

    // Open the modal by changing it's visibility and opacity in CSS.
    // The modal is selected by defining the modal element id, with an index increment of 1 to select the other modals.
    var modal = document.getElementById(`modal${index + 1}`);
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
  });
});

// The close class is defined and used to "close" the modal by changing the css values for visibility and opacity back to hidden and 0.
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

// This code allows the card in the modal to tilt according to the position of the mouse cursor, first, the card is defined with the .modalcard class. A function is called that defines the mouse coordinates based on the size of the window and updates
// The tiltAmount, tiltX and tiltY definitions are used to adjust the tilt strength and limits.
// A box shadow is then added that updates automatically based on the tilt amount using the tiltX and tiltY adjustment.
// these values are then appended into an inline css and called upon with the eventlistener whenever the mouse move (for both the tilt and the box shadow) that transforms the card using the rotateX, rotateY elements, and for the box shadow, the rgb value.
// This code block constantly listens and updates the mouse position in order to update the card's tilt angle.
// This effect can be considered a hover interaction as it does not require the user to click anything but just move the mouse around the screen. This effect is especially appealing as it allows the user to have something to "play" with while they're reading the text
// The box shadows add an additional layer of depth by providing visual confirmation of the direction of the hover, making the card look more 3D.
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

// these code randomizes the order of the html divs ".random", so that the arrangements of the cards are different everytime that either 1: the page loads or 2: the button to randomise the order is pressed.
// running this function when the page loads is achieved through the window.onload code.
// The randomizer works by arranging each of the .random divs into an array (randomElements), then assigning an index (randomIndex) to them, and using a math.random function to ranomize the order of each of the indexes and thus rearranging the order of the html randomly.
// In order to give a visual feedback when the randomizer is fired, a text animation is added and styled in CSS to appear when the randomizer is used and disappear after a certain period of time. This textanimation is appended into the HTML as an inline function.
window.onload = randomizeOrder;

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
    textAnimation.style.display = "none";
  }, 2000);
}
