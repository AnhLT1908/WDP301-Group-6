import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    accountType: "",
    objectId: "",
    houseId: null,
  });

  useEffect(() => {
    const username = localStorage.getItem("name") || "Admin";
    const accountType = localStorage.getItem("accountType") || "";
    const objectId = localStorage.getItem("objectId") || "";
    const houseId = accountType === "manager" ? localStorage.getItem("houseId") : null;

    setUser({ username, accountType, objectId, houseId });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accountType");
    localStorage.removeItem("username");
    localStorage.removeItem("objectId");
    localStorage.removeItem("houseId");
    navigate("/login");
  };

  return (
    <header className="bg-green-800 text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search Or Type Command..."
          className="p-2 rounded w-80 text-black"
        />
      </div>
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <span className="text-[#FDEE2A]">{user.name}</span>
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
            <ul>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">
                User Profile
              </li>
              <li className="p-2 hover:bg-gray-200 cursor-pointer">
                Change Password
              </li>
              {user.accountType === "manager" && (
                <li className="p-2 text-gray-600">
                  House ID: {user.houseId || "N/A"}
                </li>
              )}
              <li
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
