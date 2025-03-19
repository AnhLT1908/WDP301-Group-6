import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.log("Manager ID:", managerId);

        const houseResponse = await axios.get("http://localhost:5000/api/v1/house");
        console.log("House API Response:", houseResponse.data);

        
        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        const managerHouse = houseResponse.data.houses.find(house => house.hostId === managerId);
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        console.log("Manager House:", managerHouse);
        console.log("Manager House ID:", managerHouse._id);
        

        const response = await axios.get("http://localhost:5000/api/v1/room/");
        console.log("Room API Response:", response.data);
        
        if (Array.isArray(response.data.data)) {
          const filteredRooms = response.data.data.filter(room => room.houseId === managerHouse._id);
          setRooms(filteredRooms);
          console.log("Filtered Rooms:", filteredRooms)
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
                <th>Action</th>
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
                  <td>
                    <button 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => navigate(`/manager/room/room-detail/${room._id}`)}
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
    </section>
  );
}
