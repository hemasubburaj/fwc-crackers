const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const requireAdmin = require("../middleware/auth");

// Helper: generate human friendly order id
async function generateOrderId() {
  const count = await Order.countDocuments();
  return `FWC-${String(count + 1001)}`;
}

// CREATE order (COD or after online payment verification)
router.post("/", async (req, res) => {
  try {
    const { customer, items, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Recalculate prices server-side for safety
    let subtotal = 0;
    const verifiedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const lineTotal = product.finalPrice * item.qty;
      subtotal += lineTotal;
      verifiedItems.push({
        productId: product._id,
        name: product.name,
        productCode: product.productCode,
        price: product.finalPrice,
        mrp: product.mrp,
        unit: (product.content || "").split(" ").pop() || "pcs",
        qty: item.qty,
      });
    }

    const shippingFee = subtotal >= 2000 ? 0 : 150; // free shipping above ₹2000
    const totalAmount = subtotal + shippingFee;

    const orderId = await generateOrderId();

    const order = new Order({
      orderId,
      customer,
      items: verifiedItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET order by orderId (for order tracking / success page)
router.get("/track/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all orders (admin)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE order status (admin)
router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
