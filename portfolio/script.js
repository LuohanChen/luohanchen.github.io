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
    let visibleIndex = 0;

    cards.forEach((card) => {
      const img = card.querySelector("img");

      if (category === "all" || img.id === category) {
        card.style.display = "flex";
        card.style.animation = "none";
        void card.offsetWidth;

        card.style.animation = `fadeUp 0.6s ease-out forwards`;
        card.style.animationDelay = `${visibleIndex * 100}ms`;

        visibleIndex++;
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
