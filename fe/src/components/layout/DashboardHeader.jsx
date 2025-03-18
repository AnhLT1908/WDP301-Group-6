import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [accountId, setAccountId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserName(parsedUser.name || "Admin");
      setAccountId(parsedUser._id);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accountType");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-green-800 text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl text-[#FDEE2A]">
          Trang chủ quản trị viên
        </span>
      </div>
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <span className="text-[#FDEE2A]">{userName}</span>
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
            <ul>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">User Profile</li>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">Change Password</li>
              <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
