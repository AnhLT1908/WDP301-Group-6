import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function HouseDetail() {
  const { houseId } = useParams(); // Lấy houseId từ URL
  const [house, setHouse] = useState(null);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/house/${houseId}`);
        setHouse(res.data.data);
      } catch (error) {
        console.error("Error fetching house data:", error);
      }
    };

    fetchHouse();
  }, [houseId]);

  if (!house) {
    return <p className="text-center text-gray-500">Loading house details...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-yellow-500 text-3xl font-bold mb-6">House Detail</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{house.name}</h2>
      </div>

      {/* House Information */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">House Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Địa Chỉ (Location):</strong> {house.location || "N/A"}</p>
          <p><strong>Số Phòng (Number of Rooms):</strong> {house.numberOfRoom}</p>
        </div>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          ✏️ Edit
        </button>
      </div>

      {/* Price Information */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Price Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>House Price:</strong> {house.servicePrice} VND</p>
          <p><strong>Water Price:</strong> {house.waterPrice} VND</p>
          <p><strong>Service Price:</strong> {house.servicePrice} VND</p>
          <p><strong>Electric Price:</strong> {house.electricPrice} VND</p>
        </div>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          ✏️ Edit
        </button>
      </div>

      {/* House Rules */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">House Rules</h2>
        <ul className="list-disc pl-6">
          {house.rules.length > 0 ? (
            house.rules.map((rule, index) => <li key={index}>{rule}</li>)
          ) : (
            <p>No rules defined.</p>
          )}
        </ul>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          ✏️ Edit
        </button>
      </div>
    </div>
  );
}
