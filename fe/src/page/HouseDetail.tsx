import React, { useEffect, useState } from "react";

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/account/manager")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); // Debug API response
        if (Array.isArray(data.data)) {
          setManagers(data.data);
        } else {
          setManagers([]); // Đảm bảo luôn là mảng
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching managers:", error);
        setManagers([]); // Tránh lỗi khi API thất bại
        setLoading(false);
      });
  }, []);
  

  return (
    <div>
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
