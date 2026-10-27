// Beginner-friendly menu data. Add prices as numbers when ready, for example: price: 4.50
const products = [
  { id: 'espresso', name: 'Espresso', category: 'coffee', image: 'assets/espresso.png', width: 499, height: 375, description: 'Rich, concentrated, and beautifully simple.', price: null },
  { id: 'americano', name: 'Americano', category: 'coffee', image: 'assets/americano.png', width: 452, height: 678, description: 'Espresso softened with hot water.', price: null },
  { id: 'cappuccino', name: 'Cappuccino', category: 'coffee', image: 'assets/cappuccino.png', width: 545, height: 366, description: 'Espresso, steamed milk, and a soft foam top.', price: null },
  { id: 'latte', name: 'Latte', category: 'coffee', image: 'assets/latte.png', width: 554, height: 554, description: 'A comforting espresso and silky steamed milk.', price: null },
  { id: 'macchiato', name: 'Macchiato', category: 'coffee', image: 'assets/macchiato.png', width: 580, height: 528, description: 'Espresso marked with a little milk foam.', price: null },
  { id: 'flat-white', name: 'Flat White', category: 'coffee', image: 'assets/flat-white.png', width: 597, height: 335, description: 'A smooth, balanced espresso with fine milk.', price: null }
];

const cartKey = 'yourCoffeeShopCart';
let cart = JSON.parse(localStorage.getItem(cartKey) || '{}');
let toastTimer;
let previousFocus = null;
// Prices are shown without a currency symbol until you set the shop's currency.
const money = amount => Number(amount).toFixed(2);

function renderProducts(category = 'all') {
  const grid = document.querySelector('#product-grid');
  const visible = products.filter(product => category === 'all' || product.category === category || (category === 'other' && ['tea', 'other'].includes(product.category)));
  grid.innerHTML = visible.map((product, index) => `
    <article class="product-card">
      <div class="product-image"><img src="${product.image}" alt="${product.name}" width="${product.width}" height="${product.height}" loading="lazy" decoding="async"><span class="product-number">0${index + 1} / COFFEE</span></div>
      <div class="product-info"><div class="product-title-row"><h3>${product.name}</h3><span class="product-price">${product.price == null ? 'Price: [add]' : money(product.price)}</span></div>
      <p class="product-desc">${product.description}</p>
      <button class="order-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to your bag">Order now <span>＋</span></button></div>
    </article>`).join('');
}

function saveCart() { localStorage.setItem(cartKey, JSON.stringify(cart)); renderCart(); }
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  showToast(`${products.find(item => item.id === id).name} added to your bag`);
}
function removeFromCart(id) { delete cart[id]; saveCart(); }
function renderCart() {
  const entries = Object.entries(cart).filter(([id, count]) => products.some(item => item.id === id) && count > 0);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-heading-count').textContent = `(${count})`;
  document.querySelector('#cart-items').innerHTML = count === 0 ? '<div class="empty-cart"><strong>Your bag is taking a little pause.</strong><p>Pick a favorite from the menu and it’ll be waiting here.</p></div>' : entries.map(([id, quantity]) => {
    const item = products.find(product => product.id === id);
    return `<div class="cart-line"><div><strong>${item.name} <span>× ${quantity}</span></strong><small>${item.price == null ? 'Price: [add]' : money(item.price * quantity)}</small></div><button type="button" data-remove="${id}" aria-label="Remove ${item.name} from your bag">Remove</button></div>`;
  }).join('');
  const hasPrices = entries.length > 0 && entries.every(([id]) => products.find(item => item.id === id).price != null);
  const total = entries.reduce((sum, [id, quantity]) => sum + (products.find(item => item.id === id).price || 0) * quantity, 0);
  document.querySelector('#cart-total').textContent = hasPrices ? money(total) : 'Add product prices';
}
function openCart() {
  const panel = document.querySelector('#cart-panel');
  previousFocus = document.activeElement;
  panel.removeAttribute('inert');
  panel.classList.add('open');
  document.querySelector('#cart-panel').setAttribute('aria-hidden', 'false');
  document.querySelector('#cart-backdrop').hidden = false;
  document.body.classList.add('cart-open');
  document.querySelector('[data-close-cart]').focus();
}
function closeCart() {
  const panel = document.querySelector('#cart-panel');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');
  document.querySelector('#cart-backdrop').hidden = true;
  document.body.classList.remove('cart-open');
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  const remove = event.target.closest('[data-remove]');
  const filter = event.target.closest('[data-category]');
  if (add) addToCart(add.dataset.add);
  if (remove) removeFromCart(remove.dataset.remove);
  if (filter) {
    document.querySelectorAll('.filter').forEach(button => {
      const isActive = button === filter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    renderProducts(filter.dataset.category);
  }
  if (event.target.closest('[data-open-cart]')) openCart();
  if (event.target.closest('[data-close-cart]') || event.target.id === 'cart-backdrop') closeCart();
  if (event.target.closest('[data-directions]')) {
    const address = '[Add your shop address]'; // Replace with the real address to enable Google Maps.
    if (!address || address.includes('[')) showToast('Add your shop address in script.js first.');
    else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener');
  }
  if (event.target.closest('#main-nav a')) {
    document.querySelector('#main-nav').classList.remove('open');
    document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
      document.querySelector('.nav-toggle').setAttribute('aria-label', 'Open navigation');
  }
});

document.querySelector('.nav-toggle').addEventListener('click', event => {
  const menu = document.querySelector('#main-nav');
  const isOpen = menu.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(isOpen));
  event.currentTarget.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
document.addEventListener('keydown', event => {
  const panel = document.querySelector('#cart-panel');
  const mobileNav = document.querySelector('#main-nav');
  if (event.key === 'Escape') {
    if (panel.classList.contains('open')) closeCart();
    if (mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
      document.querySelector('.nav-toggle').setAttribute('aria-label', 'Open navigation');
      document.querySelector('.nav-toggle').focus();
    }
  }
  if (event.key === 'Tab' && panel.classList.contains('open')) {
    const focusable = [...panel.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderProducts();
renderCart();
