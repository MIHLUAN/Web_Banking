// controllers/userController.js
const { sql } = require('../config/db');

// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Users');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM Users WHERE UserID = ${id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Thêm người dùng mới
const createUser = async (req, res) => {
    const { UserName, PasswordHash, Email, FullName, DateOfBirth, PhoneNumber, Address, Role } = req.body;
    try {
        const result = await sql.query`
            INSERT INTO Users (UserName, PasswordHash, Email, FullName, DateOfBirth, PhoneNumber, Address, Role)
            VALUES (${UserName}, ${PasswordHash}, ${Email}, ${FullName}, ${DateOfBirth}, ${PhoneNumber}, ${Address}, ${Role});
        `;
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { UserName, PasswordHash, Email, FullName, DateOfBirth, PhoneNumber, Address, Role } = req.body;
    try {
        const result = await sql.query`
            UPDATE Users 
            SET UserName = ${UserName}, PasswordHash = ${PasswordHash}, Email = ${Email}, FullName = ${FullName}, 
                DateOfBirth = ${DateOfBirth}, PhoneNumber = ${PhoneNumber}, Address = ${Address}, Role = ${Role}
            WHERE UserID = ${id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`DELETE FROM Users WHERE UserID = ${id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
