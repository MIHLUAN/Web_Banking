import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
    console.log(userRole,token)
  if (!token) return <Navigate to="/login" />;

  return userRole === role ? children : <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
