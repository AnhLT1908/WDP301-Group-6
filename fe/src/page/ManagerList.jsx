import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [houses, setHouses] = useState({});
  const [unassignedHouses, setUnassignedHouses] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    identityCard: "",
    phone: "",
    gender: "",
    status: true,
    accountType: "Manager",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    fetchManagers();
    fetchUnassignedHouses();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axiosInstance.get("/account/manager");
      const resHouse = await axiosInstance.get("/house");
      const houseMap = resHouse.data.houses.reduce((acc, house) => {
        acc[house.hostId] = house.name;
        return acc;
      }, {});
      setHouses(houseMap);
      if (Array.isArray(response.data.data)) {
        setManagers(response.data.data);
      } else {
        setManagers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching managers:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
      setManagers([]);
      setLoading(false);
    }
  };

  const fetchUnassignedHouses = async () => {
    try {
      const response = await axiosInstance.get("/house");
      const unassigned = response.data.houses.filter((house) => !house.hostId);
      setUnassignedHouses(unassigned);
    } catch (error) {
      console.error("Error fetching unassigned houses:", error);
      setUnassignedHouses([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/account/create-manager",
        formData
      );
      if (response.status === 201) {
        alert("Manager created successfully!");
        setShowForm(false);
        resetForm();
        fetchManagers();
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while creating the manager"
      );
    }
  };

  const handleChangeStatus = async (managerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axiosInstance.patch(
        `/account/accounts/${managerId}/status`,
        {
          status: newStatus,
        }
      );
      if (response.status === 200) {
        alert(response.data.message);
        fetchManagers();
      }
    } catch (error) {
      console.error("Error changing status:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
      alert(
        error.response?.data?.message ||
          "An error occurred while changing the status"
      );
    }
  };

  const handleAssignHouse = async (e) => {
    e.preventDefault();
    if (!selectedHouseId) {
      alert("Please select a house to assign.");
      return;
    }
    try {
      const response = await axiosInstance.post("/account/transfer-manager", {
        houseId: selectedHouseId,
        managerId: selectedManagerId,
      });
      if (response.status === 200) {
        alert("House assigned successfully!");
        setSelectedManagerId(null); // Close the form by resetting selectedManagerId
        setSelectedHouseId("");
        fetchManagers();
        fetchUnassignedHouses();
      }
    } catch (error) {
      console.error("Error assigning house:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
      alert(
        error.response?.data?.message ||
          "An error occurred while assigning the house"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      dateOfBirth: "",
      identityCard: "",
      phone: "",
      gender: "",
      status: true,
      accountType: "Manager",
    });
  };

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">
        Danh sách tài khoản người quản lý
      </h2>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showForm ? "Hủy" : "Tạo tài khoản"}
      </button>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">
                Tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">
                Họ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">
                Mật Khẩu <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Ngày Tháng Năm Sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">
                Căn cước công dân <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="identityCard"
                value={formData.identityCard}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">
                Điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                pattern="^(\+84|0)[3-9][0-9]{8}$"
                title="Phone number must start with +84 or 0 followed by 3-9 and 9 digits"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Giới Tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Lựa chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Vai trò</label>
              <input
                type="text"
                name="accountType"
                value="Manager"
                disabled
                className="w-full p-2 border rounded bg-gray-300"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Tạo mới tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Điện Thoại</th>
                <th>Nhà Trọ Quản Lý</th>
                <th>Trạng Thái</th>
                <th>Tính Năng</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <React.Fragment key={manager._id}>
                  <tr className="border-t">
                    <td>{manager.firstName + " " + manager.lastName}</td>
                    <td>{manager.email}</td>
                    <td>{manager.phone}</td>
                    <td>{houses[manager._id] || "Chưa được quản lý"}</td>
                    <td>
                      <button
                        onClick={() =>
                          handleChangeStatus(manager._id, manager.status)
                        }
                        className={`px-2 py-1 rounded my-2 w-40 text-white ${
                          manager.status
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {manager.status ? "Hoạt Động" : "Vô Hiệu Hóa"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedManagerId(manager._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Cấp Quyền Quản Lý
                      </button>
                    </td>
                  </tr>
                  {selectedManagerId === manager._id && (
                    <tr>
                      <td colSpan="6" className="p-4 bg-gray-100">
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-bold mb-2">
                            Cấp quyền quản lý nhà cho{" "}
                            {manager.lastName + " " + manager.firstName}
                          </h3>
                          <form onSubmit={handleAssignHouse}>
                            <div className="mb-4">
                              <label className="block mb-1 text-base font-semibold">Chọn Nhà</label>
                              <select
                                value={selectedHouseId}
                                onChange={(e) =>
                                  setSelectedHouseId(e.target.value)
                                }
                                className="w-full p-2 border rounded"
                                required
                              >
                                <option value="">Chọn Nhà</option>
                                {unassignedHouses.map((house) => (
                                  <option key={house._id} value={house._id}>
                                    {house.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                              >
                                Cấp Quyền
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedManagerId(null)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
