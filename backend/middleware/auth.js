const jwt = require("jsonwebtoken");

// Protects admin-only routes. Expects header: Authorization: Bearer <token>
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Admin login required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }
    req.admin = decoded;
    next();
  });
}

module.exports = requireAdmin;
