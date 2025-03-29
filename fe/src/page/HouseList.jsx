import React, { useState, useEffect } from "react";
import axios from "axios";
import House1_img from "../assets/images/house_1.jpeg";
import House2_img from "../assets/images/house_2.jpg";
import House3_img from "../assets/images/house_3.jpg";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    status: true,
    location: {
      detailLocation: "",
      ward: "",
      district: "",
      province: "",
      srcMap: "",
    },
    electricPrice: "",
    waterPrice: "",
    servicePrice: "",
    internetPrice: "",
    rules: "",
  });
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
      alert(
        `House status changed to ${newStatus ? "available" : "unavailable"}!`
      );
    } catch (error) {
      console.error("Error changing house status:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      alert("Failed to change house status!");
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setCreateFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateHouse = async () => {
    try {
      const response = await api.post("/house/create", createFormData);
      setHouseList((prevList) => [...prevList, response.data.data]);
      setShowCreateModal(false);
      setCreateFormData({
        name: "",
        status: true,
        location: {
          detailLocation: "",
          ward: "",
          district: "",
          province: "",
          srcMap: "",
        },
        electricPrice: "",
        waterPrice: "",
        servicePrice: "",
        internetPrice: "",
        rules: "",
      });
      alert("House created successfully!");
    } catch (error) {
      console.error("Error creating house:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      alert(error.response?.data?.message || "Failed to create house!");
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 p-8">
      <div className="col-span-1 flex flex-col gap-4 w-[50%]"></div>

      <div className="col-span-2 flex flex-col gap-8 ml-[-70px] mr-[60px]">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Danh sách nhà trọ</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-800 transition duration-200 text-white w-[40%] px-2 py-1 rounded"
          >
            Tạo thông tin nhà trọ mới
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
              {/* <img
                src={house.imageUrl || House1_img}
                alt={`House ${index + 1}`}
                className="absolute left-0 top-0 w-1/3 h-full object-cover"
              /> */}
              <div className="flex flex-col justify-between w-full h-[150px]">
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
                      house.status
                        ? "bg-blue-500 hover:bg-blue-700"
                        : "bg-red-500 hover:bg-red-700"
                    } text-white px-4 py-2 mt-2 rounded`}
                  >
                    {house.status ? "Đang Hoạt Động" : "Bảo Trì Nâng Cấp"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpdateModal(house);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 mt-2 rounded"
                  >
                    Cập Nhật Thông Tin
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
            <p>Hãy lựa chọn nhà để xem địa chỉ cụ thể.</p>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              Cập nhật thông tin nhà trọ
            </h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">
                  Tên nhà trọ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={updateFormData.name || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Số lượng phòng <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfRoom"
                  value={updateFormData.numberOfRoom || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Số lượng người thuộc nhà trọ
                </label>
                <input
                  type="number"
                  name="numberOfMember"
                  value={updateFormData.numberOfMember || ""}
                  disabled
                  className="w-full p-2 border rounded bg-gray-400"
                />
              </div>
              <div className="mb-4">
                <div className="mb-4">
                  <div className="flex">
                    <label className="block mb-2 mr-3">
                      Liên kết bản đồ <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Info
                        className="text-gray-400 hover:text-gray-700 transition duration-300 cursor-pointer"
                        size={24}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      />
                      {/* Tooltip */}
                      {showTooltip && (
                        <div
                          id="tooltip-right"
                          role="tooltip"
                          className="absolute z-10 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-100 transition-opacity duration-300 tooltip"
                          style={{ width: "250px" }}
                        >
                          Hướng dẫn lấy liên kết bản đồ:
                          <br />
                          Bước 1: Truy cập vào Google Map.
                          <br />
                          Bước 2: Tìm tên trọ của bạn đã được hiển thị trên
                          Google Map.
                          <br />
                          Bước 3: Nhấn vào Icon chia sẻ.
                          <br />
                          Bước 4: Chọn tab "Nhúng bản đồ".
                          <br />
                          Bước 5: Copy đoạn chữ bắt đầu từ '"http' đến trước chữ
                          '"width'. BƯớc 6: Dán vào ô điền thông tin liên kết
                          bản đồ
                          <div
                            className="tooltip-arrow"
                            data-popper-arrow
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    name="location.srcMap"
                    value={updateFormData.location?.srcMap || ""}
                    onChange={handleUpdateChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <label className="block mb-2">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  name="location.detailLocation"
                  value={updateFormData.location?.detailLocation || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Phường</label>
                <input
                  type="text"
                  name="location.ward"
                  value={updateFormData.location?.ward || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quận/Huyện</label>
                <input
                  type="text"
                  name="location.district"
                  value={updateFormData.location?.district || ""}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  name="location.province"
                  value={updateFormData.location?.province || ""}
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
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateHouse(selectedHouse._id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Tạo khu nhà trọ mới</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">
                  Tên phòng <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Giá điện cố định <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="electricPrice"
                  value={createFormData.electricPrice}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Giá nước cố định <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="waterPrice"
                  value={createFormData.waterPrice}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Giá dịch vụ cố định <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="servicePrice"
                  value={createFormData.servicePrice}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">
                  Giá mạng cố định <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="internetPrice"
                  value={createFormData.internetPrice}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  name="location.detailLocation"
                  value={createFormData.location.detailLocation}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Phường</label>
                <input
                  type="text"
                  name="location.ward"
                  value={createFormData.location.ward}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quậm/Huyện</label>
                <input
                  type="text"
                  name="location.district"
                  value={createFormData.location.district}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  name="location.province"
                  value={createFormData.location.province}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <div className="flex">
                  <label className="block mb-2 mr-3">
                    Liên kết bản đồ <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Info
                      className="text-gray-400 hover:text-gray-700 transition duration-300 cursor-pointer"
                      size={24}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    />
                    {/* Tooltip */}
                    {showTooltip && (
                      <div
                        id="tooltip-right"
                        role="tooltip"
                        className="absolute z-10 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-100 transition-opacity duration-300 tooltip"
                        style={{ width: "250px" }}
                      >
                        Hướng dẫn lấy liên kết bản đồ:
                        <br />
                        Bước 1: Truy cập vào Google Map.
                        <br />
                        Bước 2: Tìm tên trọ của bạn đã được hiển thị trên Google
                        Map.
                        <br />
                        Bước 3: Nhấn vào Icon chia sẻ.
                        <br />
                        Bước 4: Chọn tab "Nhúng bản đồ".
                        <br />
                        Bước 5: Copy đoạn chữ bắt đầu từ '"http' đến trước chữ
                        '"width'. BƯớc 6: Dán vào ô điền thông tin liên kết bản
                        đồ
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  name="location.srcMap"
                  value={createFormData.location.srcMap}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quy tắc nhà trọ</label>
                <textarea
                  name="rules"
                  value={createFormData.rules}
                  onChange={handleCreateChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateHouse}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Tạo mới
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
