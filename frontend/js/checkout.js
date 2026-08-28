let selectedPayment = "COD";

// ========================================
// ORDER SUMMARY
// ========================================

function renderSummary() {
  const cart = getCart();

  const subtotal = getCartTotal();

  const shipping =
    subtotal >= 2000 || subtotal === 0
      ? 0
      : 150;

  const total = subtotal + shipping;

  const subtotalEl = document.getElementById("sum-subtotal");
  const shippingEl = document.getElementById("sum-shipping");
  const totalEl = document.getElementById("sum-total");

  if (subtotalEl) {
    subtotalEl.textContent = `₹${subtotal}`;
  }

  if (shippingEl) {
    shippingEl.textContent =
      shipping === 0 ? "FREE" : `₹${shipping}`;
  }

  if (totalEl) {
    totalEl.textContent = `₹${total}`;
  }

  return {
    subtotal,
    shipping,
    total
  };
}


// ========================================
// PLACE ORDER
// ========================================

async function placeOrder(customer) {

  const cart = getCart();

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const {
    subtotal,
    shipping,
    total
  } = renderSummary();


  // Prepare items
  const items = cart.map(item => ({
    productId: item.productId,
    name: item.name || "",
    productCode: item.productCode || "",
    price: Number(item.price) || 0,
    qty: Number(item.qty) || 1,
    image: item.image || ""
  }));


  // Payload
  const payload = {

    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address,
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || ""
    },

    items,

    subtotal,

    shipping,

    totalAmount: total,

    paymentMethod: "COD"
  };


  console.log("================================");
  console.log("📦 SENDING ORDER");
  console.log("================================");
  console.log(payload);


  // ========================================
  // SEND TO BACKEND
  // ========================================

  const response = await fetch(
    `${API_BASE_URL}/orders`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    }
  );


  // Get response
  let data;

  try {

    data = await response.json();

  } catch (error) {

    throw new Error(
      "Backend returned an invalid response."
    );

  }


  console.log("================================");
  console.log("📥 BACKEND RESPONSE");
  console.log("================================");
  console.log(data);


  // Backend error
  if (!response.ok) {

    throw new Error(
      data.message ||
      "Failed to place order."
    );

  }


  // ========================================
  // CHECK ORDER ID
  // ========================================

  if (!data.orderId) {

    console.error(
      "❌ Backend response does not contain orderId:",
      data
    );

    throw new Error(
      "Order created, but Order ID was not received."
    );

  }


  console.log(
    "✅ ORDER CREATED:",
    data.orderId
  );


  // ========================================
  // CLEAR CART
  // ========================================

  clearCart();


  // ========================================
  // SAVE ORDER
  // ========================================

  localStorage.setItem(
    "last_order",
    JSON.stringify(data)
  );

  localStorage.setItem(
    "last_order_id",
    data.orderId
  );


  // ========================================
  // REDIRECT TO SUCCESS PAGE
  // ========================================

  const successUrl =
    `order-success.html?orderId=${encodeURIComponent(
      data.orderId
    )}`;

  console.log(
    "➡️ Redirecting to:",
    successUrl
  );


  window.location.href = successUrl;
}


// ========================================
// CHECKOUT PAGE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log("✅ checkout.js loaded");


    renderSummary();


    const form =
      document.getElementById("checkout-form");

    const button =
      document.getElementById("confirm-booking");


    if (!form) {

      console.error(
        "❌ checkout-form not found"
      );

      return;
    }


    if (!button) {

      console.error(
        "❌ confirm-booking button not found"
      );

      return;
    }


    // ========================================
    // CONFIRM BOOKING
    // ========================================

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        console.log(
          "🟢 Confirm Booking clicked"
        );


        // ====================================
        // CHECK CART
        // ====================================

        const cart = getCart();


        if (!cart || cart.length === 0) {

          alert(
            "Your cart is empty."
          );

          return;
        }


        // ====================================
        // GET FORM DATA
        // ====================================

        const formData =
          new FormData(form);

        const customer =
          Object.fromEntries(
            formData.entries()
          );


        console.log(
          "👤 CUSTOMER:",
          customer
        );


        // ====================================
        // VALIDATION
        // ====================================

        if (!customer.name?.trim()) {

          alert(
            "Please enter your name."
          );

          return;
        }


        if (!customer.phone?.trim()) {

          alert(
            "Please enter your phone number."
          );

          return;
        }


        if (!customer.address?.trim()) {

          alert(
            "Please enter your address."
          );

          return;
        }


        if (!customer.city?.trim()) {

          alert(
            "Please enter your city."
          );

          return;
        }


        if (!customer.state?.trim()) {

          alert(
            "Please enter your state."
          );

          return;
        }


        if (!customer.pincode?.trim()) {

          alert(
            "Please enter your pincode."
          );

          return;
        }


        // ====================================
        // BUTTON LOADING
        // ====================================

        button.disabled = true;

        button.textContent =
          "Placing Order...";


        try {

          await placeOrder(
            customer
          );

        } catch (error) {

          console.error(
            "❌ ORDER ERROR:",
            error
          );


          alert(
            error.message ||
            "Could not place your order."
          );


          button.disabled = false;

          button.textContent =
            "Confirm Booking";
        }

      }
    );

  }
);