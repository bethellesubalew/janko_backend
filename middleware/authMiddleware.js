 const jwt = require("jsonwebtoken");
 const authMiddleware = require('../middleware/authMiddleware');

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 🔒 No token
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 🔥 Extract token (Bearer xxx)
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 🔐 Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret123"
    );

    // attach user info
    req.user = {
  id: decoded.id || decoded.userId || decoded._id,
  role: decoded.role
};
    next();

  } catch (err) {
    console.log("TOKEN ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};