const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// POST /api/auth/login - admin login, returns a JWT if credentials match
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({ token });
});

// GET /api/auth/verify - lets the frontend check if a stored token is still valid
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ valid: false });

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(401).json({ valid: false });
    res.json({ valid: true });
  });
});

module.exports = router;
