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
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Manager List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Name</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager, index) => (
                <tr key={index} className="border-t">
                  <td>{manager.name}</td>
                  <td>{manager.username}</td>
                  <td>{manager.email}</td>
                  <td>{manager.phone}</td>
                  <td>{manager.roomID}</td>
                  <td className={manager.status ? "text-green-500" : "text-red-500"}>
                    {manager.status ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
