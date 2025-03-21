import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo1_noText.png";
import { List, ListTree } from "lucide-react";

export default function DashboardSideBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState("100vh"); // Chiều cao mặc định

  const sidebarRef = useRef(null);

  useEffect(() => {
    const updateSidebarHeight = () => {
      const contentHeight = document.body.scrollHeight; // Lấy chiều cao toàn bộ nội dung trang
      setSidebarHeight(`${contentHeight}px`);
    };

    updateSidebarHeight(); // Cập nhật ngay khi render

    window.addEventListener("resize", updateSidebarHeight); // Cập nhật khi thay đổi kích thước cửa sổ
    window.addEventListener("scroll", updateSidebarHeight); // Cập nhật khi kéo trang

    return () => {
      window.removeEventListener("resize", updateSidebarHeight);
      window.removeEventListener("scroll", updateSidebarHeight);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="bg-green-600 text-white w-64 p-4 fixed inset-y-0 left-0 md:relative z-50 overflow-y-auto"
      style={{ height: sidebarHeight }} // Cập nhật chiều cao động
    >
      <div className="flex items-center gap-2 mb-4">
        <img src={logo} alt="Logo" className="h-12 w-[100px]" />
        <span className="font-extrabold text-xl text-[#FDEE2A]">
          Lodging Chain Management
        </span>
      </div>
      <div className="border-b-2 border-yellow-200 mb-4"></div>
      <nav>
        <ul>
          <li
            className="flex items-center mb-2 text-xl font-semibold cursor-pointer text-[#FDEE2A]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <ListTree className="mt-[3px]" />
            ) : (
              <List className="mt-[3px]" />
            )}
            <span className="ml-2">Menu</span>
          </li>
          {menuOpen && (
            <ul className="ml-4">
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/admin">Home</Link>
              </li>
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/admin/dashboard">Dashboard</Link>
              </li>
              {/* <li className="mb-2 text-[#FDEE2A]">
                <Link to="/admin/account-list">Account List</Link>
              </li> */}
              <li className="mb-2 text-[#FDEE2A]">
                <Link to="/admin/house-list">House List</Link>
              </li>
            </ul>
          )}
        </ul>
      </nav>
    </aside>
  );
}
