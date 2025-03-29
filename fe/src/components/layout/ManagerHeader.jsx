import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ManagerHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [accountId, setAccountId] = useState("");
  const [accountType, setAccountType] = useState("");
  const token = localStorage.getItem("token");
  const [house, setHouse] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserName(`${parsedUser.lastName} ${parsedUser.firstName}` || "Manager");
      setAccountId(parsedUser._id);
      setAccountType(parsedUser.accountType);
    }
  }, []);

  useEffect(() => {
    const fecthHouseData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/house/houseByHost",
          {
            headers: { Authorization: `Bearer ${token}`, "host-Id": accountId },
          }
        );
        if (response.data.data && response.data.data.length > 0) {
          setHouse(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetchHouseData: ", error);
      }
    };
    fecthHouseData();
  }, [token, accountId]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accountType");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-green-800 text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl text-[#FDEE2A]">{house?.name}</span>
      </div>
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="text-[#FDEE2A]">{userName}</span>
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
            <ul>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">
                Thông Tin Cá Nhân
              </li>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">
                Đổi Mật Khẩu
              </li>
              <li
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={handleLogout}
              >
                Đăng Xuất
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
