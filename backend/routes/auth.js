const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ===============================
// ADMIN LOGIN
// POST /api/auth/login
// ===============================

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        message: "JWT_SECRET is not configured"
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        role: "admin",
        email: email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h"
      }
    );

    return res.json({
      token
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// ===============================
// VERIFY TOKEN
// GET /api/auth/verify
// ===============================

router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        valid: false
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        valid: false
      });
    }

    const token = parts[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        valid: false,
        message: "JWT_SECRET is not configured"
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            valid: false
          });
        }

        if (decoded.role !== "admin") {
          return res.status(403).json({
            valid: false
          });
        }

        return res.json({
          valid: true
        });
      }
    );

  } catch (error) {
    console.error("Token verification error:", error);

    return res.status(401).json({
      valid: false
    });
  }
});

module.exports = router;