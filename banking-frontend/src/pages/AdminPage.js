// import { useEffect, useState } from "react";
// import { Table } from "antd";

// const AdminPage = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async (page = 1) => {
//     const token = localStorage.getItem("token");

//     const response = await fetch(`https://your-api.com/api/users?page=${page}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const data = await response.json();
//     setUsers(data.users);
//     setLoading(false);
//   };

//   const columns = [
//     { title: "ID", dataIndex: "id" },
//     { title: "Tên", dataIndex: "name" },
//     { title: "Email", dataIndex: "email" },
//   ];

//   return (
//     <Table 
//       columns={columns} 
//       dataSource={users} 
//       rowKey="id" 
//       loading={loading} 
//       pagination={{ onChange: fetchUsers }}
//     />
//   );
// };

// export default AdminPage;
// import LogoutButton from "../components/LogoutButton";

// const AdminPage = () => {
//   return (
//     <div>
//       <h1>Trang Admin</h1>
//       <LogoutButton />
//     </div>
//   );
// };

// export default AdminPage;

import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, message ,Select} from "antd";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";

const { Option } = Select;
const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const { token, logout } = useAuth();

  // Chạy 1 lần khi component mount
  useEffect(() => {
    
    fetchUsers();

  }, []);     
  
const fetchUsers = async () => {
  try {
     const token = localStorage.getItem("token"); // Lấy token từ localStorage

    const res = await fetch("http://localhost:4000/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Gửi token trong request
      },
    });
    
    if (res.status === 401) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      logout(); // 🔥 Gọi logout nếu token không hợp lệ
      return;
    }
    if (res.status === 401) {
      throw new Error("Unauthorized: Bạn không có quyền truy cập.");
      
    }

    const data = await res.json();
    console.log("Users:", data);

    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setUsers([]);
    }
  } catch (error) {
    console.error("Lỗi tải danh sách:", error);
  }
};


  const handleDelete = async (id) => {
    await fetch(`http://localhost:4000/api/admin/users/${id}`, { method: "DELETE",headers: { "Content-Type": "application/json" ,Authorization: `Bearer ${token}`} });
    message.success("Xóa người dùng thành công");
    fetchUsers();
  };

  const handleEdit = (user) => {
    console.log("🟢 Dữ liệu user:", user);
    setEditingUser(user);
    setIsModalVisible(true); // Mở modal trước
    setTimeout(() => {
      form.setFieldsValue({
        username: user.UserName || "",
        email: user.Email || "",
        fullName: user.FullName || "",
        dateOfBirth: user.DateOfBirth ? user.DateOfBirth.split("T")[0] : "",
        phoneNumber: user.PhoneNumber || "",
        address: user.Address || "",
        role: user.Role || "",
        password: "", // Không hiển thị mật khẩu cũ
      }); // Set dữ liệu sau
    }, 0);
  };
  const handleSave = async (values) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (!token) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      logout(); // Gọi hàm logout nếu token không hợp lệ
      return;
    }
    if (editingUser) {
     console.log("🟢 Dữ liệu gửi lên:", editingUser); // Debug dữ liệu
     if (values.dateOfBirth && values.dateOfBirth.format) {
      values.dateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
    }
      await fetch(`http://localhost:4000/api/admin/users/${editingUser.UserID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(values),
      });
      message.success("Cập nhật thành công");
    } else {
    //  const token = localStorage.getItem("token"); // Lấy token từ localStorage
    console.log("🟢 Dữ liệu gửi lên:", values); // Debug dữ liệu
    if (values.dateOfBirth && values.dateOfBirth.format) {
      values.dateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
    }
      await fetch("http://localhost:4000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token trong request
        },
        body: JSON.stringify(values),
      });
      alert('Thành công!')
      message.success("Thêm người dùng thành công");
    }
    setIsModalVisible(false);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) =>
    user?.PhoneNumber?.includes(search) || user?.FullName?.includes(search)
  );
  const handleTransfer = async (values) => {
    try {
      const formattedValues = {
        ...values,
        amount: Number(values.amount), // Chuyển amount về số
      };
      console.log("🟢 Data gửi đi:", formattedValues);
      await fetch("http://localhost:4000/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token trong request
         },
        body: JSON.stringify(formattedValues),
      });
      message.success("Giao dịch thành công");
      alert("thanh cong")
      transactionForm.resetFields();
    } catch (error) {
      message.error("Lỗi khi thực hiện giao dịch");
    }
  };
  return (
    <div>
      <h2>Quản lý Người Dùng</h2>
      <Input
        placeholder="Tìm kiếm theo SDT, tên"
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10, width: 300 }}
      />
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Thêm Người Dùng
      </Button>
      <LogoutButton />
      <Table dataSource={filteredUsers} rowKey="id" columns={[
        { title: "Username", dataIndex: "UserName" },
        { title: "Email", dataIndex: "Email" },
        { title: "Full Name", dataIndex: "FullName" },
        { title: "Date of Birth", dataIndex: "DateOfBirth" },
        { title: "Phone Number", dataIndex: "PhoneNumber" },
        { title: "Address", dataIndex: "Address" },
        { title: "Role", dataIndex: "Role" }, // Thêm cột Role
        {
          title: "Actions",
          render: (user) => (
            <>
              <Button onClick={() => handleEdit(user)}>Sửa</Button>
              <Button onClick={() => handleDelete(user.UserID)} danger>Xóa</Button>
            </>
          ),
        },
      ]} />
      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên">
            <Input />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <h2>Chuyển tiền</h2>
      <Form form={transactionForm} onFinish={handleTransfer} layout="vertical">
        <Form.Item name="senderAccountId" label="ID Người gửi" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="receiverAccountId" label="ID Người nhận" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="amount" label="Số tiền" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Thực hiện giao dịch
        </Button>
      </Form>
    </div>
  );
};

export default AdminPage;
