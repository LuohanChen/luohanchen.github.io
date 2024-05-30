const profileButton = document.querySelector("#profile-button");
console.log(profileButton);

const profileContent = document.querySelector("#profile-content");
console.log(profileContent);

profileButton.addEventListener("click", toggleContent);

function toggleContent() {
  profileContent.classList.toggle("show");
}
