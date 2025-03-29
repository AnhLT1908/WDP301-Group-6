import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateLodgerAccount = () => {
  const navigate = useNavigate();

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
    gender: "Male",
  };

  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    password: "",
    birthDate: "",
    identityCard: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    fetchRooms();
    console.log("Get token: ", token);
  }, []);

  // Function to fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/v1/room");
      console.log("response", response.data);
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

  // Validation functions
  const validatePassword = (password) => {

    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }

    const uppercaseRegex = /[A-Z]/;
    if (!uppercaseRegex.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái viết hoa";
    }

    const lowercaseRegex = /[a-z]/;
    if (!lowercaseRegex.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ cái viết thường";
    }

    const digitRegex = /[0-9]/;
    if (!digitRegex.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ số";
    }

    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
    }

    return "";
  };

  const validateIdentityCard = (identityCard) => {
    // Căn cước công dân: chỉ được phép có duy nhất 12 ký tự số
    const idCardRegex = /^[0-9]{12}$/;
    if (!idCardRegex.test(identityCard)) {
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
    if (!name.trim()) {
      return `${fieldName} không được để trống hoặc chỉ chứa khoảng trắng`;
    }

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
  };

  const validateForm = () => {
    const errors = {
      firstName: validateName(formData.firstName, "Tên"),
      lastName: validateName(formData.lastName, "Họ"),
      password: validatePassword(formData.password),
      birthDate: validateBirthDate(formData.birthDate),
      identityCard: validateIdentityCard(formData.identityCard),
    };

    setValidationErrors(errors);

    // Check if the form has any validation errors
    return !Object.values(errors).some((error) => error !== "");
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
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.birthDate,
        identityCard: formData.identityCard,
        phone: formData.phone,
        room: formData.room || null, // Allow null for room
        rentalDate: formData.rentalDate,
        leaseTerminationDate: formData.leaseTerminationDate,
        gender: formData.gender,
        status: isActive,
        accountType: "Lodger",
      };

      console.log("Sending data:", requestData);

      const response = await axios.post(
        "http://localhost:5000/api/v1/account/create",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Account created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      handleDiscard();
      setLoading(false);
    } catch (err) {
      console.error("Error creating account:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
      setTimeout(() => setError(null), 3000);
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setFormData({ ...initialFormData });
    setAvatar(null);
    setIsActive(true);
    setValidationErrors({
      firstName: "",
      lastName: "",
      password: "",
      birthDate: "",
      identityCard: "",
    });
  };

  const handleTurnBack = () => {
    navigate("/manager/lodger-list");
  };

  return (
    <div className="bg-gray-100 max-h-screen pt-6">
      <div className="max-w-6xl mx-auto p-4">
        <button
          onClick={handleTurnBack}
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

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="w-full lg:w-2/3 pr-0 lg:pr-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm">
                  Tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full border ${
                    validationErrors.firstName
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập tên người thuê"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Họ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full border ${
                    validationErrors.lastName
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập họ người thuê"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  placeholder="Nhập email người thuê"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    name="password"
                    className={`w-full border ${
                      validationErrors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-2 rounded-md pr-10`}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => console.log("Toggle password visibility")}
                  ></button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Căn cước công dân
                </label>
                <input
                  type="text"
                  name="identityCard"
                  className={`w-full border ${
                    validationErrors.identityCard
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  placeholder="Nhập CCCD"
                  value={formData.identityCard}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.identityCard && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.identityCard}
                  </p>
                )}
              </div>

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

              <div>
                <label className="block text-gray-700 text-sm">Ngày sinh</label>
                <input
                  type="date"
                  name="birthDate"
                  className={`w-full border ${
                    validationErrors.birthDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 rounded-md mt-1`}
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.birthDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm">Phòng</label>
                <div className="relative mt-1">
                  <select
                    name="room"
                    className="w-full border border-gray-300 p-2 rounded-md appearance-none pr-8"
                    value={formData.room}
                    onChange={handleInputChange}
                  >
                    <option value="">Lựa chọn phòng</option>
                    {Array.isArray(rooms) ? (
                      rooms.map((room) => (
                        <option
                          key={room._id || room.id || Math.random().toString()}
                          value={room._id}
                          disabled={room.status === "Full"}
                        >
                          {room.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Không còn phòng hợp lệ
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Ngày thuê <span className="text-red-600">*</span>
                </label>
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
                <label className="block text-gray-700 text-sm">
                  Ngày ngừng thuê
                </label>
                <input
                  type="date"
                  name="leaseTerminationDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.leaseTerminationDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center mt-1">
                <div className="text-gray-700 font-medium text-center mr-2">
                  Giới tính:
                </div>
                <div className="flex gap-2">
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
              <div className="flex mt-1">
                <div className="text-gray-700 font-medium text-center mr-2">
                  Trạng thái hiệu lực:
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                  <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center items-center space-x-6 mt-8">
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
              className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-8 py-2 rounded-md"
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
