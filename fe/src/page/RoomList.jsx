import React, { useEffect, useState } from "react";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/room/")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); // Debug API response
        if (Array.isArray(data.data)) {
            setRooms(data.data);
        } else {
            setRooms([]); // Đảm bảo luôn là mảng
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching managers:", error);
        setRooms([]); // Tránh lỗi khi API thất bại
        setLoading(false);
      });
  }, []);
  

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Room List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Floor</th>
                <th>Room Type</th>
                <th>Quantity Member</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={index} className="border-t">
                  <td>{room.name}</td>
                  <td>{room.floor}</td>
                  <td>{room.roomType}</td>
                  <td>{room.quantityMember}</td>
                  <td>{room.roomPrice}</td>
                  <td className={room.status ? "text-green-500" : "text-red-500"}>
                    {room.status ? "Available" : "Empty"}
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
