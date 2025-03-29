import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const UpdateLodgerAccount = () => {
  const navigate = useNavigate();
  const { lodgerAccounId } = useParams();
  console.log("Member account id", lodgerAccounId);
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    identityCard: "",
    phone: "",
    room: "",
    rentalDate: "",
    leaseTerminationDate: "",
    gender: "",
  };
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    password: "",
    dateOfBirth: "",
    identityCard: "",
    email: ""
  });
  const [formData, setFormData] = useState(initialFormData);
  const [isActive, setIsActive] = useState(true); // Status as boolean
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [originalStatus, setOriginalStatus] = useState(true);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/v1/room");
      console.log("Rooms response:", response.data);
      let roomsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      } else if (response.data && typeof response.data === "object") {
        console.log("API Response structure:", response.data);
        roomsData = Object.values(response.data).filter(
          (item) => typeof item === "object"
        );
      }

      setRooms(roomsData);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError(
        "Failed to load rooms: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchProfile();
        await fetchRooms();
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchInitialData();
  }, [lodgerAccounId]);

  const fetchProfile = async () => {
    try {
      setFetchingProfile(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/v1/account/lodger/${lodgerAccounId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Get lodger account response: ", response.data);
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };
        const accountStatus = Boolean(profileData.status);
        const mappedData = {
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          password: "",
          dateOfBirth: formatDate(profileData.dateOfBirth),
          identityCard: profileData.identityCard || "",
          phone: profileData.phone || "",
          room: profileData.roomId?._id || "",
          roomName: profileData.roomId?.name || "", 
          rentalDate: formatDate(profileData.rentalDate),
          leaseTerminationDate: formatDate(profileData.leaseTerminationDate),
          gender: profileData.gender || "",
          status: accountStatus, 
        };
        setFormData(mappedData);
        setOriginalData(mappedData);
        setIsActive(accountStatus);
        setOriginalStatus(accountStatus);
        if (profileData.avatar) {
          setAvatarPreview(profileData.avatar);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setFetchingProfile(false);
    }
  };

  const validatePassword = (password) => {
    if (!password) return "";
    
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái viết hoa";
    }
    
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái viết thường";
    }
    
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ số";
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
    }
    
    return "";
  };

  const validateIdentityCard = (identityCard) => {
    if (!identityCard || (originalData && identityCard === originalData.identityCard)) return "";
    
    if (!/^\d{12}$/.test(identityCard)) {
      return "Căn cước công dân phải có đúng 12 ký tự số";
    }
    
    return "";
  };

  const validateBirthDate = (birthDate) => {
    if (!birthDate) return "Ngày sinh là bắt buộc";
    
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    
    if (birthYear > currentYear - 18) {
      return "Người thuê phải đủ 18 tuổi";
    }
    
    return "";
  };

  const validateName = (name, fieldName) => {
    if (!name || !name.trim()) {
      return `${fieldName} không được để trống hoặc chỉ chứa khoảng trắng`;
    }
    
    // Using the simplified regex for Vietnamese names
    const nameRegex = /^[a-zA-Z\sÀ-ỹ]+$/;
    if (!nameRegex.test(name)) {
      return `${fieldName} không được chứa số hoặc ký tự đặc biệt`;
    }
    
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }

    if (!isEditing && originalData && originalData[name] !== value) {
      setIsEditing(true);
    }
  };

  const handleStatusChange = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    
    if (newStatus !== originalStatus && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setIsEditing(true);
    }
  };

  const validateForm = () => {
    const errors = {
      firstName: validateName(formData.firstName, "Tên"),
      lastName: validateName(formData.lastName, "Họ"),
      password: validatePassword(formData.password),
      dateOfBirth: validateBirthDate(formData.dateOfBirth),
      identityCard: validateIdentityCard(formData.identityCard),
      email: "",
    };

    setValidationErrors(errors);
        return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      let updateData = {};

      if (isEditing) {
        Object.keys(formData).forEach((key) => {
          if (key === "password" && !formData[key]) return; 
          if (key === "avatar" || key === "roomName" || key === "status") return;
          if (formData[key] !== originalData[key]) {
            updateData[key] = formData[key];
          }
        });
        if (isActive !== originalStatus) {
          updateData.status = Boolean(isActive);
        }

        console.log("Data being sent to update:", updateData);

        const response = await axios.put(
          `http://localhost:5000/api/v1/account/updateLodgerAccount/${lodgerAccounId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccess("Cập nhật hồ sơ thành công!");
        
        setOriginalData({
          ...originalData,
          ...updateData,
          status: isActive,
        });
        
        setOriginalStatus(isActive); 
        setIsEditing(false);
      } else {
        setSuccess("Không có thay đổi nào được thực hiện.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      
      if (err.response?.data?.errors) {
        setValidationErrors({
          ...validationErrors,
          ...err.response.data.errors
        });
        
        setError("Vui lòng kiểm tra lại thông tin");
      } else {
        setError(
          err.response?.data?.message ||
            "Không thể cập nhật hồ sơ. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (originalData) {
      setFormData({ ...originalData });
    } else {
      setFormData({ ...initialFormData });
    }
    setIsActive(originalStatus);
    setAvatar(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setValidationErrors({
      firstName: "",
      lastName: "",
      password: "",
      dateOfBirth: "",
      identityCard: "",
      email: "",
    });
  };

  if (fetchingProfile) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-green-600" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 max-h-screen pt-6">
      <div className="max-w-6xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-4 py-2 rounded-md mb-8"
        >
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
              {/* First Name Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full border ${
                    validationErrors.firstName ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập tên người thuê"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Họ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full border ${
                    validationErrors.lastName ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập họ người thuê"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`w-full border ${
                    validationErrors.email ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập email người thuê"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-700 text-sm">Mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    name="password"
                    className={`w-full border ${
                      validationErrors.password ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md pr-10`}
                    placeholder="Nhập mật khẩu mới hoặc để trống"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                )}
                {!validationErrors.password && formData.password && (
                  <p className="text-gray-500 text-xs mt-1">
                    Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số, và ký tự đặc biệt.
                  </p>
                )}
              </div>

              {/* ID Card Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Căn cước công dân
                </label>
                <input
                  type="text"
                  name="identityCard"
                  className={`w-full border ${
                    validationErrors.identityCard ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập CCCD"
                  value={formData.identityCard}
                  onChange={handleInputChange}
                />
                {validationErrors.identityCard && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.identityCard}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  placeholder="Nhập số điện thoại liên lạc"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                />
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="block text-gray-700 text-sm">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className={`w-full border ${
                    validationErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>
                )}
              </div>

              {/* Room Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Phòng
                </label>
                <select
                  name="room"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={formData.room}
                  onChange={handleInputChange}
                >
                  <option value="">Không chọn phòng</option>
                  {formData.roomName && (
                    <option value={formData.room}>
                      {formData.roomName} (Hiện tại)
                    </option>
                  )}
                  {rooms
                    .filter(room => !formData.room || room._id !== formData.room)
                    .map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name} ({room.status})
                      </option>
                    ))}
                </select>
              </div>

              {/* Rental Date Field */}
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

              {/* Lease Termination Date Field */}
              <div>
                <label className="block text-gray-700 text-sm">
                  Ngày kết thúc thuê
                </label>
                <input
                  type="date"
                  name="leaseTerminationDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.leaseTerminationDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 mt-8 lg:mt-0 flex flex-col items-center">
            {/* Avatar Section */}
            <div className="text-green-600 font-medium mb-2">Ảnh đại diện</div>
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
              {avatar ? (
                <img
                  src={URL.createObjectURL(avatar)}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-20 h-20 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              )}
            </div>
            <label className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-4 py-2 rounded-md text-sm cursor-pointer">
              Tải ảnh lên
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>

            {/* Gender Section */}
            <div className="mt-4">
              <div className="text-green-600 font-medium text-center mb-2">
                Giới tính
              </div>
              <div className="flex flex-col">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500"
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
                    className="w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-2">Nữ</span>
                </label>
              </div>
            </div>

            {/* Account Status Section */}
            <div className="mt-4 mb-8 flex flex-col items-center">
              <div className="text-green-600 font-medium text-center mb-2">
                Trạng thái hiệu lực
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={handleStatusChange}
                />
                <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </label>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="w-full flex justify-center space-x-8 mt-8">
            <button
              type="button"
              className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-8 py-2 rounded-md"
              onClick={handleDiscard}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`${
                isEditing 
                  ? "bg-green-500 hover:bg-green-700" 
                  : "bg-gray-400 cursor-not-allowed"
              } transition duration-200 text-white px-8 py-2 rounded-md`}
              disabled={loading || !isEditing}
            >
              {loading ? "Đang xử lý..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLodgerAccount;