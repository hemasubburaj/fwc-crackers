/* =========================================================
   FAMILY CRACKERS WORLD - CART SYSTEM
   LocalStorage based cart
========================================================= */

const CART_KEY = "fwc_cart";


/* =========================================================
   SAFE DATA ENCODE / DECODE
========================================================= */

function encodeSafeData(obj) {
  return btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify(obj)
      )
    )
  );
}

function decodeSafeData(str) {
  return JSON.parse(
    decodeURIComponent(
      escape(atob(str))
    )
  );
}


/* =========================================================
   GET CART
========================================================= */

function getCart() {
  const cart = localStorage.getItem(CART_KEY);

  if (!cart) {
    return [];
  }

  try {
    return JSON.parse(cart);
  } catch (error) {
    console.error("Invalid cart data:", error);

    localStorage.removeItem(CART_KEY);

    return [];
  }
}




/* =========================================================
   SAVE CART
========================================================= */

function saveCart(cart) {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  updateCartBadge();
}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(product, qty = 1) {

  if (!product) {
    console.error("Product is missing");
    return;
  }

  if (!product._id) {
    console.error("Product ID is missing:", product);
    return;
  }

  qty = Number(qty);

  if (qty <= 0 || isNaN(qty)) {
    qty = 1;
  }

  const cart = getCart();

  const existingItem = cart.find(
    item => item.productId === product._id
  );


  /* -------------------------------------------------------
     PRODUCT ALREADY EXISTS
  ------------------------------------------------------- */

  if (existingItem) {

    existingItem.qty =
      Number(existingItem.qty) + qty;

  }


  /* -------------------------------------------------------
     NEW PRODUCT
  ------------------------------------------------------- */

  else {

    cart.push({

      productId: product._id,

      name: product.name || "Product",

      productCode:
        product.productCode || "",

      price:
        Number(product.finalPrice) || 0,

      image:
        product.image || "",

      qty: qty

    });

  }


  /* SAVE */

  saveCart(cart);


  /* UPDATE BADGE */

  updateCartBadge();


  /* SUCCESS MESSAGE + CHECKOUT PROMPT */

  showCartMessage(
    `${product.name || "Product"} added to cart`
  );

  setTimeout(() => {

    const goCheckout = confirm(
      `${product.name || "Product"} added to cart successfully!\n\nDo you want to checkout now?`
    );

    if (goCheckout) {
      window.location.href = "checkout.html";
    }

  }, 150);
}


/* =========================================================
   UPDATE QUANTITY
========================================================= */

function updateQty(productId, qty) {

  let cart = getCart();

  qty = Number(qty);


  /* -------------------------------------------------------
     REMOVE IF QUANTITY IS ZERO
  ------------------------------------------------------- */

  if (qty <= 0) {

    cart = cart.filter(
      item => item.productId !== productId
    );

  }


  /* -------------------------------------------------------
     UPDATE QUANTITY
  ------------------------------------------------------- */

  else {

    const item = cart.find(
      item => item.productId === productId
    );

    if (item) {

      item.qty = qty;

    }

  }


  saveCart(cart);

  updateCartBadge();
}


/* =========================================================
   INCREASE QUANTITY
========================================================= */

function increaseQty(productId) {

  const cart = getCart();

  const item = cart.find(
    item => item.productId === productId
  );

  if (!item) {
    return;
  }

  item.qty++;

  saveCart(cart);

  updateCartBadge();
}


/* =========================================================
   DECREASE QUANTITY
========================================================= */

function decreaseQty(productId) {

  const cart = getCart();

  const item = cart.find(
    item => item.productId === productId
  );

  if (!item) {
    return;
  }

  item.qty--;

  if (item.qty <= 0) {

    const newCart = cart.filter(
      item => item.productId !== productId
    );

    saveCart(newCart);

  } else {

    saveCart(cart);

  }

  updateCartBadge();
}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

  const cart = getCart().filter(
    item => item.productId !== productId
  );

  saveCart(cart);

  updateCartBadge();
}


/* =========================================================
   CLEAR CART
========================================================= */

function clearCart() {

  localStorage.removeItem(CART_KEY);

  updateCartBadge();
}


/* =========================================================
   CART TOTAL
========================================================= */

function getCartTotal() {

  return getCart().reduce(
    (total, item) => {

      const price =
        Number(item.price) || 0;

      const qty =
        Number(item.qty) || 0;

      return total + (price * qty);

    },
    0
  );
}


/* =========================================================
   CART COUNT
========================================================= */

function getCartCount() {

  return getCart().reduce(
    (total, item) => {

      return total + (
        Number(item.qty) || 0
      );

    },
    0
  );
}


/* =========================================================
   UPDATE CART BADGE
========================================================= */

function updateCartBadge() {

  const badge =
    document.getElementById("cart-count");

  if (!badge) {
    return;
  }

  badge.textContent = getCartCount();
}


/* =========================================================
   CART MESSAGE
========================================================= */

function showCartMessage(message) {

  /* Remove old message */

  const oldMessage =
    document.getElementById("cart-message");

  if (oldMessage) {
    oldMessage.remove();
  }


  /* Create message */

  const messageBox =
    document.createElement("div");

  messageBox.id = "cart-message";

  messageBox.textContent = message;


  /* Style */

  messageBox.style.position = "fixed";
  messageBox.style.top = "80px";
  messageBox.style.right = "20px";
  messageBox.style.zIndex = "9999";

  messageBox.style.background = "#221008";
  messageBox.style.color = "#fff";

  messageBox.style.padding =
    "12px 18px";

  messageBox.style.borderRadius =
    "8px";

  messageBox.style.fontSize =
    "14px";

  messageBox.style.fontWeight =
    "600";

  messageBox.style.boxShadow =
    "0 8px 25px rgba(0,0,0,0.2)";

  messageBox.style.opacity = "0";

  messageBox.style.transform =
    "translateY(-10px)";

  messageBox.style.transition =
    "all 0.25s ease";


  document.body.appendChild(
    messageBox
  );


  /* Animation */

  requestAnimationFrame(() => {

    messageBox.style.opacity = "1";

    messageBox.style.transform =
      "translateY(0)";

  });


  /* Remove */

  setTimeout(() => {

    messageBox.style.opacity = "0";

    messageBox.style.transform =
      "translateY(-10px)";

    setTimeout(() => {

      messageBox.remove();

    }, 250);

  }, 1800);
}


/* =========================================================
   ADD TO CART BUTTON HANDLER
========================================================= */

document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(".add-btn");

    if (!button) {
      return;
    }


    /* If button already has onclick,
       don't interfere */

    if (
      button.hasAttribute("onclick")
    ) {
      return;
    }


    const encodedProduct =
      button.dataset.product;

    if (!encodedProduct) {

      console.error(
        "data-product is missing from Add to Cart button"
      );

      return;
    }


    try {

      const product =
        decodeSafeData(encodedProduct);

      addToCart(product);

    } catch (error) {

      console.error(
        "Unable to add product to cart:",
        error
      );

    }

  }
);


/* =========================================================
   UPDATE BADGE WHEN PAGE LOADS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateCartBadge();

  }
);


/* =========================================================
   UPDATE BADGE WHEN USER RETURNS TO TAB
========================================================= */

window.addEventListener(
  "storage",
  function (event) {

    if (event.key === CART_KEY) {

      updateCartBadge();

    }

  }
);