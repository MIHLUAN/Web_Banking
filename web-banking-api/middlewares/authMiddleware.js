// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "Access Denied. No token provided." });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: "Invalid or expired token" });
//     }
//     req.user = user; // Gán thông tin user từ token vào request
//     next();
//   });
// };

// module.exports = authenticateToken;
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware kiểm tra JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware kiểm tra quyền Admin
const adminMiddleware = (req, res, next) => {
    console.log("kkk:"+req.user.role)
  if (!req.user || req.user.role !== "admin") {
    
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
