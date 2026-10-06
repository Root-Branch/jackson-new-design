const touchCardsQuery = window.matchMedia("(hover: none), (pointer: coarse)");
const touchCards = [...document.querySelectorAll(".service-panel")].map((card, index) => {
  const details = card.querySelector(".service-panel__details");
  const toggle = document.createElement("button");
  details.id = `card-details-${index + 1}`;
  toggle.type = "button";
  toggle.className = "service-panel__toggle";
  toggle.setAttribute("aria-controls", details.id);
  toggle.innerHTML = '<span>Show details</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
  card.querySelector(".service-panel__summary").append(toggle);

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "Hide details" : "Show details";
    details.hidden = touchCardsQuery.matches && !open;
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  return { card, setOpen };
});

const updateTouchCards = () => {
  document.documentElement.classList.toggle("touch-cards", touchCardsQuery.matches);
  touchCards.forEach(({ card, setOpen }) => {
    if (touchCardsQuery.matches) card.removeAttribute("tabindex");
    else card.setAttribute("tabindex", "0");
    setOpen(false);
  });
};

touchCardsQuery.addEventListener("change", updateTouchCards);
updateTouchCards();
