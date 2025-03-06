// import { useEffect, useState } from "react";
// import { Card } from "antd";

// const UserPage = () => {
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     const token = localStorage.getItem("token");

//     const response = await fetch("https://your-api.com/api/user/profile", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const data = await response.json();
//     setProfile(data);
//   };

//   return (
//     <Card title="Thông tin cá nhân">
//       <p><b>Tên:</b> {profile?.name}</p>
//       <p><b>Email:</b> {profile?.email}</p>
//     </Card>
//   );
// };

// export default UserPage;
import LogoutButton from "../components/LogoutButton";

const UserPage = () => {
  return (
    <div>
      <h1>Trang Người Dùng</h1>
      <LogoutButton />
    </div>
  );
};

export default UserPage;
