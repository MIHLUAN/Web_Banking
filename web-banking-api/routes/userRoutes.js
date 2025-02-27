// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Lấy tất cả người dùng
router.get('/', userController.getAllUsers);

// Lấy thông tin người dùng theo ID
router.get('/:id', userController.getUserById);

// Thêm người dùng mới
router.post('/', userController.createUser);

// Cập nhật thông tin người dùng
router.put('/:id', userController.updateUser);

// Xóa người dùng
router.delete('/:id', userController.deleteUser);

module.exports = router;
