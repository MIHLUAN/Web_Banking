const express = require("express");
const { sql, poolPromise } = require("../config/db");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Lấy danh sách tất cả người dùng
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT UserID, UserName, Email, FullName, Role FROM Users");
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
router.post("/users", authMiddleware, adminMiddleware, async (req, res) => {
  const { username, email, fullName, role, passwordHash } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserName", sql.NVarChar, username)
      .input("Email", sql.NVarChar, email)
      .input("FullName", sql.NVarChar, fullName)
      .input("Role", sql.NVarChar, role)
      .input("PasswordHash", sql.NVarChar, passwordHash) // Cần hash trước khi lưu
      .query("INSERT INTO Users (UserName, Email, FullName, Role, PasswordHash) VALUES (@UserName, @Email, @FullName, @Role, @PasswordHash)");

    res.json({ message: "User created successfully" });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Cập nhật thông tin người dùng
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email, fullName, role } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, id)
      .input("Email", sql.NVarChar, email)
      .input("FullName", sql.NVarChar, fullName)
      .input("DateOfBirth", sql.NVarChar, dateOfBirth)
      .input("PhoneNumber", sql.NVarChar, PhoneNumber)
      .input("Address", sql.NVarChar, address)
      .query("UPDATE Users SET Email = @Email, FullName = @FullName,DateOfBirth=@DateOfBirth, PhoneNumber=@PhoneNumber, Address=@Address WHERE UserID = @UserID");

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
