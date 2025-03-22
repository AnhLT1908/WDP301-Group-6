import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [houses, setHouses] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", // Added password field
    dateOfBirth: "",
    identityCard: "",
    phone: "",
    gender: "",
    status: true,
    accountType: "Manager", // Capitalized to match validation
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
      
      console.log("API Response:", response.data);
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
  console.log(houses[managers._id]);

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
      const response = await axiosInstance.post("/account/create-manager", formData);
      
      if (response.status === 201) {
        alert("Manager created successfully!");
        setShowForm(false);
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
        fetchManagers();
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
      alert(error.response?.data?.message || "An error occurred while creating the manager");
    }
  };

  const handleChangeStatus = async (managerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axiosInstance.patch(`/account/accounts/${managerId}/status`, {
        status: newStatus,
      });

      if (response.status === 200) {
        alert(response.data.message);
        fetchManagers();
      }
    } catch (error) {
      console.error("Error changing status:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
      alert(error.response?.data?.message || "An error occurred while changing the status");
    }
  };

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Manager List</h2>
      
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showForm ? "Cancel" : "Create Manager Account"}
      </button>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">First Name</label>
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
              <label className="block mb-1">Last Name</label>
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
              <label className="block mb-1">Email</label>
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
              <label className="block mb-1">Password</label>
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
              <label className="block mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Identity Card</label>
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
              <label className="block mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                pattern="^(\+84|0)[3-9][0-9]{9}$"
                title="Phone number must start with +84 or 0 followed by 3-9 and 9 digits"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Lodger">Lodger</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Manager
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>House</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager, index) => (
                <tr key={index} className="border-t">
                  <td>{manager.firstName + " " + manager.lastName}</td>
                  <td>{manager.email}</td>
                  <td>{manager.phone}</td>
                  <td>{houses[manager._id] || "Not assigned"}</td>
                  <td>
                    <button
                      onClick={() => handleChangeStatus(manager._id, manager.status)}
                      className={`px-2 py-1 rounded text-white ${
                        manager.status 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {manager.status ? "Active" : "Inactive"}
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