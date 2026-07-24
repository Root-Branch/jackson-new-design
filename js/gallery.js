const workShowcase = document.querySelector("[data-work-showcase]");

if (workShowcase) {
  const feature = workShowcase.querySelector("[data-work-feature]");
  const featureImage = workShowcase.querySelector("[data-work-image]");
  const featureIndex = workShowcase.querySelector("[data-work-index]");
  const number = workShowcase.querySelector("[data-work-number]");
  const title = workShowcase.querySelector("[data-work-title]");
  const description = workShowcase.querySelector("[data-work-description]");
  const progress = workShowcase.querySelector("[data-work-progress]");
  const nextButton = workShowcase.querySelector("[data-work-next]");
  const filmstrip = workShowcase.querySelector("[data-work-filmstrip]");
  const stripPrevious = workShowcase.querySelector("[data-work-strip-prev]");
  const stripNext = workShowcase.querySelector("[data-work-strip-next]");
  const thumbs = [...workShowcase.querySelectorAll("[data-work-thumb]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let autoTimer;
  let switchTimer;

  const restartProgress = () => {
    if (!progress || reducedMotion) return;
    progress.classList.remove("is-running");
    void progress.offsetWidth;
    progress.classList.add("is-running");
  };

  const updateStripControls = () => {
    if (!filmstrip) return;
    const atStart = filmstrip.scrollLeft <= 2;
    const atEnd = filmstrip.scrollLeft + filmstrip.clientWidth >= filmstrip.scrollWidth - 2;
    if (stripPrevious) stripPrevious.disabled = atStart;
    if (stripNext) stripNext.disabled = atEnd;
  };

  const scrollFilmstrip = (direction) => {
    if (!filmstrip) return;
    filmstrip.scrollBy({
      left: direction * Math.max(320, filmstrip.clientWidth * .72),
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

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
      const itemNumber = thumb.dataset.number || "";

      featureImage.src = src;
      featureImage.alt = alt;
      feature.dataset.src = src;
      feature.dataset.alt = alt;
      if (featureIndex) featureIndex.textContent = `${itemNumber} / ${String(thumbs.length).padStart(2, "0")}`;
      if (number) number.textContent = itemNumber;
      if (title) title.textContent = thumb.dataset.title || alt;
      if (description) description.textContent = alt;

      thumbs.forEach((item, itemIndex) => {
        const active = itemIndex === activeIndex;
        item.classList.toggle("is-active", active);
        if (active) item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });

      feature.classList.remove("is-switching");
      if (scrollThumb) thumb.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      restartProgress();
    }, reducedMotion ? 0 : 180);
  };

  const startAutoPlay = () => {
    clearInterval(autoTimer);
    if (reducedMotion) return;
    restartProgress();
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

  stripPrevious?.addEventListener("click", () => scrollFilmstrip(-1));
  stripNext?.addEventListener("click", () => scrollFilmstrip(1));
  filmstrip?.addEventListener("scroll", updateStripControls, { passive: true });
  window.addEventListener("resize", updateStripControls, { passive: true });

  workShowcase.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") showExample(activeIndex + 1);
    if (event.key === "ArrowLeft") showExample(activeIndex - 1);
  });

  feature?.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const bounds = feature.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * -14;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * -10;
    feature.style.setProperty("--work-x", `${x}px`);
    feature.style.setProperty("--work-y", `${y}px`);
  });

  feature?.addEventListener("pointerleave", () => {
    feature.style.removeProperty("--work-x");
    feature.style.removeProperty("--work-y");
  });

  workShowcase.addEventListener("pointerenter", () => clearInterval(autoTimer));
  workShowcase.addEventListener("pointerleave", startAutoPlay);
  filmstrip?.addEventListener("focusin", () => clearInterval(autoTimer));
  filmstrip?.addEventListener("focusout", startAutoPlay);
  window.requestAnimationFrame(updateStripControls);
  startAutoPlay();
}
