import React from "react";
import logo from "../assets/images/logo1_noText.png";

export default function UserProfile() {
  return (
    <div>
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
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div> {/* Avatar */}
            <div className="ml-4">
              <p className="text-lg font-medium">User Name</p>
              <p className="text-gray-600">Role</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Information</h2>
          <p><strong>Name:</strong> User Name</p>
          <p><strong>Email:</strong> abc@gmail.com</p>
          <p><strong>Phone:</strong> 0123456789</p>
          <p><strong>Bio:</strong> Role</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Address</h2>
          <p><strong>Name:</strong> User Name</p>
          <p><strong>Email:</strong> abc@gmail.com</p>
          <p><strong>Phone:</strong> 0123456789</p>
          <p><strong>Bio:</strong> Role</p>
        </div>
      </div>
    </div>
  );
}
