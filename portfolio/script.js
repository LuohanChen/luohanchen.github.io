document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger-menu");
  const mobileMenu = document.querySelector(".mobile-menu");

  burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });

  document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".buttonContainer button");
  const cards = document.querySelectorAll(".image-card");

function filterCategory(category) {
  const cards = document.querySelectorAll(".image-card");

  cards.forEach((card, index) => {
    const img = card.querySelector("img");
    if (category === "all" || img.id === category) {
      card.style.display = "flex";
      card.style.animation = "none";
      card.offsetHeight;
      card.style.animation = `fadeUp 0.6s ease-out forwards`;
      card.style.animationDelay = `${index * 100}ms`;
    } else {
      card.style.display = "none";
    }
  });
}

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      filterCategory(button.id);
    });
  });

  const activeButton = document.querySelector(".buttonContainer button.active");
  if (activeButton) {
    filterCategory(activeButton.id);
  }
});
