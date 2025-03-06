import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, DatePicker, message, Card } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD") }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        alert('Thành công!')
        navigate("/login");
      } else {
        message.error(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
      <Card title="Đăng Ký Tài Khoản" style={{ width: 400, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: 10 }}>
        <Form name="register" layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Họ và Tên" />
          </Form.Item>

          <Form.Item name="dateOfBirth" rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}>
            <DatePicker style={{ width: "100%" }} placeholder="Ngày sinh" />
          </Form.Item>

          <Form.Item name="phoneNumber" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
