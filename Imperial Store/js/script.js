
const PRODUCTS = {
  "dominando-a-teoria-musical": {
    name: "Dominando a Teoria Musical",
    category: "Curso principal",
    price: 297,
    priceLabel: "R$ 297",
    description: "Curso completo para entender teoria musical com clareza, visual premium e foco em aplicação prática.",
    cover: "./assets/cover-dominando.svg",
    buyUrl: "https://hotmart.com/pt-br/marketplace/produtos/dominando-a-teorial-musical/Q97068225U",
    summary: [
      "Fundamentos: notas, claves, compassos e leitura.",
      "Harmonia: escalas, intervalos, tríades e acordes.",
      "Aplicação: exercícios para instrumentos e regência."
    ]
  },
  "mentor": {
    name: "Mentoria de Harmonia",
    category: "Apoio",
    price: 97,
    priceLabel: "R$ 97",
    description: "Pacote demo para acompanhamento musical, rotina de estudo e dúvidas rápidas.",
    cover: "./assets/cover-mentor.svg",
    buyUrl: "#",
    summary: [
      "Rotina guiada e prática.",
      "Revisão de teoria e acordes.",
      "Atendimento rápido por chat."
    ]
  },
  "kit-partitura": {
    name: "Kit Partitura Imperial",
    category: "Kit",
    price: 67,
    priceLabel: "R$ 67",
    description: "Material demo com partituras, guias e organização visual para estudo diário.",
    cover: "./assets/cover-kit.svg",
    buyUrl: "#",
    summary: [
      "Guia de estudo diário.",
      "Partituras e blocos visuais.",
      "Visual elegante para a loja."
    ]
  },
  "suporte": {
    name: "Assistente Imperial",
    category: "Suporte",
    price: 0,
    priceLabel: "Grátis",
    description: "Chat offline que responde por palavra-chave sobre produto, carrinho e compra.",
    cover: "./assets/cover-support.svg",
    buyUrl: "#",
    summary: [
      "Sem API externa.",
      "FAQ com respostas rápidas.",
      "Integração com carrinho."
    ]
  }
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const LS_CART = "imperial-store-cart";
const LS_THEME = "imperial-store-theme";
const LS_ACCENT = "imperial-store-accent";
const LS_MOTION = "imperial-store-motion";

const els = {
  html: document.documentElement,
  body: document.body,
  mobileNav: document.getElementById("mobileNav"),
  cartDrawer: document.getElementById("cartDrawer"),
  settingsDrawer: document.getElementById("settingsDrawer"),
  supportPanel: document.getElementById("supportPanel"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cartCount: document.getElementById("cartCount"),
  toast: document.getElementById("toast"),
  supportMessages: document.getElementById("supportMessages"),
  supportForm: document.getElementById("supportForm"),
  supportInput: document.getElementById("supportInput"),
  chatPreview: document.getElementById("chatPreview"),
  productTitle: document.getElementById("productTitle"),
  productDescription: document.getElementById("productDescription"),
  productPrice: document.getElementById("productPrice"),
  productCategory: document.getElementById("productCategory"),
  productCover: document.getElementById("productCover"),
  buyNowBtn: document.getElementById("buyNowBtn")
};

let cart = loadCart();
let activeProduct = null;

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_CART)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(LS_CART, JSON.stringify(cart));
  updateCartUI();
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(LS_THEME, theme);
}

function setAccent(color) {
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem(LS_ACCENT, color);
}

function setMotion(enabled) {
  localStorage.setItem(LS_MOTION, enabled ? "1" : "0");
  document.documentElement.style.scrollBehavior = enabled ? "smooth" : "auto";
  document.documentElement.style.setProperty("--motion", enabled ? "1" : "0");
  document.querySelector(".ticker-track")?.style.setProperty("animation-play-state", enabled ? "running" : "paused");
}

function initPrefs() {
  setTheme(localStorage.getItem(LS_THEME) || document.documentElement.getAttribute("data-theme") || "dark");
  const accent = localStorage.getItem(LS_ACCENT);
  if (accent) setAccent(accent);
  const motion = localStorage.getItem(LS_MOTION);
  setMotion(motion !== "0");
  const motionToggle = document.getElementById("motionToggle");
  if (motionToggle) motionToggle.checked = motion !== "0";
}

function toast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function openDrawer(drawer, overlay = true) {
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  if (overlay) document.querySelector(`.overlay[data-close="${drawer.id}"]`)?.classList.add("open");
}

function closeDrawer(drawer) {
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.querySelector(`.overlay[data-close="${drawer.id}"]`)?.classList.remove("open");
}

