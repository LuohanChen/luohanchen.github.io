let waterAmount = 0.5
let dryAmount = 0.005;
let currentcolor = "rgb (255, 255, 255)";

document.getElementById("palette01").addEventListener("click", addcolor);
document.getElementById("palette02").addEventListener("click", addcolor);
document.getElementById("palette03").addEventListener("click", addcolor);
document.getElementById("palette04").addEventListener("click", addcolor);


function addcolor(e){
  let buttonClicked = e.target;
  let backgroundColour = getComputedStyle(buttonClicked).backgroundColor;
  let newAlphacolor = rgbaFromRGBString(backgroundColour, waterAmount);
  currentcolor = backgroundColour;
  console.log(newAlphacolor);
  setBrushcolor(backgroundColour);
}

function dryingBrush(){
  waterAmount = waterAmount - dryAmount
  rgbaFromRGBString(backgroundColour, waterAmount);
}



document.getElementById("waterCupMouth").addEventListener("click", () => {
  waterAmount = 1;
});

/* expects an rgb() string and a=n alpha value as a number */
function rgbaFromRGBString(rgbString, newAlpha){
  /* first we need to get the number values from our string */
  /* the below will return an array with our seperate r,g,b values */
  let colors = rgbString.match(/\d+/g);
  /* then we need to turn this, plus our alpha number into an rgba() string */
  /* below uses template literals to make short script */
  /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals */
  let newRGBAString = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${newAlpha})`;
  /* finally return this new string */
  return newRGBAString;
}

function setBrushcolor(newcolor){
  ctx.strokeStyle = newcolor;
}

