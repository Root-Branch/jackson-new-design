const workShowcase = document.querySelector("[data-work-showcase]");

if (workShowcase) {
  const feature = workShowcase.querySelector("[data-work-feature]");
  const featureImage = workShowcase.querySelector("[data-work-image]");
  const previousButton = workShowcase.querySelector("[data-work-previous]");
  const nextButton = workShowcase.querySelector("[data-work-next]");
  const thumbs = [...workShowcase.querySelectorAll("[data-work-thumb]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let autoTimer;
  let switchTimer;

  const showExample = (index, scrollThumb = true) => {
    const nextIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[nextIndex];
    if (!thumb || !feature || !featureImage) return;

    activeIndex = nextIndex;
    feature.classList.add("is-switching");
    clearTimeout(switchTimer);

    switchTimer = window.setTimeout(() => {
      const src = thumb.dataset.src || "";
      const alt = thumb.dataset.alt || "";

      featureImage.srcset = thumb.dataset.srcset || "";
      featureImage.src = src;
      featureImage.alt = alt;
      feature.dataset.src = src;
      feature.dataset.alt = alt;

      thumbs.forEach((item, itemIndex) => {
        const active = itemIndex === activeIndex;
        item.classList.toggle("is-active", active);
        if (active) item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });

      feature.classList.remove("is-switching");
      if (scrollThumb) thumb.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest", inline: "center" });
    }, reducedMotion.matches ? 0 : 180);
  };

  const startAutoPlay = () => {
    clearInterval(autoTimer);
    if (reducedMotion.matches || workShowcase.dataset.motionActive !== "true" || workShowcase.matches(":hover, :focus-within")) return;
    autoTimer = window.setInterval(() => showExample(activeIndex + 1, false), 5500);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      showExample(index, false);
      startAutoPlay();
    });
  });

  nextButton?.addEventListener("click", () => {
    showExample(activeIndex + 1);
    startAutoPlay();
  });

  previousButton?.addEventListener("click", () => {
    showExample(activeIndex - 1);
    startAutoPlay();
  });

  workShowcase.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") showExample(activeIndex + 1);
    if (event.key === "ArrowLeft") showExample(activeIndex - 1);
  });

  workShowcase.addEventListener("pointerenter", () => clearInterval(autoTimer));
  workShowcase.addEventListener("pointerleave", startAutoPlay);
  workShowcase.addEventListener("focusin", () => clearInterval(autoTimer));
  workShowcase.addEventListener("focusout", () => window.setTimeout(startAutoPlay, 0));
  workShowcase.addEventListener("motionvisibilitychange", startAutoPlay);
  startAutoPlay();
}
