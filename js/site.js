const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const navLinks = [...(menu?.querySelectorAll('a[href^="#"]') || [])];
const navSections = navLinks
  .map((link) => ({
    link,
    section: document.querySelector(link.getAttribute("href")),
  }))
  .filter(({ section }) => section);

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const closeMenu = () => {
  menuButton?.setAttribute("aria-expanded", "false");
  menu?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menu?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

const setActiveNav = (activeLink) => {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveNav = () => {
  const activationLine = (header?.offsetHeight || 0) + 120;
  let activeItem = navSections[0];

  navSections.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= activationLine) {
      activeItem = item;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeItem = navSections.at(-1);
  }

  if (activeItem) setActiveNav(activeItem.link);
};

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNav(link);
    closeMenu();
  });
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
  updateActiveNav();
}, { passive: true });

updateActiveNav();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

