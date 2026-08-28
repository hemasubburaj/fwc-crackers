const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ===============================
// CREATE ORDER / CONFIRM BOOKING
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      totalAmount,
      paymentMethod = "COD",
    } = req.body;

    // Basic validation
    if (!customer) {
      return res.status(400).json({
        message: "Customer details are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount",
      });
    }

    // Generate order ID
    const orderId =
      "FWC" +
      Date.now().toString().slice(-8) +
      Math.floor(100 + Math.random() * 900);

    // Create order
    const order = new Order({
      orderId,

      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address,
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
      },

      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        productCode: item.productCode || "",
        price: Number(item.price),
        qty: Number(item.qty),
        image: item.image || "",
      })),

      totalAmount: Number(totalAmount),

      paymentMethod,

      status: "Pending",

      createdAt: new Date(),
    });

    await order.save();

    console.log("✅ Order placed:", orderId);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order: order,
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);

    res.status(500).json({
      success: false,
      message: "Could not place order",
      error: error.message,
    });
  }
});


// ===============================
// GET ORDER BY ORDER ID
// ===============================
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not fetch order",
    });
  }
});

module.exports = router;