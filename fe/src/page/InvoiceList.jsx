import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function InvoiceList() {
  const [bills, setBills] = useState([]);
  const [houses, setHouses] = useState({});
  const [rooms, setRooms] = useState({});
  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billRes, houseRes, roomRes] = await Promise.all([
          axios.get("http://localhost:5000/api/v1/bill/"),
          axios.get("http://localhost:5000/api/v1/house/"),
          axios.get("http://localhost:5000/api/v1/room/")
        ]);

        console.log(roomRes.data.data);
        
        const houseMap = houseRes.data.houses.reduce((acc, house) => {
          acc[house._id] = house.name;
          return acc;
        }, {});

        const roomMap = roomRes.data.data.reduce((acc, room) => {
          acc[room._id] = room.name;
          return acc;
        }, {});

        setBills(billRes.data.data || []);
        setHouses(houseMap);
        console.log(houses);
        setRooms(roomMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewDetail = (billId) => {
    navigate(`/manager/invoice-detail/${billId}`);
  };

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Invoice List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-200">
              <th className="p-2">House Name</th>
              <th className="p-2">Room Number</th>
              <th className="p-2">Note</th>
              <th className="p-2">Total Price</th>
              <th className="p-2">Payment Method</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{houses[bill.houseId] || "Unknown"}</td>
                  <td className="p-2">{rooms[bill.roomId] || "Unknown"}</td>
                  <td className="p-2">{bill.note}</td>
                  <td className="p-2">{bill.total}</td>
                  <td className="p-2">{bill.paymentMethod}</td>
                  <td className={`p-2 ${bill.isPaid ? "text-green-500" : "text-red-500"}`}>
                    {bill.isPaid ? "Paid" : "Unpaid"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleViewDetail(bill._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No invoices available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
