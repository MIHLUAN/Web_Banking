// config/db.js
const sql = require('mssql');
require("dotenv").config();

// Cấu hình kết nối SQL Server
const dbConfig = {
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // ví dụ: localhost hoặc IP
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Đặt `true` nếu sử dụng Azure SQL
        enableArithAbort: true,
    }
};

// Kết nối đến SQL Server
// const connectDB = async () => {
//     try {
//         await sql.connect(dbConfig);
//         console.log('Connected to SQL Server');
//     } catch (err) {
//         console.error('Error connecting to database:', err);
//     }
// };

// module.exports = {
//     sql,
//     connectDB,
// };
// const poolPromise = new sql.ConnectionPool(dbConfig)
//   .connect()
//   .then(pool => {
//     console.log("✅ Connected to SQL Server");
//     return pool;
//   })
//   .catch(err => {
//     console.error("❌ Database Connection Failed! Error:", err);
//     process.exit(1);
//   });

// module.exports = { sql, poolPromise, };

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
  });

// Xuất module
module.exports = { sql, poolPromise };