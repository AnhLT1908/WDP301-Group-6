import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    houseId: "",
    name: "",
    floor: "",
    roomType: "",
    roomPrice: "",
    deposit: "",
    area: "",
    status: "available",
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // API instance với token
  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          console.error("No user data found");
          setLoading(false);
          return;
        }

        const { _id: managerId } = JSON.parse(userData);
        if (!managerId) {
          console.error("No manager ID found");
          setLoading(false);
          return;
        }

        const houseResponse = await api.get("/house");
        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        console.log("House", houseResponse)

        const managerHouse = houseResponse.data.houses.find(
          (house) => house.hostId === managerId
        );

        console.log("managerHouse", managerHouse)
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        // Lưu houseId để dùng khi thêm phòng
        setNewRoomData((prev) => ({ ...prev, houseId: managerHouse._id }));

        const response = await api.get("/room/");
        console.log("roomList", response)

        if (Array.isArray(response.data.data)) {
          const filteredRooms = response.data.data.filter(
            (room) => room.house === managerHouse._id
          );
          console.log("filteredRooms", filteredRooms)
          setRooms(filteredRooms);
        } else {
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  console.log("rooms list", rooms)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRoom = async () => {
    try {
      // Kiểm tra hợp đồng hiện tại của phòng (nếu có)
      const contractResponse = await api.get(
        `/contract/room/${newRoomData.name}`
      );
      if (contractResponse.data.data && contractResponse.data.count > 0) {
        alert("Phòng này đã có hợp đồng!");
        return;
      }

      const response = await api.post("/room/addRoom", newRoomData);
      const newRoom = response.data.data;

      // Cập nhật danh sách phòng
      setRooms((prev) => [...prev, newRoom]);
      setIsAddModalOpen(false);
      setNewRoomData({
        houseId: newRoomData.houseId,
        name: "",
        floor: "",
        roomType: "",
        roomPrice: "",
        deposit: "",
        area: "",
        status: "available",
      });
      alert("Thêm phòng thành công!");
    } catch (error) {
      console.error("Error adding room:", error);
      alert(
        error.response?.data?.message || "Không thể thêm phòng. Vui lòng thử lại!"
      );
    }
  };

  return (
    <section className="p-8 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-yellow-500 text-2xl font-bold">Room List</h2>
          <h3 className="text-yellow-400 text-xl font-bold">List</h3>
        </div>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Room
        </button>
      </div>

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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={index} className="border-t">
                  <td>{room.name}</td>
                  <td>{room.floor}</td>
                  <td>{room.roomType}</td>
                  <td>{room.quantityMember || 0}</td>
                  <td>{room.roomPrice || room.priceList?.roomPrice}</td>
                  <td
                    className={
                      room.status ? "text-green-500" : "text-red-500"
                    }
                  >
                    {room.status ? "Available" : "Full"}
                  </td>
                  <td>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() =>
                        navigate(`/manager/room/room-detail/${room._id}`)
                      }
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-semibold mb-4">Add New Room</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                value={newRoomData.name}
                onChange={handleInputChange}
                placeholder="Room Name"
                className="border rounded p-2"
              />
              <input
                type="text"
                name="floor"
                value={newRoomData.floor}
                onChange={handleInputChange}
                placeholder="Floor"
                className="border rounded p-2"
              />
              <input
                type="text"
                name="roomType"
                value={newRoomData.roomType}
                onChange={handleInputChange}
                placeholder="Room Type"
                className="border rounded p-2"
              />
              <input
                type="number"
                name="roomPrice"
                value={newRoomData.roomPrice}
                onChange={handleInputChange}
                placeholder="Room Price"
                className="border rounded p-2"
              />
              <input
                type="number"
                name="deposit"
                value={newRoomData.deposit}
                onChange={handleInputChange}
                placeholder="Deposit (optional)"
                className="border rounded p-2"
              />
              <input
                type="number"
                name="area"
                value={newRoomData.area}
                onChange={handleInputChange}
                placeholder="Area"
                className="border rounded p-2"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}