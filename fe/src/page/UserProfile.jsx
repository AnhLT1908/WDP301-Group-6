import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState({});
  const [bills, setBills] = useState([]);
  const [isBillPopupOpen, setIsBillPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          console.log("No user data found");
          return;
        }
        setUser(JSON.parse(userData));

        const refRoom = await axios.get(`http://localhost:5000/api/v1/room`);

        const roomMap = refRoom.data.data.reduce((acc, room) => {
          acc[room._id] = room.name;
          return acc;
        });

        setRoom(roomMap);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/bill/");
      const filteredBills = res.data.data.filter(
        (bill) => bill.roomId === user?.roomId
      );
      setBills(filteredBills);
      setIsBillPopupOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  return (
    <div>
      <Header />

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>{" "}
            {/* Avatar */}
            <div className="ml-4">
              <p className="text-lg font-medium">
                {user?.firstName + user?.lastName}
              </p>
              <p className="text-gray-600">{user?.accountType}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Information</h2>
          <p>
            <strong>Identify Card:</strong> {user?.identityCard}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Phone:</strong> {user?.phone}
          </p>
          <p>
            <strong>Gender:</strong> {user?.gender}
          </p>
          <p>
            <strong>Room:</strong> {user[room.roomId]}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-4">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded w-full"
            onClick={fetchBills}
          >
            Xem hóa đơn phòng
          </button>
        </div>
        {isBillPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Danh sách hóa đơn</h3>
              <ul>
                {bills.map((bill) => (
                  <li key={bill._id} className="mb-4">
                    <p>Note: {bill.note}</p>
                    <p>Total: {bill.total}</p>
                    <p>Status: {bill.status}</p>
                    <button
                      onClick={() => navigate(`/bill/${bill._id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Xem chi tiết
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsBillPopupOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded w-full mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
