const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");

router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      totalAmount,
      paymentMethod = "COD",
    } = req.body;

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

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

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

    const subtotal = finalItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const shipping = subtotal > 0 && subtotal < 2000 ? 150 : 0;

    const total =
      totalAmount && Number(totalAmount) > 0
        ? Number(totalAmount)
        : subtotal + shipping;

    const orderId =
      "FWC" +
      Date.now().toString().slice(-8) +
      Math.floor(100 + Math.random() * 900);

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
      totalAmount: total,
      paymentMethod,
      orderStatus: "PLACED",
      paymentStatus:
        paymentMethod === "ONLINE" ? "PAID" : "PENDING",
      createdAt: new Date(),
    });

    await order.save();

    console.log("Order placed:", orderId);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    res.status(500).json({
      success: false,
      message: "Could not place order",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      orders.map((order) => ({
        ...order,
        orderStatus:
          order.orderStatus || order.status || "PLACED",
        paymentStatus:
          order.paymentStatus || "PENDING",
      }))
    );
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch orders",
    });
  }
});

router.get("/track-phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone.trim();

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    const orders = await Order.find({
      "customer.phone": phone,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this phone number",
      });
    }

    res.json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        orderStatus:
          order.orderStatus || order.status || "PLACED",
        paymentStatus:
          order.paymentStatus || "PENDING",
      })),
    });
  } catch (error) {
    console.error("Track phone error:", error);

    res.status(500).json({
      success: false,
      message: "Could not track order",
    });
  }
});

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

    res.json({
      ...order,
      orderStatus:
        order.orderStatus || order.status || "PLACED",
      paymentStatus:
        order.paymentStatus || "PENDING",
    });
  } catch (error) {
    console.error("Track order error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
});

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
        order.orderStatus || order.status || "PLACED",
      paymentStatus:
        order.paymentStatus || "PENDING",
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
});

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

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update order status",
      error: error.message,
    });
  }
});
router.get("/track-phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone.trim();

    const orders = await Order.find({
      "customer.phone": phone
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this phone number"
      });
    }

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not track orders"
    });
  }
});

module.exports = router;
module.exports = router;
