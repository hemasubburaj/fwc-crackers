let selectedPayment = "COD";

// ========================================
// ORDER SUMMARY
// ========================================

function renderSummary() {
  const cart = getCart();

  // SHIPPING REMOVED
  const subtotal = getCartTotal();

  // Total = Subtotal only
  const total = subtotal;

  const subtotalEl =
    document.getElementById("sum-subtotal");

  const totalEl =
    document.getElementById("sum-total");

  if (subtotalEl) {
    subtotalEl.textContent = `₹${subtotal}`;
  }

  if (totalEl) {
    totalEl.textContent = `₹${total}`;
  }

  if (typeof updateMinimumOrder === "function") {
    updateMinimumOrder();
  }

  return {
    subtotal,
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
    total
  } = renderSummary();


  // ========================================
  // PREPARE ITEMS
  // ========================================

  const items = cart.map(item => ({
    productId: item.productId,
    name: item.name || "",
    productCode: item.productCode || "",
    price: Number(item.price) || 0,
    qty: Number(item.qty) || 1,
    image: item.image || ""
  }));


  // ========================================
  // ORDER PAYLOAD
  // ========================================

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

    // SHIPPING REMOVED
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


  // ========================================
  // GET RESPONSE
  // ========================================

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


  // ========================================
  // BACKEND ERROR
  // ========================================

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


    // ========================================
    // LOCATION + MINIMUM ORDER
    // ========================================

    const locationData = {
      "Tamil Nadu": {
        minimum: 2500,
        districts: {
          "Virudhunagar": ["Sivakasi", "Virudhunagar", "Rajapalayam", "Aruppukkottai"],
          "Madurai": ["Madurai"],
          "Tirunelveli": ["Tirunelveli", "Palayamkottai"],
          "Thoothukudi": ["Thoothukudi", "Kovilpatti"],
          "Chennai": ["Chennai"],
          "Coimbatore": ["Coimbatore"],
          "Tiruchirappalli": ["Tiruchirappalli"],
          "Salem": ["Salem"],
          "Dindigul": ["Dindigul"],
          "Thanjavur": ["Thanjavur"],
          "Kanyakumari": ["Nagercoil"],
          "Other": ["Other"]
        }
      },

      "Kerala": {
        minimum: 3000,
        districts: {
          "Thiruvananthapuram": ["Thiruvananthapuram"],
          "Kollam": ["Kollam"],
          "Pathanamthitta": ["Pathanamthitta"],
          "Alappuzha": ["Alappuzha"],
          "Kottayam": ["Kottayam"],
          "Ernakulam": ["Kochi"],
          "Thrissur": ["Thrissur"],
          "Palakkad": ["Palakkad"],
          "Malappuram": ["Malappuram"],
          "Kozhikode": ["Kozhikode"],
          "Kannur": ["Kannur"],
          "Kasaragod": ["Kasaragod"],
          "Other": ["Other"]
        }
      }
    };


    const stateSelect =
      document.getElementById("state");

    const districtSelect =
      document.getElementById("district");

    const citySelect =
      document.getElementById("city");

    const minimumBox =
      document.getElementById("minimum-order-box");


    function getMinimumOrder() {

      const state =
        stateSelect?.value || "";

      if (state === "Tamil Nadu") {
        return 2500;
      }

      if (state === "Kerala") {
        return 3000;
      }

      if (state) {
        return 4000;
      }

      return 0;
    }


    function updateMinimumOrder() {

      const minimum =
        getMinimumOrder();

      const subtotal =
        getCartTotal();

      if (!minimumBox) return;

      if (!minimum) {

        minimumBox.textContent =
          "Select your state to see the minimum order amount.";

        minimumBox.style.color = "";

        return;
      }

      const remaining =
        Math.max(0, minimum - subtotal);

      if (remaining > 0) {

        minimumBox.innerHTML =
          `⚠️ Minimum order: ₹${minimum.toLocaleString("en-IN")}<br>
           Add ₹${remaining.toLocaleString("en-IN")} more to continue.`;

        minimumBox.style.color = "#b45309";

      } else {

        minimumBox.innerHTML =
          `✅ Minimum order ₹${minimum.toLocaleString("en-IN")} reached. You can confirm your booking.`;

        minimumBox.style.color = "#15803d";

      }

    }


    function populateDistricts() {

      if (!districtSelect || !citySelect) return;

      const state =
        stateSelect.value;

      districtSelect.innerHTML =
        '<option value="">Select District</option>';

      citySelect.innerHTML =
        '<option value="">Select City</option>';

      districtSelect.disabled = true;
      citySelect.disabled = true;

      if (!state) {
        updateMinimumOrder();
        return;
      }

      const stateData =
        locationData[state];

      if (!stateData) {
        districtSelect.innerHTML =
          '<option value="Other">Other District</option>';

        districtSelect.disabled = false;

        citySelect.innerHTML =
          '<option value="Other">Other City</option>';

        citySelect.disabled = false;

        updateMinimumOrder();
        return;
      }

      Object.keys(stateData.districts)
        .forEach(district => {

          const option =
            document.createElement("option");

          option.value = district;
          option.textContent = district;

          districtSelect.appendChild(option);

        });

      districtSelect.disabled = false;

      updateMinimumOrder();

    }


    function populateCities() {

      const state =
        stateSelect.value;

      const district =
        districtSelect.value;

      citySelect.innerHTML =
        '<option value="">Select City</option>';

      citySelect.disabled = true;

      const stateData =
        locationData[state];

      if (!stateData || !district) return;

      const cities =
        stateData.districts[district] || ["Other"];

      cities.forEach(city => {

        const option =
          document.createElement("option");

        option.value = city;
        option.textContent = city;

        citySelect.appendChild(option);

      });

      citySelect.disabled = false;

    }


    if (stateSelect) {

      stateSelect.addEventListener(
        "change",
        populateDistricts
      );

    }

    if (districtSelect) {

      districtSelect.addEventListener(
        "change",
        populateCities
      );

    }


    function checkMinimumOrder() {

      const minimum =
        getMinimumOrder();

      const subtotal =
        getCartTotal();

      if (!minimum) return false;

      return subtotal >= minimum;

    }


    console.log("✅ checkout.js loaded");


    // Initial summary
    renderSummary();


    const form =
      document.getElementById("checkout-form");

    const button =
      document.getElementById("confirm-booking");


    // ========================================
    // CHECK FORM
    // ========================================

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
        // MINIMUM ORDER VALIDATION
        // ====================================

        const minimumOrder =
          getMinimumOrder();

        const currentSubtotal =
          getCartTotal();

        if (!minimumOrder) {

          alert(
            "Please select your state."
          );

          return;
        }


        if (currentSubtotal < minimumOrder) {

          const remaining =
            minimumOrder - currentSubtotal;

          alert(
            `Minimum order for ${customer.state} is ₹${minimumOrder.toLocaleString("en-IN")}.\n\nPlease add ₹${remaining.toLocaleString("en-IN")} more to continue.`
          );

          return;
        }



        // ====================================
        // BUTTON LOADING
        // ====================================

        button.disabled = true;

        button.textContent =
          "Placing Order...";


        // ====================================
        // PLACE ORDER
        // ====================================

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