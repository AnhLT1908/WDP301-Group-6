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

  const [formData, setFormData] = useState(initialFormData);
  const [isActive, setIsActive] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rooms, setRooms] = useState([]); // Thêm state rooms

  // Fetch dữ liệu phòng
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

      setRooms(roomsData); // Cập nhật danh sách phòng
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

  // Fetch dữ liệu của lodger khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchProfile();
        await fetchRooms(); // Gọi hàm fetchRooms
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchInitialData();
  }, [lodgerAccounId]);

  /**
   * Lấy thông tin tài khoản từ API
   */
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

        // Chuyển đổi dữ liệu từ API cho phù hợp với form
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        const mappedData = {
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          password: "", // Không trả về mật khẩu
          dateOfBirth: formatDate(profileData.dateOfBirth),
          identityCard: profileData.identityCard || "",
          phone: profileData.phone || "",
          room: profileData.roomId?.name, // Sử dụng tên phòng
          rentalDate: formatDate(profileData.rentalDate),
          leaseTerminationDate: formatDate(profileData.leaseTerminationDate),
          gender: profileData.gender || "",
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
        setIsActive(profileData.status || false);

        // Cập nhật avatar preview nếu có
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

  // Xử lý khi người dùng thay đổi thông tin trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Kiểm tra xem có thay đổi gì không
    if (!isEditing && originalData && originalData[name] !== value) {
      setIsEditing(true);
    }
  };

  /**
   * Xử lý khi người dùng nhấn nút Lưu để cập nhật thông tin tài khoản
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      // Chỉ gửi những trường đã thay đổi
      let updateData = {};

      if (isEditing) {
        Object.keys(formData).forEach((key) => {
          // Bỏ qua các trường không cần thiết
          if (key === "password" && !formData[key]) return; // Không gửi password nếu không có giá trị
          if (key === "avatar") return; // Bỏ qua avatar

          // Chỉ gửi các trường có giá trị thay đổi
          if (formData[key] && formData[key] !== originalData[key]) {
            updateData[key] = formData[key];
          }
        });

        console.log("Data being sent to update:", updateData);

        // Gửi yêu cầu PUT đến API để cập nhật tài khoản
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
        setOriginalData(formData);
        setIsEditing(false);
      } else {
        setSuccess("Không có thay đổi nào được thực hiện.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Hủy bỏ thay đổi và reset lại form
  const handleDiscard = () => {
    if (originalData) {
      setFormData({ ...originalData });
    } else {
      setFormData({ ...initialFormData });
    }

    setAvatar(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Hiển thị khi đang tải dữ liệu
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
              <div>
                <label className="block text-gray-700 text-sm">
                  Tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  placeholder="Nhập tên người thuê"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Họ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  placeholder="Nhập họ người thuê"
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
                  placeholder="Nhập email người thuê"
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
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm">
                  Căn cước công dân
                </label>
                <input
                  type="text"
                  name="identityCard"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  placeholder="Nhập CCCD"
                  value={formData.identityCard}
                  onChange={handleInputChange}
                />
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
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

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
                  <option value="">{formData.room}</option>
                  {rooms
                    .filter((room) => room.name !== formData.room)
                    .map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name}
                      </option>
                    ))}
                </select>
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
            <div className="text-green-600 font-medium mb-2">Ảnh đại diện</div>
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
              {avatar ? (
                <img
                  src={URL.createObjectURL(avatar)}
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
                onChange={handleInputChange}
              />
            </label>

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

            <div className="mt-4 mb-8 flex flex-col items-center">
              <div className="text-green-600 font-medium text-center mb-2">
                Trạng thái hiệu lực
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

export default UpdateLodgerAccount;
