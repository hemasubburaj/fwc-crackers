// Simple cart stored in localStorage
const CART_KEY = "fwc_cart";

// Safely pass JSON objects through HTML attributes (avoids breakage when
// names/addresses contain apostrophes, quotes, or other special characters).
function encodeSafeData(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function decodeSafeData(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product._id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      productCode: product.productCode,
      price: product.finalPrice,
      image: product.image,
      qty: qty,
    });
  }
  saveCart(cart);
}

function updateQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.productId !== productId);
  } else {
    const item = cart.find((i) => i.productId === productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartCount();
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