function addToCart(name, price) {
  const item = cart.find(x => x.name === name);
  if (item) item.qty += 1;
  else cart.push({ name, price: Number(price) || 0, qty: 1 });
  saveCart();
  toast(`${name} adicionado ao carrinho`);
  openDrawer(els.cartDrawer);
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
}

function changeQty(name, delta) {
  const item = cart.find(x => x.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.name !== name);
  saveCart();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (els.cartCount) els.cartCount.textContent = totalItems;
  if (els.cartTotal) els.cartTotal.textContent = currency.format(total);
  if (!els.cartItems) return;

  els.cartItems.innerHTML = "";
  if (!cart.length) {
    els.cartItems.innerHTML = `<div class="cart-item"><strong>Carrinho vazio</strong><p>Adicione um curso para ver o resumo aqui.</p></div>`;
    return;
  }

  cart.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className = "cart-item";
    wrap.innerHTML = `
      <div class="cart-item-row">
        <strong>${item.name}</strong>
        <span>${currency.format(item.price)}</span>
      </div>
      <div class="cart-item-row">
        <div class="qty-controls">
          <button type="button" aria-label="Diminuir" data-minus="${item.name}">−</button>
          <span>${item.qty}</span>
          <button type="button" aria-label="Aumentar" data-plus="${item.name}">+</button>
        </div>
        <button type="button" class="remove-btn" data-remove="${item.name}">Remover</button>
      </div>
    `;
    els.cartItems.appendChild(wrap);
  });
}

function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".add-cart");
    if (addBtn) {
      addToCart(addBtn.dataset.name, addBtn.dataset.price);
      return;
    }

    const openCart = event.target.closest("[data-open-cart], #cartBtn");
    if (openCart) {
      openDrawer(els.cartDrawer);
      return;
    }

    const openSupport = event.target.closest("[data-open-support]");
    if (openSupport) {
      openSupportPanel();
      return;
    }

    const closeTarget = event.target.closest("[data-close]");
    if (closeTarget) {
      closeDrawer(document.getElementById(closeTarget.dataset.close));
      if (closeTarget.dataset.close === "settingsDrawer") updateSettingsUI();
      return;
    }

    const minus = event.target.closest("[data-minus]");
    if (minus) {
      changeQty(minus.dataset.minus, -1);
      return;
    }

    const plus = event.target.closest("[data-plus]");
    if (plus) {
      changeQty(plus.dataset.plus, 1);
      return;
    }

    const remove = event.target.closest("[data-remove]");
    if (remove) {
      removeFromCart(remove.dataset.remove);
      return;
    }
  });
}

function bindMenuToggle() {
  document.getElementById("menuBtn")?.addEventListener("click", () => {
    els.mobileNav?.classList.toggle("open");
    if (els.mobileNav) els.mobileNav.style.display = els.mobileNav.classList.contains("open") ? "flex" : "";
  });

  document.getElementById("settingsBtn")?.addEventListener("click", () => openDrawer(els.settingsDrawer));
  document.getElementById("cartBtn")?.addEventListener("click", () => openDrawer(els.cartDrawer));
}

function updateSettingsUI() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  document.querySelectorAll("[data-theme-choice]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeChoice === currentTheme);
  });

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  document.querySelectorAll(".accent-swatch").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.accent === accent);
  });
}

function bindSettings() {
  document.addEventListener("click", (event) => {
    const themeChoice = event.target.closest("[data-theme-choice]");
    if (themeChoice) {
      setTheme(themeChoice.dataset.themeChoice);
      updateSettingsUI();
      return;
    }

    const accentChoice = event.target.closest("[data-accent]");
    if (accentChoice) {
      setAccent(accentChoice.dataset.accent);
      updateSettingsUI();
      return;
    }
  });

  document.getElementById("motionToggle")?.addEventListener("change", (e) => {
    setMotion(e.target.checked);
    toast(e.target.checked ? "Animações ativadas" : "Animações pausadas");
  });
}

function productFromQuery() {
  const slug = new URLSearchParams(location.search).get("produto");
  return PRODUCTS[slug] || PRODUCTS["dominando-a-teoria-musical"];
}

function renderProductPage() {
  const product = productFromQuery();
  activeProduct = product;
  if (els.productTitle) els.productTitle.textContent = product.name;
  if (els.productDescription) els.productDescription.textContent = product.description;
  if (els.productPrice) els.productPrice.textContent = product.priceLabel;
  if (els.productCategory) els.productCategory.textContent = product.category;
  if (els.productCover) els.productCover.src = product.cover;
  if (els.buyNowBtn) {
    els.buyNowBtn.dataset.name = product.name;
    els.buyNowBtn.dataset.price = product.price;
    els.buyNowBtn.textContent = product.price ? `Comprar / carrinho — ${product.priceLabel}` : "Abrir suporte / carrinho";
  }

  if (document.title.includes("Produto") && product.name) {
    document.title = `Imperial Store — ${product.name}`;
  }
}

