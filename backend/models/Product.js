const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Sparklers", "Flower Pots", "Rockets"
    content: { type: String, default: "1 Box" }, // packaging info e.g. "1 Box (10 pcs)"
    mrp: { type: Number, required: true }, // original rate
    discountPercent: { type: Number, default: 50 },
    finalPrice: { type: Number, required: true }, // discounted selling price
    image: { type: String, default: "images/placeholder.jpg" },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
isCombo: { type: Boolean, default: false }, // shows in "Combo Gift Boxes" section on the homepage
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate finalPrice if not explicitly given
productSchema.pre("save", function (next) {
  if (!this.finalPrice && this.mrp && this.discountPercent) {
    this.finalPrice = Math.round(this.mrp - (this.mrp * this.discountPercent) / 100);
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
