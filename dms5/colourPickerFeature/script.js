/* this line creates a new variable named colourSquare by using the let keyword */
/* it then sets that variable to the div from our HTML */
/* it does this by searching the document for any element that has the id "colour-square" */
/* now whenever we refer to colourSquare we know it means the div element */
let colourSquare = document.getElementById("colour-square");

/* the below is a function to change the colour of our div */
/* its created using the function keyword, followed by a name, then parentheses with a parameter */
/* then some curly brackets which contain the code to run when its called via name */
function setSquareColour(newColour){
    
    /* this is some built in error checking */
    /* we create a new variable and set it to 'black' as we know that its a supported colour value */
    let validColour = 'black';

    /* this then check if the newColour is a valid colour value */
    /* if it is it changes validColour from 'black' to newColour */
    /* if it isn't it doesn't do anything - so validColour remains 'black' */
    if(CSS.supports('color', newColour)){
        validColour = newColour;
    }

    /* finally we set the backgroundColor style of colourSquare to the validColour */
    colourSquare.style.backgroundColor = validColour;

}

/* below is an example call to the function : because its just in the script it'll run when the page is loaded */
setSquareColour('red');

let colourPicker = document.getElementById("colour-picker");

colourPicker.addEventListener("input", pickingColour);

function pickingColour(e){
// console.log(e.target.value);
setSquareColour(e.target.value)
}

let colors_r = document.getElementById('red');
let colors_g = document.getElementById('green');
let colors_b = document.getElementById('blue');

colors_r.addEventListener('input', rangeColor);
colors_g.addEventListener('input', rangeColor);
colors_b.addEventListener('input', rangeColor);

function rangeColor(i){
    // console.log ('rgb(' + colors_r.value + "," + colors_g.value + "," + colors_b.value + ')');
    setSquareColour('rgb(' + colors_r.value + "," + colors_g.value + "," + colors_b.value + ')');
}
