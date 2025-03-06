import { useState } from "react";
// import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Form, Input, Button, message, Card } from "antd";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { login } = useAuth();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        localStorage.setItem("token", data.token);
        fetchUserRole(data.token);
      } else {
        message.error(data.message);
        setLoading(false);
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
      setLoading(false);
    }
  };

  const fetchUserRole = async (token) => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await response.json();
        console.log(userData)
      if (response.ok) {
        localStorage.setItem("role", userData.Role);
        message.success("Đăng nhập thành công!");
        // console.log(userData.Role); 
        navigate(userData.Role === "admin" ? "/admin" : "/user");
      } else {
        message.error("Không lấy được thông tin user!");
        setLoading(false);
      }
    } catch (error) {
      message.error("Lỗi khi lấy thông tin user!");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Login" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please input your username!" }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
    // <Form onFinish={onFinish} layout="vertical">
    //   <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
    //     <Input />
    //   </Form.Item>
    //   <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
    //     <Input.Password />
    //   </Form.Item>
    //   <Button type="primary" htmlType="submit" loading={loading}>
    //     Đăng nhập
    //   </Button>
    // </Form>
  );
};

export default LoginPage;
