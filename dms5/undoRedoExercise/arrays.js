let arrayDisplay = document.getElementById("arrayDisplay");

let colourNameOne = "Bisque";
let colourNameTwo = "Coral";
let colourNameThree = "Cyan";
let colourNameFour = "Olive";
let colourNameFive = "Red";

let colourNames = [
  "Bisque", "Coral", "Cyan", "Olive", "red"
];

arrayDisplay.innerHTML = colourNames;



let pickColBtn = document.getElementById("pickColour");

pickColBtn.addEventListener("click", pickColour);

function pickColour(){
  arrayDisplay.innerHTML = colourNames[1];
}



let randColBtn = document.getElementById("randColour");

randColBtn.addEventListener("click", randomColour);

function randomColour(){
  let randomNumber = getRandomIntRange(0, colourNames.length);
  arrayDisplay.innerHTML = colourNames[randomNumber];
  console.log (randomNumber);
}



/* in a forEach loop the first parameter is the value, and the second is its index */
colourNames.forEach((colour) => {

});

////////////////////////// helper functions

// random int
function getRandomIntRange(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// random float
function getRandomFloatRange(min, max){
  return Math.random() * (max - min) + min;
}