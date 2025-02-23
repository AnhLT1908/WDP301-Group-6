import { useState } from 'react';
import logo from '../../src/assets/images/logo2_text.png';

export default function DashboardHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-green-800 text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="h-8" />
        <input type="text" placeholder="Search Or Type Command..." className="p-2 rounded w-80 text-black" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <span>Admin Name</span>
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
            <ul>
              <li className="p-2 hover:bg-gray-200">UserProfile</li>
              <li className="p-2 hover:bg-gray-200">ChangePassword</li>
              <li className="p-2 hover:bg-gray-200">Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}