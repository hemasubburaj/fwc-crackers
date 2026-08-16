require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const products = require("./products.json");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Remove any leftover index from a previous/different schema on this
    // database (e.g. an old unique "slug" index) that would otherwise
    // block inserts with duplicate-key errors.
    try {
      const indexes = await mongoose.connection.db.collection("products").indexes();
      for (const idx of indexes) {
        if (idx.name !== "_id_" && !("productCode" in idx.key)) {
          await mongoose.connection.db.collection("products").dropIndex(idx.name);
          console.log(`Dropped stale index: ${idx.name}`);
        }
      }
    } catch (idxErr) {
      // Collection may not exist yet on first run - safe to ignore
    }

    await Product.deleteMany({});
    console.log("Existing products cleared.");

    await Product.insertMany(products);
    console.log(`${products.length} products inserted successfully!`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
