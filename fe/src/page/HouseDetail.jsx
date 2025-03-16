import React, { useEffect, useState } from "react";
import axios from "axios";

export default function HouseDetail() {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouse = async () => {
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

        const houseResponse = await axios.get(
          "http://localhost:5000/api/v1/house"
        );
        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        const managerHouse = houseResponse.data.houses.find(
          (house) => house.hostId === managerId
        );
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        setHouse(managerHouse);
      } catch (error) {
        console.error("Error fetching house data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-500">Loading house details...</p>
    );
  }

  if (!house) {
    return <p className="text-center text-gray-500">No house found.</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-yellow-500 text-3xl font-bold mb-6">House Detail</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {house.name}
        </h2>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">House Information</h2>
        <p>
          <strong>Địa Chỉ (Location):</strong> {house.location || "N/A"}
        </p>
        <p>
          <strong>Số Phòng (Number of Rooms):</strong> {house.numberOfRoom}
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Price Information</h2>
        <p>
          <strong>Water Price:</strong> {house.waterPrice} VND
        </p>
        <p>
          <strong>Service Price:</strong> {house.servicePrice} VND
        </p>
        <p>
          <strong>Electric Price:</strong> {house.electricPrice} VND
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">House Rules</h2>
        <ul className="list-disc pl-6">
          {house?.rules?.length > 0 ? (
            house.rules.map((rule, index) => <li key={index}>{rule}</li>)
          ) : (
            <p>No rules defined.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
