import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateLodgerAccount = ({accountType}) => {
  // Initial state to use for resetting the form
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    identityCard: "",
    phone: "",
    room: "",
    rentalDate: "",
    leaseTerminationDate: "",
    gender: ""
  };

  const [avatar, setAvatar] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch room data when component mounts
  useEffect(() => {
    fetchRooms();
    if (accountType !== "Lodger") {
      setError("You do not have permission to create a lodger account.");
    }
  }, [accountType]);
  
  // Function to fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Assuming token is stored
      const response = await axios.get("http://localhost:5000/api/v1/room", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check the structure of the response and extract the array
      let roomsData = [];
      if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        console.log("API Response structure:", response.data);
        roomsData = Object.values(response.data).filter(item => typeof item === 'object');
      }
      
      setRooms(roomsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again later.");
      setLoading(false);
    }
  };


  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (accountType !== "Lodger") {
      setError("You do not have permission to create a lodger account.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      // Prepare data in the format expected by the API
      const token = localStorage.getItem("token");      
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.birthDate,
        identityCard: formData.identityCard,
        phone: formData.phone,
        room: formData.room,
        rentalDate: formData.rentalDate,
        leaseTerminationDate: formData.leaseTerminationDate,
        gender: formData.gender,
        status: isActive,
        accountType: "Lodger"
      };
  
      console.log("Sending data:", requestData);
  
      await axios.post(
        "http://localhost:5000/api/v1/account/create",
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setSuccess("Account created successfully!");
      handleDiscard();
      setLoading(false);
    } catch (err) {
      console.error("Error creating account:", err);
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    // Clear form data by setting empty values
    setFormData({ ...initialFormData });
    
    // Reset avatar and active state
    setAvatar(null);
    setIsActive(true);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded-md mb-8">
          Quay về
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-wrap">
          <div className="w-full lg:w-2/3 pr-0 lg:pr-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm">Tên</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Họ</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    name="password"
                    className="w-full border border-gray-300 p-2 rounded-md pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => console.log("Toggle password visibility")}
                  >
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Căn cước công dân</label>
                <input
                    type="text"
                    name="identityCard"
                    className="w-full border border-gray-300 p-2 rounded-md mt-1"
                    value={formData.identityCard}
                    onChange={handleInputChange}
                    required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm">Ngày sinh</label>
                <input
                  type="date"
                  name="birthDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Phòng</label>
                <div className="relative mt-1">
                  <select
                    name="room"
                    className="w-full border border-gray-300 p-2 rounded-md appearance-none pr-8"
                    value={formData.room}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Lựa chọn phòng</option>
                    {Array.isArray(rooms) ? (
                      rooms.map((room) => (
                        <option 
                          key={room._id || room.id || Math.random().toString()}
                          value={room._id}
                          disabled={room.status === "full"}
                        >
                          {room.name} ({room.status})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Không còn phòng hợp lệ</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Ngày thuê</label>
                <input
                  type="date"
                  name="rentalDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.rentalDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Ngày ngừng thuê</label>
                <input
                  type="date"
                  name="leaseTerminationDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.leaseTerminationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0 flex flex-col items-center">
            <div className="text-green-600 font-medium mb-2">Ảnh đại diện</div>
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
              {avatar ? (
                <img 
                  src={URL.createObjectURL(avatar)} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              )}
            </div>
            <label className="bg-green-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer">
              Tải ảnh lên
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>

            <div className="mt-4">
              <div className="text-green-600 font-medium text-center mb-2">Giới tính</div>
              <div className="flex flex-col">
                <label className="inline-flex items-center">
                    <input 
                        type="radio" 
                        name="gender" 
                        value="Male" 
                        checked={formData.gender === "Male"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500 dark:focus:ring-green-600"
                    />
                    <span className="ml-2">Nam</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Female" 
                    checked={formData.gender === "Female"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500 dark:focus:ring-green-600"
                  />
                  <span className="ml-2">Nữ</span>
                </label>
              </div>
            </div>

            <div className="mt-4 mb-8 flex flex-col items-center">
              <div className="text-green-600 font-medium text-center mb-2">Trạng thái hiệu lực</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isActive} 
                  onChange={() => setIsActive(!isActive)} 
                />
                <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
              </label>
            </div>
          </div>
          
          <div className="w-full flex justify-center space-x-8 mt-8">
            <button 
              type="button" 
              className="bg-green-600 text-white px-8 py-2 rounded-md"
              onClick={handleDiscard}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="bg-green-600 text-white px-8 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLodgerAccount;
