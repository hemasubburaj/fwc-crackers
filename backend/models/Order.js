```js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ========================================
    // ORDER ID
    // ========================================
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // ========================================
    // ORDER STATUS
    // ========================================
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    // ========================================
    // CUSTOMER
    // ========================================
    customer: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    // ========================================
    // ORDER ITEMS
    // ========================================
    items: [
      {
        productId: {
          type: String,
        },

        name: {
          type: String,
        },

        productCode: {
          type: String,
          default: "",
        },

        price: {
          type: Number,
          required: true,
        },

        qty: {
          type: Number,
          required: true,
        },

        image: {
          type: String,
          default: "",
        },
      },
    ],

    // ========================================
    // TOTAL
    // ========================================
    totalAmount: {
      type: Number,
      required: true,
    },

    // ========================================
    // PAYMENT
    // ========================================
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // ========================================
    // CREATED / UPDATED
    // ========================================
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
```
