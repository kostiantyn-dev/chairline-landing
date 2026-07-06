const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const venueTabs = document.querySelector("[data-venue-tabs]");
const packages = document.querySelector("[data-packages]");
const materials = document.querySelector("[data-materials]");
const calculator = document.querySelector("[data-calculator]");
const lead = document.querySelector("[data-lead]");
const stickyCta = document.querySelector("[data-sticky-cta]");
const revealItems = document.querySelectorAll(".reveal");

const money = (value) => `${Math.round(value).toLocaleString("uk-UA")} грн`;

const venueData = {
  cafe: {
    status: "для кав'ярні",
    label: "Кав'ярня на 24 місця",
    title: "Легка посадка, тепла фактура, швидкий обіг столів",
    list: ["24 місця + 2 резервні стільці", "2 кольори каркасу, 3 тканини", "Поставка 10-14 днів"],
    seats: 24,
    model: "3280"
  },
  restaurant: {
    status: "для ресторану",
    label: "Ресторан на 56 місць",
    title: "М'яка посадка, виразний силует і єдиний стиль залу",
    list: ["56 місць + 8% резерву", "Тканини з високою щільністю", "Поставка 14-18 днів"],
    seats: 56,
    model: "4190"
  },
  bar: {
    status: "для бару",
    label: "Барна зона на 36 місць",
    title: "Вища посадка, темні матеріали й посилений каркас",
    list: ["36 місць + 15% резерву", "Темні easy-clean матеріали", "Поставка 14-18 днів"],
    seats: 36,
    model: "4860"
  },
  terrace: {
    status: "для тераси",
    label: "Тераса на 40 місць",
    title: "Штабельні моделі, вуличне покриття і сезонне зберігання",
    list: ["40 місць + 6 резервних стільців", "Покриття для вулиці", "Поставка 10-14 днів"],
    seats: 40,
    model: "2550"
  }
};

const materialData = {
  walnut: {
    name: "Walnut frame",
    price: 0,
    desc: "Теплий дерев'яний вигляд для кав'ярень і bistro.",
    main: "#8a5a32",
    seat: "#2c2118"
  },
  olive: {
    name: "Olive easy-clean",
    price: 420,
    desc: "Практична тканина для кави, десертів і щоденного потоку.",
    main: "#5f6b3c",
    seat: "#445034"
  },
  clay: {
    name: "Terracotta accent",
    price: 560,
    desc: "Теплий акцент для фотогенічних залів і літніх терас.",
    main: "#b65f42",
    seat: "#8c4936"
  },
  graphite: {
    name: "Graphite lounge",
    price: 690,
    desc: "Стриманий преміальний вигляд для барів і ресторанів.",
    main: "#252831",
    seat: "#17191f"
  }
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.addEventListener("scroll", () => {
  if (!stickyCta) return;
  stickyCta.classList.toggle("is-visible", window.scrollY > 760);
}, { passive: true });

function applyVenue(key) {
  const data = venueData[key];
  if (!data) return;

  document.querySelector("[data-venue-label]").textContent = data.label;
  document.querySelector("[data-venue-title]").textContent = data.title;
  document.querySelector("[data-ticket-status]").textContent = data.status;

  const list = document.querySelector("[data-venue-list]");
  list.innerHTML = data.list.map((item) => `<li>${item}</li>`).join("");

  if (calculator) {
    calculator.elements.venue.value = key;
    calculator.elements.seats.value = data.seats;
    calculator.elements.model.value = data.model;
    updateCalculator();
  }
}

if (venueTabs) {
  venueTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-venue]");
    if (!button) return;

    venueTabs.querySelectorAll("[data-venue]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    applyVenue(button.dataset.venue);
  });
}

if (packages && calculator) {
  packages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pick-package]");
    if (!button) return;

    const card = button.closest(".collection-card");
    packages.querySelectorAll(".collection-card").forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    calculator.elements.model.value = card.dataset.price;
    updateCalculator();
    document.querySelector("#calculator").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (materials) {
  const stage = document.querySelector("[data-stage]");
  const name = document.querySelector("[data-material-name]");
  const price = document.querySelector("[data-material-price]");
  const desc = document.querySelector("[data-material-desc]");

  materials.addEventListener("click", (event) => {
    const button = event.target.closest("[data-material]");
    if (!button) return;

    const current = materialData[button.dataset.material];
    materials.querySelectorAll("[data-material]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    stage.style.setProperty("--stage-main", current.main);
    stage.style.setProperty("--stage-seat", current.seat);
    name.textContent = current.name;
    price.textContent = current.price ? `+${money(current.price)} / шт` : "+0 грн / шт";
    desc.textContent = current.desc;
  });
}

function updateCalculator() {
  if (!calculator) return;

  const seats = Number(calculator.elements.seats.value);
  const basePrice = Number(calculator.elements.model.value);
  const reserve = Number(calculator.elements.reserve.value);
  const finish = Number(calculator.elements.finish.value);
  const venue = calculator.elements.venue.value;
  const delivery = calculator.elements.delivery.checked ? 4200 : 0;
  const samples = calculator.elements.samples.checked ? 900 : 0;
  const assembly = calculator.elements.assembly.checked ? seats * 180 : 0;

  const venueMultiplier = {
    cafe: 1,
    restaurant: 1.08,
    bar: 1.12,
    terrace: 1.05
  };

  const quantity = Math.ceil(seats * (1 + reserve));
  const total = quantity * (basePrice + finish) * venueMultiplier[venue] + delivery + samples + assembly;
  const leadTime = quantity > 72 ? "18-24 дні" : quantity > 40 ? "14-18 днів" : "10-14 днів";

  calculator.querySelector("[data-seats-label]").textContent = seats;
  calculator.querySelector("[data-total]").textContent = money(total);
  calculator.querySelector("[data-result-note]").textContent = `${quantity} стільців, поставка ${leadTime}`;

  document.querySelector("[data-ticket-total]").textContent = `від ${money(total)}`;
  document.querySelector("[data-ticket-seats]").textContent = `${seats} місць`;
  document.querySelector("[data-ticket-qty]").textContent = `${quantity} шт`;
  document.querySelector("[data-ticket-time]").textContent = leadTime;
}

if (calculator) {
  calculator.addEventListener("input", updateCalculator);
  calculator.addEventListener("change", updateCalculator);
  updateCalculator();
}

if (lead) {
  const phoneInput = lead.elements.phone;
  const status = lead.querySelector("[data-status]");

  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 12);
    const normalized = digits.startsWith("380") ? digits : `380${digits.replace(/^0/, "")}`;
    const parts = [
      normalized.slice(0, 3),
      normalized.slice(3, 5),
      normalized.slice(5, 8),
      normalized.slice(8, 10),
      normalized.slice(10, 12)
    ].filter(Boolean);

    phoneInput.value = `+${parts.join(" ")}`;
  });

  lead.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = lead.elements.name.value.trim();
    const phoneDigits = phoneInput.value.replace(/\D/g, "");

    status.className = "form-status";

    if (name.length < 2 || phoneDigits.length < 12) {
      status.textContent = "Перевірте ім'я та номер телефону.";
      status.classList.add("is-error");
      return;
    }

    status.textContent = "Дякуємо! Ми отримали заявку й підготуємо добірку стільців під ваш формат.";
    status.classList.add("is-success");
    lead.reset();
  });
}
