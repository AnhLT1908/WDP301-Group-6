import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo1_noText.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("User", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActiveLink = (path) =>
    location.pathname === path ? "text-yellow-400" : "text-white";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header>
      <div className="bg-[#0D9F4C] py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center text-white">
            <img src={logo} className="w-[90px] h-[70px]" alt="Logo" />
            <span className="font-bold text-xl text-[#FDEE2A]">
              Lodging Chain Management
            </span>
          </div>

          <div className="flex items-center space-x-2 relative">
            <span className="font-bold text-xl text-[#FDEE2A]">
              Nhà Trọ Tuấn Cường 1
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#06752A] py-4 mx-auto flex justify-end">
        <div className="mx-6 relative">
          <div
            className="flex items-center gap-2 cursor-pointer mr-80"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-[#FDEE2A] text-lg font-semibold">
              {user?.lastName + " " + user?.firstName}
            </span>
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50 mr-80">
              <ul>
                <li className="p-2 hover:bg-gray-200">
                  <Link to="/user-profile">Thông Tin Cá Nhân</Link>
                </li>
                <li className="p-2 hover:bg-gray-200">
                  <Link to="/change-password">Đổi Mật Khẩu</Link>
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
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-green-600 text-white p-4 space-y-4">
          <Link to="/" className={`${isActiveLink("/")}`}>
            Home
          </Link>
          <Link to="/about" className={`${isActiveLink("/about")}`}>
            About Us
          </Link>
          <Link to="/features" className={`${isActiveLink("/features")}`}>
            Features
          </Link>
          <Link to="/categories" className={`${isActiveLink("/categories")}`}>
            Categories
          </Link>
          <Link to="/contact" className={`${isActiveLink("/contact")}`}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
