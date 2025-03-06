const express = require("express");
const { sql, poolPromise } = require("../config/db");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🏦 API Chuyển tiền (Yêu cầu đăng nhập)
router.post("/transfer", authMiddleware, async (req, res) => {
  const { senderAccountId, receiverAccountId, amount } = req.body;

  if (!senderAccountId || !receiverAccountId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    const sender = await transaction
      .request()
      .input("senderAccountId", sql.Int, senderAccountId)
      .query("SELECT Balance FROM BankAccounts WHERE AccountID = @senderAccountId");

    if (sender.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Tài khoản gửi không tồn tại" });
    }

    if (sender.recordset[0].Balance < amount) {
      await transaction.rollback();
      return res.status(400).json({ message: "Số dư không đủ để giao dịch" });
    }

    await transaction
      .request()
      .input("amount", sql.Decimal(18, 2), amount)
      .input("senderAccountId", sql.Int, senderAccountId)
      .query("UPDATE BankAccounts SET Balance = Balance - @amount WHERE AccountID = @senderAccountId");

    await transaction
      .request()
      .input("amount", sql.Decimal(18, 2), amount)
      .input("receiverAccountId", sql.Int, receiverAccountId)
      .query("UPDATE BankAccounts SET Balance = Balance + @amount WHERE AccountID = @receiverAccountId");

    await transaction
      .request()
      .input("senderAccountId", sql.Int, senderAccountId)
      .input("receiverAccountId", sql.Int, receiverAccountId)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("transactionType", sql.NVarChar(10), "transfer")
      .input("status", sql.NVarChar(10), "completed")
      .query(
        "INSERT INTO Transactions (sender_account_id, receiver_account_id, amount, transaction_type, status) VALUES (@senderAccountId, @receiverAccountId, @amount, @transactionType, @status)"
      );

    await transaction.commit();
    res.json({ message: "Chuyển tiền thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi chuyển tiền" });
  }
});

// 🏦 API Nạp tiền (Chỉ admin được phép)
router.post("/deposit", authMiddleware, adminMiddleware, async (req, res) => {
  const { accountId, amount } = req.body;

  if (!accountId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("accountId", sql.Int, accountId)
      .input("amount", sql.Decimal(18, 2), amount)
      .query("UPDATE BankAccounts SET Balance = Balance + @amount WHERE AccountID = @accountId");

    await pool
      .request()
      .input("senderAccountId", sql.Int, accountId)
      .input("receiverAccountId", sql.Int, null)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("transactionType", sql.NVarChar(10), "deposit")
      .input("status", sql.NVarChar(10), "completed")
      .query(
        "INSERT INTO Transactions (sender_account_id, receiver_account_id, amount, transaction_type, status) VALUES (@senderAccountId, @receiverAccountId, @amount, @transactionType, @status)"
      );

    res.json({ message: "Nạp tiền thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi nạp tiền" });
  }
});

// 🏦 API Rút tiền (Yêu cầu đăng nhập)
router.post("/withdraw", authMiddleware, async (req, res) => {
  const { accountId, amount } = req.body;

  if (!accountId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    const account = await transaction
      .request()
      .input("accountId", sql.Int, accountId)
      .query("SELECT Balance FROM BankAccounts WHERE AccountID = @accountId");

    if (account.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    if (account.recordset[0].Balance < amount) {
      await transaction.rollback();
      return res.status(400).json({ message: "Số dư không đủ" });
    }

    await transaction
      .request()
      .input("amount", sql.Decimal(18, 2), amount)
      .input("accountId", sql.Int, accountId)
      .query("UPDATE BankAccounts SET Balance = Balance - @amount WHERE AccountID = @accountId");

    await transaction
      .request()
      .input("senderAccountId", sql.Int, accountId)
      .input("receiverAccountId", sql.Int, null)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("transactionType", sql.NVarChar(10), "withdrawal")
      .input("status", sql.NVarChar(10), "completed")
      .query(
        "INSERT INTO Transactions (sender_account_id, receiver_account_id, amount, transaction_type, status) VALUES (@senderAccountId, @receiverAccountId, @amount, @transactionType, @status)"
      );

    await transaction.commit();
    res.json({ message: "Rút tiền thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi rút tiền" });
  }
});

module.exports = router;
