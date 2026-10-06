const motionElements = [...document.querySelectorAll(".logo-marquee, [data-work-showcase]")];
const visibleMotion = new Set();
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateMotionVisibility = () => {
  motionElements.forEach((element) => {
    const active = visibleMotion.has(element) && !document.hidden && !motionPreference.matches;
    element.classList.toggle("is-motion-active", active);
    element.dataset.motionActive = String(active);
    element.dispatchEvent(new CustomEvent("motionvisibilitychange"));
  });
};

const motionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) visibleMotion.add(entry.target);
    else visibleMotion.delete(entry.target);
  });
  updateMotionVisibility();
});

motionElements.forEach((element) => motionObserver.observe(element));
document.addEventListener("visibilitychange", updateMotionVisibility);
motionPreference.addEventListener("change", updateMotionVisibility);
updateMotionVisibility();
