// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [role, setRole] = useState(localStorage.getItem("role"));

//   // Khi tải trang, kiểm tra nếu đã đăng nhập thì cập nhật state
//   useEffect(() => {
//     setToken(localStorage.getItem("token"));
//     setRole(localStorage.getItem("role"));
//   }, []);

//   // Hàm đăng nhập (Lưu token & role vào localStorage)
//   const login = (newToken, newRole) => {
//     localStorage.setItem("token", newToken);
//     localStorage.setItem("role", newRole);
//     setToken(newToken);
//     setRole(newRole);
//   };

//   // Hàm đăng xuất (Xóa token & role khỏi localStorage)
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     setToken(null);
//     setRole(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook để sử dụng AuthContext dễ dàng hơn
// export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // 🔥 Kiểm tra token khi tải trang
  useEffect(() => {
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1])); // Giải mã JWT
        const expTime = tokenData.exp * 1000; // Chuyển giây sang mili giây

        if (Date.now() >= expTime) {
          logout(); // 🔴 Token hết hạn → Logout
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        logout(); // 🔴 Token lỗi → Logout
      }
    }
  }, [token]);

  // ✅ Hàm đăng nhập
  const login = (newToken, newRole) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  // 🔴 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    window.location.href = "/login"; // Chuyển về trang đăng nhập
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);
