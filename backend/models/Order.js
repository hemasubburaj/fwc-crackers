const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

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

    items: [
      {
        productId: {
          type: String,
          default: "",
        },

        name: {
          type: String,
          required: true,
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

    totalAmount: {
      type: Number,
      required: true,
    },

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
