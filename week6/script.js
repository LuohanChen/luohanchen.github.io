// const myHeading = document.querySelector("p");
// console.log(myHeading);
// console.log(myHeading.textContent);
// myHeading.textContent = "This is a new heading";

// const myProjects = document.querySelectorAll("p");
// console.log(myProjects);

// myProjects.forEach(checkTopic);
// function checkTopic(item) {
// if (item.dataset.topic === "web") {
// item.classList.add("purple-box");
// } else if (item.dataset.topic === "sound") {
// item.classList.add("coral-box");
// } else if (item.dataset.topic === "games") {
// item.classList.add("lime-box");
// }
// }
// myPara.classList.add("purple-box");
// myPara.classList.add('line-box');

// myPara[0].classList.add("purple-box");
// myPara[1].classList.add("coral-box");
// myPara[2].classList.add("lime-box");

// const myColors = ["purple-box", "coral-box", "lime-box"];
// for  (let i = 0; i < 3; 1++) {
//    myPara[i].classList.add(myColors[i]);
//    mypara[i].textContent = "New para" + i;
// }

// myPara.forEach(addColors);
// function addColors(item)
// {
//     item.classList.add("purple-box");
// }

// const myImg = document.querySelector("my-image");
// console.log(myImg);

//const myButton = document.querySelector("my-button");
//console.log(myButton);

//myButton.addEventListener("click", toggleMe);

//function toggleMe() {
//const myImg = document.querySelector("#my-image");
//console.log(myImg);
//myImg.classList.toggle("round");

//const myDiv = document.querySelector(".outer");
//console.log(myDiv);
//myDiv.classList.toggle("lime-box");
//}

const courseName = "OART1013";
const myHeading = document.querySelector("h1");
myHeading.textConcent = "new heading";
myHeading.innerHTML = `new <span class="coral-box>${courseName} </span>`;

const myImg = document.querySelector("#my-image");

myImg.addEventListener("mouseover", makeItRound);
myImg.addEventListener("mouseout", makeItSquare);

function makeItRound() {
  myImg.classList.add("round");
}

function makeItSquare() {
  myImg.classList.remove("round");
}
