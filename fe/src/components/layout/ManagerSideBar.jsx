import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo1_noText.png";

export default function ManagerSideBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="bg-green-600 text-white w-64 p-4 fixed inset-y-0 left-0 md:relative z-50 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <img src={logo} alt="Logo" className="h-8 w-[70px]" />
        <span className="font-bold text-xl text-[#FDEE2A]">
          Lodging Chain Management
        </span>
      </div>
      <nav>
        <ul>
          <li
            className="mb-2 cursor-pointer text-[#FDEE2A]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Menu
          </li>
          {menuOpen && (
            <ul className="ml-4">
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager">Dashboard Thống Kê</Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager/lodger-list">Quản Lý Người Thuê</Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager/room/rooms-list">Quản Lý Phòng Trọ</Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager/invoice-list">Quản Lý Hóa Đơn</Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager/invoice/transaction-list">
                  Quản lý Giao Dịch
                </Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/manager/contract">Quản Lý Hợp Đồng</Link>
              </li>
            </ul>
          )}
        </ul>
      </nav>
    </aside>
  );
}
