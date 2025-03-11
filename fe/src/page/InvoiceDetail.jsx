import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function InvoiceDetail() {
  const { billId } = useParams(); // Lấy houseId từ URL
  const [bill, setBill] = useState(null);
  const [house, setHouse] = useState([]);
  const [room, setRoom] = useState([]);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/bill/bill-detail/${billId}`);
        setBill(res.data.data);
      } catch (error) {
        console.error("Error fetching house data:", error);
      }
    };

    fetchBill();
  }, [billId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {houseRes, roomRes} = await Promise.all([
                    axios.get(`http://localhost:5000/api/v1/house/`),
                    axios.get(`http://localhost:5000/api/v1/room/`)
                ])

                const houseMap = houseRes.data.data.reduce((acc, house) => {
                    acc[house._id] = house.name;
                    return acc;
                  }, {});
          
                  const roomMap = roomRes.data.data.reduce((acc, room) => {
                    acc[room._id] = room.roomNumber;
                    return acc;
                  }, {});
          
                    setHouse(houseMap);
                    setRoom(roomMap);
            }catch (error) {
                console.error("Error fetching house data:", error);
            }
        }

        fetchData();
    }, [])

  if (!bill) {
    return <p className="text-center text-gray-500">Loading invocie details...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-yellow-500 text-3xl font-bold mb-6">Invoice Detail</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{bill.note}</h2>
      </div>

      {/* House Information */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">House Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>House Name:</strong> {house[bill.houseId] || "N/A"}</p>
          <p><strong>Room:</strong> {room[bill.roomId] || "N/A"}</p>
        </div>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          ✏️ Edit
        </button>
      </div>

      {/* Price Information */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Price Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Room Price:</strong> {bill.roomPrice} VND</p>
          <p><strong>Unit Price:</strong> {bill.priceList.totalUnit} VND</p>
        </div>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          ✏️ Edit
        </button>
      </div>

      {/* Total Price */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Total Price</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Total Price:</strong> {bill.total} VND</p>
          <p><strong>Status:</strong> {bill.isPaid ? "Paid" : "Unpaid"} VND</p>
          <p><strong>Payment Method:</strong> {bill.paymentMethod} VND</p>
        </div>
      </div>

      {/* QR Code*/}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4"> 
        <QRCodeCanvas value={bill.qrUrl} alt="QR Code" />
      </div>
    </div>
  );
}
