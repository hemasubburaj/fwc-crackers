const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "1 Box",
      trim: true,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "images/placeholder.jpg",
    },

    stock: {
      type: Number,
      default: 100,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isCombo: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


/*
=========================================================
AUTO CALCULATE FINAL PRICE
=========================================================
*/

function calculateFinalPrice(product) {
  const mrp = Number(product.mrp);
  const discount = Number(product.discountPercent || 0);

  if (!Number.isFinite(mrp) || mrp < 0) {
    return;
  }

  const safeDiscount = Math.min(
    100,
    Math.max(0, discount)
  );

  product.finalPrice = Math.round(
    mrp - (mrp * safeDiscount) / 100
  );
}


/*
=========================================================
BEFORE SAVE
=========================================================
*/

productSchema.pre("save", function (next) {
  if (
    this.isModified("mrp") ||
    this.isModified("discountPercent") ||
    !this.finalPrice
  ) {
    calculateFinalPrice(this);
  }

  next();
});


/*
=========================================================
BEFORE FIND ONE AND UPDATE
=========================================================
*/

productSchema.pre(
  "findOneAndUpdate",
  function (next) {
    const update = this.getUpdate();

    if (!update) {
      return next();
    }

    /*
      Support both:
      { mrp: 200 }
      and
      { $set: { mrp: 200 } }
    */

    const data = update.$set || update;

    const mrp = Number(data.mrp);
    const discount = Number(data.discountPercent);

    if (
      Number.isFinite(mrp) &&
      Number.isFinite(discount)
    ) {
      const safeDiscount = Math.min(
        100,
        Math.max(0, discount)
      );

      data.finalPrice = Math.round(
        mrp - (mrp * safeDiscount) / 100
      );
    }

    /*
      If only MRP or discount is being updated,
      get existing values from DB.
    */

    if (
      Number.isFinite(mrp) &&
      !Number.isFinite(discount)
    ) {
      this.model
        .findOne(this.getQuery())
        .then((existing) => {
          if (existing) {
            const safeDiscount = Math.min(
              100,
              Math.max(
                0,
                Number(existing.discountPercent || 0)
              )
            );

            data.finalPrice = Math.round(
              mrp - (mrp * safeDiscount) / 100
            );
          }

          next();
        })
        .catch(next);

      return;
    }


    if (
      !Number.isFinite(mrp) &&
      Number.isFinite(discount)
    ) {
      this.model
        .findOne(this.getQuery())
        .then((existing) => {
          if (existing) {
            const existingMrp =
              Number(existing.mrp || 0);

            const safeDiscount = Math.min(
              100,
              Math.max(0, discount)
            );

            data.finalPrice = Math.round(
              existingMrp -
              (existingMrp * safeDiscount) / 100
            );
          }

          next();
        })
        .catch(next);

      return;
    }

    next();
  }
);


module.exports = mongoose.model(
  "Product",
  productSchema
);