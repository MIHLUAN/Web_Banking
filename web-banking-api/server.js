// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { sql,poolPromise } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin"); // ✅ Import admin routes
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// Middleware để phân tích dữ liệu JSON
// app.use(bodyParser.json());

// Kết nối cơ sở dữ liệu
// poolPromise();

// Sử dụng các tuyến API
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // ✅ Thêm route admin
// app.use('/api/users', userRoutes);

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
