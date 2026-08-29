const jwt = require("jsonwebtoken");


function requireAdmin(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;


    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }


    const token =
      authHeader.split(" ")[1];


    if (!token) {
      return res.status(401).json({
        message:
          "Authentication token missing",
      });
    }


    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    if (
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Admin access required",
      });
    }


    req.admin = decoded;


    next();

  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
}


module.exports =
  requireAdmin;