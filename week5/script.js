// let myName = "Loochan";
// let myName = prompt("what is your name?");
// console.log("Hello, ", myName);

// let studentNames = ["Rohit", "Loochan", "Mav"];
// console.log(studentNames[0]);
// console.log(studentNames[1]);
// console.log(studentNames[2]);

// let studentRecord = [
    // {name: "Rohit", id: 2, marks: 30},
    // {name: "Thomas", id: 4, marks: 35},
    // {name: "Cyrian", id: 5, marks: 40},
   // {name: "Jonathan-Ericson", id: 6, marks: 12}
// ]; 

// console.log(studentRecord[1].name + " got the following marks: " + studentRecord[1].marks);

let tempInput = document.querySelector("#temperature");

let temperature = tempInput.value;


// let temperature = prompt("What is the temperature today?");
function checkWeather()
{
    if (temperature>=20 && temperature<30)
    {
        console.log("it feels sunny and warm");
    }
    else if (temperature>=10 && temperature<20)
    {
    console.log ("it feels cold");
    }
    else if (temperature>30)
    {
        console.log ("wa damn hot leh");
    }
    else if (temperature<10)
    {
        console.log ("it is freezing")
    }
}

let shoppingCart = [
    { name: "T-shirt", price: 20 },
    { name: "Jeans", price: 50 },
    { name: "sneakers", price: 120},
    { name: "backpack", price: 30}
]

function calculateTotal() {
    let total = 0;
    for (let i = 0; i < 4; i++) {
        total = total + shoppingCart[i].price;
        console.log("the sum so far", total);
    }
    console.log("total price", total);
    let discount = 0.1;
    let discountedPrie = 0;
    if (total>100) {
        discountedPrice = total - total * discount;
    }
    
    console.log ("the discounted price", discountedPrice);
}

// let val = calculateTotal();
let val = calculateTotal(0.5);
console.log(val);