function openSupportPanel() {
  els.supportPanel?.classList.add("open");
  els.supportPanel?.setAttribute("aria-hidden", "false");
  if (els.supportInput) setTimeout(() => els.supportInput.focus(), 50);
}

function closeSupportPanel() {
  els.supportPanel?.classList.remove("open");
  els.supportPanel?.setAttribute("aria-hidden", "true");
}

function botReply(text) {
  const msg = document.createElement("div");
  msg.className = "msg bot";
  msg.textContent = text;
  els.supportMessages?.appendChild(msg);
  els.supportMessages?.scrollTo({ top: els.supportMessages.scrollHeight, behavior: "smooth" });
}

function userReply(text) {
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.textContent = text;
  els.supportMessages?.appendChild(msg);
  els.supportMessages?.scrollTo({ top: els.supportMessages.scrollHeight, behavior: "smooth" });
}

function smartSupportAnswer(input) {
  const text = input.toLowerCase();

  if (text.includes("preço") || text.includes("valor") || text.includes("quanto")) {
    return "O curso principal aparece como R$ 297 nesta demo. O botão de compra leva para a página oficial da Hotmart.";
  }
  if (text.includes("módulo") || text.includes("conteúdo") || text.includes("aula")) {
    return "Os módulos destacam fundamentos, harmonia e aplicação prática em instrumentos.";
  }
  if (text.includes("carrinho") || text.includes("comprar")) {
    return "Clique em 'Adicionar ao carrinho' ou no botão de compra do produto. O carrinho fica salvo no navegador.";
  }
  if (text.includes("instrumento") || text.includes("violão") || text.includes("piano") || text.includes("violino")) {
    return "A identidade visual foi pensada para combinar com instrumentos, partituras e a vibe de conservatório.";
  }
  if (text.includes("api") || text.includes("offline") || text.includes("ia")) {
    return "Este chat é local e funciona sem API. Ele responde por palavras-chave e cobre as perguntas mais comuns.";
  }
  if (text.includes("hotmart")) {
    return "O produto principal aponta para a página da Hotmart. A loja serve como vitrine e organização da oferta.";
  }
  return "Entendi. Tenta perguntar sobre preço, módulos, carrinho, Hotmart ou instrumentos.";
}

function bindSupport() {
  document.getElementById("closeSupport")?.addEventListener("click", closeSupportPanel);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-support]")) openSupportPanel();
  });

  els.supportForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = els.supportInput.value.trim();
    if (!input) return;
    userReply(input);
    botReply(smartSupportAnswer(input));
    els.supportInput.value = "";
  });
}

function bindCheckout() {
  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    if (!cart.length) {
      toast("O carrinho está vazio");
      return;
    }
    toast("Checkout de demonstração pronto");
    const summary = cart.map(item => `${item.qty}x ${item.name}`).join(" • ");
    alert(`Pedido de demonstração:\n${summary}\n\nTotal: ${document.getElementById("cartTotal")?.textContent || "R$ 0"}`);
  });
}

function bindFilters() {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".product-card").forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });
}

function closeOnEscape() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDrawer(els.cartDrawer);
    closeDrawer(els.settingsDrawer);
    closeSupportPanel();
    els.mobileNav?.classList.remove("open");
    if (els.mobileNav) els.mobileNav.style.display = "";
  });
}

function boot() {
  initPrefs();
  bindCartEvents();
  bindMenuToggle();
  bindSettings();
  bindSupport();
  bindCheckout();
  bindFilters();
  closeOnEscape();
  updateCartUI();
  renderProductPage();
  updateSettingsUI();

  document.querySelectorAll("[data-open-cart]").forEach(el => {
    el.addEventListener("click", () => openDrawer(els.cartDrawer));
  });

  document.querySelectorAll("[data-open-support]").forEach(el => {
    el.addEventListener("click", openSupportPanel);
  });

  if (document.querySelector(".product-page") && activeProduct?.buyUrl) {
    document.getElementById("buyNowBtn")?.addEventListener("click", () => {
      if (activeProduct.buyUrl && activeProduct.buyUrl !== "#") {
        window.open(activeProduct.buyUrl, "_blank", "noopener,noreferrer");
      }
    });
  }
}

boot();
