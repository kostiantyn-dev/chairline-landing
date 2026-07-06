const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const filterGroup = document.querySelector("[data-filter-group]");
const products = document.querySelector("[data-products]");
const materials = document.querySelector("[data-materials]");
const quote = document.querySelector("[data-quote]");
const lead = document.querySelector("[data-lead]");
const stickyCta = document.querySelector("[data-sticky-cta]");
const revealItems = document.querySelectorAll(".section, .hero-board, .hero-strip");

const money = (value) => `${Math.round(value).toLocaleString("uk-UA")} грн`;

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

  revealItems.forEach((item) => {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.addEventListener("scroll", () => {
  if (!stickyCta) return;
  stickyCta.classList.toggle("is-visible", window.scrollY > 720);
}, { passive: true });

if (filterGroup && products) {
  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    const filter = button.dataset.filter;
    filterGroup.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    products.querySelectorAll(".product-card").forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });

  products.addEventListener("click", (event) => {
    const button = event.target.closest("[data-product-pick]");
    if (!button || !quote) return;

    const card = button.closest(".product-card");
    const modelSelect = quote.elements.model;
    const matchingOption = [...modelSelect.options].find((option) => option.textContent === card.dataset.name);

    products.querySelectorAll(".product-card").forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");

    if (matchingOption) {
      modelSelect.value = matchingOption.value;
      updateQuote();
      document.querySelector("#quote").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

const materialData = {
  wood: {
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
    main: "#667249",
    seat: "#4c5535"
  },
  clay: {
    name: "Terracotta accent",
    price: 560,
    desc: "Теплий акцент для фотогенічних залів і терас.",
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
    price.textContent = current.price ? `+${money(current.price)} / шт` : "+0 грн";
    desc.textContent = current.desc;
  });
}

function updateQuote() {
  if (!quote) return;

  const seats = Number(quote.elements.seats.value);
  const basePrice = Number(quote.elements.model.value);
  const reserve = Number(quote.elements.reserve.value);
  const finish = Number(quote.elements.finish.value);
  const delivery = quote.elements.delivery.checked ? 4200 : 0;
  const samples = quote.elements.samples.checked ? 900 : 0;
  const assembly = quote.elements.assembly.checked ? seats * 180 : 0;
  const city = quote.elements.city.value;
  const venue = quote.elements.venue.value;

  const cityMultiplier = {
    kyiv: 1,
    lviv: 1.04,
    odesa: 1.06,
    dnipro: 1.03
  };

  const venueMultiplier = {
    cafe: 1,
    restaurant: 1.08,
    bar: 1.12,
    terrace: 1.05
  };

  const quantity = Math.ceil(seats * (1 + reserve));
  const subtotal = quantity * (basePrice + finish);
  const total = subtotal * cityMultiplier[city] * venueMultiplier[venue] + delivery + samples + assembly;
  const leadTime = quantity > 70 ? "18-24 дні" : quantity > 38 ? "14-18 днів" : "10-14 днів";

  quote.querySelector("[data-seats-label]").textContent = seats;
  quote.querySelector("[data-total]").textContent = money(total);
  quote.querySelector("[data-result-note]").textContent = `${quantity} стільців, поставка ${leadTime}`;

  const heroTotal = document.querySelector("[data-hero-total]");
  const heroCopy = document.querySelector("[data-hero-copy]");
  if (heroTotal && heroCopy) {
    heroTotal.textContent = `від ${money(total)}`;
    heroCopy.textContent = `${seats} посадкові місця, ${quantity} стільців у партії`;
  }
}

if (quote) {
  quote.addEventListener("input", updateQuote);
  updateQuote();
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

    status.textContent = "Готово. У реальному проєкті менеджер отримав би заявку та підбірку формату.";
    status.classList.add("is-success");
    lead.reset();
  });
}
