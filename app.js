const products = [
  { id: 1, name: "Vas Keramik Senja", category: "Rumah", price: 189000, tag: "Bestseller", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Tas Kanvas Rona", category: "Gaya", price: 149000, tag: "Lokal", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Sabun Alami Pagi", category: "Perawatan", price: 68000, tag: "Natural", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Cangkir Tanah Liat", category: "Rumah", price: 125000, tag: "Handmade", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Minyak Esensial Teduh", category: "Perawatan", price: 96000, tag: "Favorit", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Syal Tenun Awan", category: "Gaya", price: 215000, tag: "Tenun lokal", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Pouch Kulit Aruna", category: "Aksesori", price: 175000, tag: "Kulit asli", image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Lilin Aromaterapi Hening", category: "Rumah", price: 112000, tag: "Wangi baru", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80" },
];

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const categoryList = document.querySelector("#category-list");
const drawer = document.querySelector("#cart-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const toast = document.querySelector("#toast");
let activeCategory = "Semua";
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("loka-cart") || "[]");
    return Array.isArray(saved) ? saved.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("id");
  let visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Semua" || product.category === activeCategory;
    return matchesCategory && `${product.name} ${product.category} ${product.tag}`.toLocaleLowerCase("id").includes(query);
  });

  if (sortSelect.value === "low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "high") visibleProducts.sort((a, b) => b.price - a.price);

  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 45}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-bottom">
          <span class="product-price">${rupiah.format(product.price)}</span>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="Tambah ${product.name} ke keranjang">+</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
}

function saveCart() {
  localStorage.setItem("loka-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + products.find((product) => product.id === item.id).price * item.quantity, 0);
  document.querySelector("#cart-count").textContent = itemCount;
  document.querySelector("#drawer-count").textContent = `(${itemCount})`;
  document.querySelector("#cart-subtotal").textContent = rupiah.format(subtotal);
  document.querySelector("#cart-empty").hidden = itemCount > 0;
  document.querySelector("#cart-footer").hidden = itemCount === 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<article class="cart-row">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h3 class="cart-row-name">${product.name}</h3>
        <p class="cart-row-price">${rupiah.format(product.price)}</p>
        <div class="quantity-control" aria-label="Jumlah ${product.name}">
          <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Kurangi jumlah">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Tambah jumlah">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Hapus ${product.name}">×</button>
    </article>`;
  }).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function openCart() {
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("is-visible"));
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("is-visible");
  document.body.classList.remove("drawer-open");
  setTimeout(() => { if (!drawer.classList.contains("is-open")) backdrop.hidden = true; }, 250);
  document.querySelector("#open-cart").focus();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  showToast(`${products.find((product) => product.id === id).name} ditambahkan ke keranjang`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) cart = cart.filter((item) => item.id !== Number(removeButton.dataset.remove));
  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const item = cart.find((entry) => entry.id === id);
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  }
  saveCart();
});

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryList.querySelector(".is-active").classList.remove("is-active");
  button.classList.add("is-active");
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);
document.querySelector("#checkout-button").addEventListener("click", () => showToast("Checkout demo siap dikembangkan lebih lanjut."));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawer.classList.contains("is-open")) closeCart();
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

renderProducts();
renderCart();