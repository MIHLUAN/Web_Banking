import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import RegisterPage from "./pages/RegisterPage"
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<h1>403 - Không có quyền truy cập</h1>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminPage /></PrivateRoute>} />
        <Route path="/user" element={<PrivateRoute role="user"><UserPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
