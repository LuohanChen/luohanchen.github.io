document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".buttonContainer button");
  const cards = document.querySelectorAll(".image-card");

  function filterCategory(category) {
    let visibleIndex = 0;

    cards.forEach((card) => {
      const wrapper = card.parentElement;
      const categories = card.getAttribute("data-categories")?.split(" ") || [];
      const img = card.querySelector("img");
      const matches = category === "all" || categories.includes(category) || img.id === category;

      if (matches) {
        wrapper.style.display = "block";
        card.style.display = "flex";
        card.style.animation = "none";
        void card.offsetWidth;

        card.style.animation = `fadeUp 0.6s ease-out forwards`;
        card.style.animationDelay = `${visibleIndex * 100}ms`;

        visibleIndex++;
      } else {
        wrapper.style.display = "none";
      }
    });
  }

  cards.forEach(card => {
    const categories = card.getAttribute("data-categories")?.split(" ") || [];
    if (categories.includes("magic")) {
      card.classList.add("magic");
    }
  });

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



  function animateFooterElements() {
    const elements = document.querySelectorAll('.footer-animate');
    let delay = 0;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (inView) {
        el.style.animationDelay = `${delay}s`;
        el.classList.add('visible');
        delay += 0.2;
      } else {
        el.classList.remove('visible');
        el.style.animationDelay = '0s';
      }
    });
  }

  window.addEventListener('scroll', animateFooterElements);
  window.addEventListener('load', animateFooterElements);
});