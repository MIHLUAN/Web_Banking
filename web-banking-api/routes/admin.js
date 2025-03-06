const express = require("express");
const { sql, poolPromise } = require("../config/db");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Lấy danh sách tất cả người dùng
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        "SELECT UserID, UserName, Email, FullName, Role, DateOfBirth, PhoneNumber, Address FROM Users"
      );

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Admin lấy thông tin người dùng theo ID
router.get("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("UserID", sql.Int, id)
        .query("SELECT UserID, UserName, Email, FullName, Role, CreatedAt FROM Users WHERE UserID = @UserID");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
// 🔐 API lấy thông tin người dùng (yêu cầu JWT)
router.get("/me", authMiddleware,adminMiddleware, async (req, res) => {
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
// ✅ Thêm người dùng mới
const bcrypt = require("bcrypt");

router.post("/users", authMiddleware, adminMiddleware, async (req, res) => {
  console.log("✅ Dữ liệu nhận được:", req.body); // Debug dữ liệu từ frontend

  const { username, email, fullName, role, password, dateOfBirth, phoneNumber, address } = req.body;

  try {
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }
    console.log("✅ Dữ liệu nhận được:", req.body); // Debug dữ liệu từ frontend
    // Mã hóa mật khẩu trước khi lưu vào database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kết nối database
    const pool = await poolPromise;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("fullName", sql.NVarChar, fullName)
      .input("role", sql.NVarChar, role )
      .input("password", sql.NVarChar, hashedPassword) // Lưu mật khẩu đã mã hóa
      .input("dateOfBirth", sql.Date, dateOfBirth || null)
      .input("phoneNumber", sql.NVarChar, phoneNumber || null)
      .input("address", sql.NVarChar, address || null)
      .query(`
        INSERT INTO Users (UserName, Email, FullName, Role, PasswordHash, DateOfBirth, PhoneNumber, Address,CreatedAt) 
        VALUES (@username, @email, @fullName, @role, @password, @dateOfBirth, @phoneNumber, @address,GETDATE())
      `);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Cập nhật thông tin người dùng
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email, fullName, role ,dateOfBirth,phoneNumber,address,username} = req.body;
  console.log("🟢 Dữ liệu từ client:", req.body);
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, id)
      .input("UserName", sql.NVarChar, username) // Thêm UserName
      .input("Email", sql.NVarChar, email)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.NVarChar, dateOfBirth || null)
      .input("PhoneNumber", sql.NVarChar, phoneNumber|| null)
      .input("Address", sql.NVarChar, address)
      .input("Role", sql.NVarChar, role) // Thêm Role
      .query("UPDATE Users SET UserName = @UserName,Email = @Email, FullName = @FullName,DateOfBirth=@DateOfBirth, PhoneNumber=@PhoneNumber, Address=@Address,Role = @Role WHERE UserID = @UserID");

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Xóa người dùng
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("UserID", sql.Int, id).query("DELETE FROM Users WHERE UserID = @UserID");

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
