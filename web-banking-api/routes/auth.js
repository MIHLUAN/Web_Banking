const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");
const { authMiddleware, adminMiddleware }  = require("../middlewares/authMiddleware");
require("dotenv").config();

const router = express.Router();

// ✅ API lấy thông tin cá nhân (User hoặc Admin đều dùng được)
router.get("/me", authMiddleware, async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("userId", sql.Int, req.user.userId)
        .query("SELECT UserID, UserName, Email, FullName, Role, CreatedAt FROM Users WHERE UserID = @userId");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      console.error("❌ Error fetching user info:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//   // ✅ API chỉ dành cho Admin để lấy danh sách người dùng
//   router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
//     try {
//       const pool = await poolPromise;
//       const result = await pool.request().query("SELECT UserID, UserName, Email, FullName, Role FROM Users");
  
//       res.json(result.recordset);
//     } catch (error) {
//       console.error("❌ Error fetching users:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });
// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, fullName, role,dateOfBirth,phoneNumber,address } = req.body;
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Dữ liệu nhận được:", req.body); // Debug dữ liệu từ frontend

   await pool
  .request()
  .input("username", sql.NVarChar, username)
  .input("password", sql.NVarChar, hashedPassword)
  .input("email", sql.NVarChar, email)
  .input("fullName", sql.NVarChar, fullName)
  .input("role", sql.NVarChar, role || "user")
  .input("dateOfBirth", sql.Date, dateOfBirth) // 🟢 Thêm ngày sinh
  .input("phoneNumber", sql.NVarChar, phoneNumber) // 🟢 Thêm số điện thoại
  .input("address", sql.NVarChar, address) // 🟢 Thêm địa chỉ
  .query(
    `INSERT INTO Users (UserName, PasswordHash, Email, FullName, Role, DateOfBirth, PhoneNumber, Address, CreatedAt) 
     VALUES (@username, @password, @email, @fullName, @role, @dateOfBirth, @phoneNumber, @address, GETDATE())`
  );


    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE UserName = @username");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.UserID, username: user.UserName, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔐 API lấy thông tin người dùng (yêu cầu JWT)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT UserID, UserName, Email, FullName, Role FROM Users WHERE UserID = @userId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.recordset[0]); // Trả về thông tin người dùng
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
