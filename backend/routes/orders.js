
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");

// ========================================
// CREATE ORDER
// POST /api/orders
// ========================================
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      totalAmount,
      paymentMethod = "COD",
    } = req.body;

    // -----------------------------
    // Validate customer
    // -----------------------------
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    if (!customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and address are required",
      });
    }

    // -----------------------------
    // Validate items
    // -----------------------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // -----------------------------
    // Prepare products
    // Supports:
    // 1. Full item details from checkout
    // 2. productId + qty from admin billing
    // -----------------------------
    const finalItems = [];

    for (const item of items) {
      let product = null;

      if (item.productId) {
        product = await Product.findById(item.productId);
      }

      if (!product && item._id) {
        product = await Product.findById(item._id);
      }

      const qty = Number(item.qty) || 1;

      if (product) {
        finalItems.push({
          productId: product._id,
          name: product.name,
          productCode: product.productCode || "",
          price: Number(product.finalPrice || item.price || 0),
          qty,
          image: product.image || item.image || "",
        });
      } else {
        // Fallback for already-complete cart items
        finalItems.push({
          productId: item.productId || item._id,
          name: item.name || "Product",
          productCode: item.productCode || "",
          price: Number(item.price || item.finalPrice || 0),
          qty,
          image: item.image || "",
        });
      }
    }

    // -----------------------------
    // Calculate total
    // -----------------------------
    const calculatedSubtotal = finalItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const shipping =
      calculatedSubtotal > 0 && calculatedSubtotal < 2000 ? 150 : 0;

    const calculatedTotal = calculatedSubtotal + shipping;

    const finalTotal =
      totalAmount && Number(totalAmount) > 0
        ? Number(totalAmount)
        : calculatedTotal;

    // -----------------------------
    // Generate Order ID
    // -----------------------------
    const orderId =
      "FWC" +
      Date.now().toString().slice(-8) +
      Math.floor(100 + Math.random() * 900);

    // -----------------------------
    // Create order
    // -----------------------------
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

      items: finalItems,

      totalAmount: finalTotal,

      paymentMethod,

      // IMPORTANT:
      // Your frontend expects orderStatus
      orderStatus: "PLACED",

      // Keep payment status available
      paymentStatus:
        paymentMethod === "ONLINE" ? "PAID" : "PENDING",

      createdAt: new Date(),
    });

    await order.save();

    console.log("✅ Order placed:", orderId);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not place order",
      error: error.message,
    });
  }
});

// ========================================
// GET ALL ORDERS
// GET /api/orders
// ========================================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    // Make old orders compatible with frontend
    const formattedOrders = orders.map((order) => ({
      ...order,

      orderStatus:
        order.orderStatus ||
        order.status ||
        "PLACED",

      paymentStatus:
        order.paymentStatus ||
        "PENDING",
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("❌ Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch orders",
    });
  }
});

// ========================================
// TRACK ORDER
// GET /api/orders/track/:orderId
// ========================================
router.get("/track/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId.trim(),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const formattedOrder = {
      ...order,

      orderStatus:
        order.orderStatus ||
        order.status ||
        "PLACED",

      paymentStatus:
        order.paymentStatus ||
        "PENDING",
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("❌ Track order error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
});

// ========================================
// GET ORDER BY ID
// GET /api/orders/:orderId
// ========================================
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId.trim(),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      ...order,
      orderStatus:
        order.orderStatus ||
        order.status ||
        "PLACED",
      paymentStatus:
        order.paymentStatus ||
        "PENDING",
    });
  } catch (error) {
    console.error("❌ Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
});

// ========================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// ========================================
router.put("/:id/status", async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
        status: orderStatus,
      },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(
      `✅ Order ${order.orderId} status updated to ${orderStatus}`
    );

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("❌ Update status error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update order status",
      error: error.message,
    });
  }
});

module.exports = router;

