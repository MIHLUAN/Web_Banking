const sql = require("mssql");

const config = {
  user: "sa",
  password: "123",
  server: "localhost", // Ví dụ: "localhost" hoặc "192.168.1.100"
  database: "web_banking",
  options: {
    encrypt: false, // Đặt true nếu dùng Azure
    enableArithAbort: true,
  },
};

async function testConnection() {
  try {
    await sql.connect(config);
    console.log("✅ Kết nối SQL Server thành công!");
    sql.close();
  } catch (err) {
    console.error("❌ Kết nối thất bại:", err.message);
  }
}

testConnection();
