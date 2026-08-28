require("dotenv").config();
app.use(express.json());

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/products");

const paymentRoutes = require("./routes/payment");
const authRoutes = require("./routes/auth");

const orderRoutes = require("./routes/orders");

app.use("/api/orders", orderRoutes);

const app = express();

// ===============================
// CORS
// ===============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://familycrackersworld.com",
  "https://www.familycrackersworld.com",
  "https://familycrackersworld-fwc.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin
      // (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ===============================
// Database
// ===============================
connectDB();

// ===============================
// API Routes
// ===============================
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);

// ===============================
// Health / Test Routes
// ===============================
app.get("/", (req, res) => {
  res.send("Crackers E-commerce API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});