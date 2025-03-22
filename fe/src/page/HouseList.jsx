import React, { useState, useEffect } from "react";
import axios from "axios";
import House1_img from "../assets/images/house_1.jpeg";
import House2_img from "../assets/images/house_2.jpg";
import House3_img from "../assets/images/house_3.jpg";
import { useNavigate } from "react-router-dom";

// Tạo axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const HouseList = () => {
  const [houseList, setHouseList] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await api.get("/house/");
        setHouseList(response.data.houses);
      } catch (error) {
        console.error("Error fetching houses:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchHouses();
  }, [navigate]);

  useEffect(() => {
    if (houseList.length > 0) {
      setSelectedHouse(houseList[0]);
    }
  }, [houseList]);

  const handleSelectHouse = (house) => {
    setSelectedHouse(house);
  };

  const handleTurnBack = () => {
    navigate("/admin");
  };

  const handleOpenUpdateModal = (house) => {
    setUpdateFormData({
      name: house.name,
      numberOfRoom: house.numberOfRoom,
      numberOfMember: house.numberOfMember,
      location: {
        detailLocation: house.location.detailLocation,
        ward: house.location.ward,
        district: house.location.district,
        province: house.location.province,
        srcMap: house.location.srcMap,
      },
    });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setUpdateFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else {
      setUpdateFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateHouse = async (houseId) => {
    try {
      const response = await api.put(`/house/${houseId}`, updateFormData);
      setHouseList((prevList) =>
        prevList.map((house) =>
          house._id === houseId ? response.data.data : house
        )
      );
      setSelectedHouse(response.data.data);
      setShowUpdateModal(false);
      alert("House updated successfully!");
    } catch (error) {
      console.error("Error updating house:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      alert("Failed to update house!");
    }
  };

  const handleChangeStatus = async (houseId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await api.put(`/house/${houseId}/change-status`, {
        status: newStatus,
      });
      
      setHouseList((prevList) =>
        prevList.map((house) =>
          house._id === houseId ? response.data.data : house
        )
      );
      setSelectedHouse(response.data.data);
      alert(`House status changed to ${newStatus ? "available" : "unavailable"}!`);
    } catch (error) {
      console.error("Error changing house status:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      alert("Failed to change house status!");
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 p-8">
      <div className="col-span-1 flex flex-col gap-4 w-[50%]">
        <button
          onClick={handleTurnBack}
          className="bg-green-500 hover:bg-green-700 text-white w-full px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <div className="col-span-2 flex flex-col gap-8 ml-[-70px] mr-[60px]">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Hostel List</h1>
          <button className="bg-green-500 text-white w-[50%] px-4 py-2 rounded">
            Create new hostel
          </button>
        </div>
        <h2 className="text-2xl text-gray-500 font-semibold">
          {selectedHouse?.name}
        </h2>

        {houseList.length > 0 ? (
          houseList.map((house, index) => (
            <div
              key={index}
              className="relative flex flex-row items-center bg-white p-4 rounded-lg shadow-lg overflow-hidden h-48 hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={() => handleSelectHouse(house)}
            >
              <img
                src={house.imageUrl || House1_img}
                alt={`House ${index + 1}`}
                className="absolute left-0 top-0 w-1/3 h-full object-cover"
              />
              <div className="flex flex-col justify-between ml-[36%] w-full h-[150px]">
                <h2 className="font-bold">{house.name || `Nhà trọ`}</h2>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-700">
                    {`Số lượng phòng: ${house.numberOfRoom} phòng`}
                  </p>
                  <p className="text-sm text-gray-700">
                    {`Số lượng người thuê: ${house.numberOfMember} người`}
                  </p>
                  <p className="text-sm text-gray-700">
                    {`Địa chỉ: ${house.location.detailLocation}, ${house.location.ward}, ${house.location.district}, ${house.location.province}`}
                  </p>
                </div>
                <div className="flex justify-around">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeStatus(house._id, house.status);
                    }}
                    className={`${
                      house.status ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"
                    } text-white px-4 py-2 mt-2 rounded`}
                  >
                    {house.status ? "Còn phòng" : "Hết phòng"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpdateModal(house);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 mt-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Loading houses...</p>
        )}
      </div>

      <div className="col-span-3 flex flex-col gap-4">
        <div className="relative w-full h-full bg-gray-300 rounded-3xl shadow-xl">
          {selectedHouse ? (
            <iframe
              className="absolute w-full h-[800px] rounded-3xl shadow-xl"
              src={`${selectedHouse.location.srcMap}`}
              title="Map"
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <p>Select a house to view its location.</p>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Update House</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={updateFormData.name || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Number of Rooms</label>
                <input
                  type="number"
                  name="numberOfRoom"
                  value={updateFormData.numberOfRoom || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Number of Members</label>
                <input
                  type="number"
                  name="numberOfMember"
                  value={updateFormData.numberOfMember || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Detail Location</label>
                <input
                  type="text"
                  name="location.detailLocation"
                  value={updateFormData.location?.detailLocation || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Ward</label>
                <input
                  type="text"
                  name="location.ward"
                  value={updateFormData.location?.ward || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">District</label>
                <input
                  type="text"
                  name="location.district"
                  value={updateFormData.location?.district || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Province</label>
                <input
                  type="text"
                  name="location.province"
                  value={updateFormData.location?.province || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Map URL</label>
                <input
                  type="text"
                  name="location.srcMap"
                  value={updateFormData.location?.srcMap || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateHouse(selectedHouse._id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseList;