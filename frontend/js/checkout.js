let selectedPayment = "ONLINE";

function renderSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  document.getElementById("sum-subtotal").textContent = `₹${subtotal}`;
  document.getElementById("sum-shipping").textContent = shipping === 0 ? "FREE" : `₹${shipping}`;
  document.getElementById("sum-total").textContent = `₹${total}`;

  if (cart.length === 0) {
    document.getElementById("place-order-btn").disabled = true;
    document.getElementById("place-order-btn").textContent = "Your cart is empty";
  }
  return { subtotal, shipping, total };
}

async function placeOrder(customer, paymentMethod, razorpayInfo = {}) {
  const cart = getCart();
  const payload = {
    customer,
    items: cart.map((item) => ({ productId: item.productId, qty: item.qty })),
    paymentMethod,
    ...razorpayInfo,
  };

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to place order");
  }

  const order = await res.json();
  clearCart();
  localStorage.setItem("last_order", JSON.stringify(order));
  localStorage.setItem("last_order_id", order.orderId);
  window.location.href = `order-success.html?orderId=${encodeURIComponent(order.orderId)}`;
}

async function handleOnlinePayment(customer) {
  const { total } = renderSummary();

  // 1. Create Razorpay order on backend
  const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: total }),
  });
  const data = await res.json();

  if (!data.orderId) {
    alert("Could not initiate payment. Please try again in a moment.");
    return;
  }

  // 2. Open Razorpay checkout widget
  const options = {
    key: data.keyId,
    amount: data.amount,
    currency: data.currency,
    name: "familycrackersworld",
    description: "Order Payment",
    order_id: data.orderId,
    handler: async function (response) {
      // 3. Verify signature on backend
      const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.verified) {
        await placeOrder(customer, "ONLINE", {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
        });
      } else {
        alert("Payment verification failed. Please contact support if amount was deducted.");
      }
    },
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    theme: { color: "#d9a441" },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();

  document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData.entries());

    if (getCart().length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const btn = document.getElementById("place-order-btn");
    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
      if (selectedPayment === "COD") {
        await placeOrder(customer, "COD");
      } else {
        await handleOnlinePayment(customer);
        btn.disabled = false;
        btn.textContent = "Place Order →";
      }
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
      btn.disabled = false;
      btn.textContent = "Place Order →";
    }
  });
});
