import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateLodgerAccount = () => {
  const navigate = useNavigate();
  
  // Initial state structure aligned with backend Account model
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "", // Renamed to match backend field
    identityCard: "",
    phone: "",
    room: "",
    rentalDate: "",
    leaseTerminationDate: "",
    gender: ""
  };

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch lodger profile and rooms data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchProfile();
        await fetchRooms();
      } catch (err) {
        console.error("Failed to initialize component data:", err);
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Fetches the current lodger's profile from the API
   * Populates the form with returned data
   */
  const fetchProfile = async () => {
    try {
      setFetchingProfile(true);
      const token = localStorage.getItem("token"); // Assuming token-based auth
      
      const response = await axios.get(
        "http://localhost:5000/api/v1/account/lodgerProfile",
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // }
      );

      if (response.data && response.data.data) {
        const profileData = response.data.data;
        
        // Format dates to YYYY-MM-DD for input fields
        const formatDate = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        // Extract room name from the response if available
        const roomName = profileData.room?.roomName || 
                         (profileData.roomId ? profileData.roomId.name : "");

        // Map backend data to form fields
        const mappedData = {
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          password: "", // Password is not returned from API
          dateOfBirth: formatDate(profileData.dateOfBirth),
          identityCard: profileData.identityCard || "",
          phone: profileData.phone || "",
          room: roomName,
          rentalDate: formatDate(profileData.rentalDate),
          leaseTerminationDate: formatDate(profileData.leaseTerminationDate),
          gender: profileData.gender || ""
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
        setIsActive(profileData.status || false);
        
        // Set avatar preview if available
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

  /**
   * Fetches available rooms from the API
   */
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        "http://localhost:5000/api/v1/room",
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // }
      );
      
      // Extract rooms data from response based on structure
      let roomsData = [];
      if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        roomsData = Object.values(response.data).filter(item => typeof item === 'object');
      }
      
      setRooms(roomsData);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles file selection for avatar upload
   * @param {Event} e - The change event from the file input
   */
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  /**
   * Updates form state when input values change
   * @param {Event} e - The change event from form inputs
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Track that user has made changes
    if (!isEditing && originalData && originalData[name] !== value) {
      setIsEditing(true);
    }
  };

  /**
   * Handles form submission to update profile
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const token = localStorage.getItem("token");
      
      // Prepare FormData for multipart/form-data submission (needed for file upload)
      const formDataToSend = new FormData();
      
      // Only include fields that have changed
      if (isEditing) {
        Object.keys(formData).forEach(key => {
          // Skip password if empty and email (which shouldn't be editable)
          if (key === 'password' && !formData[key]) return;
          if (key === 'email') return;
          
          // Only add fields that have values and are different from original
          if (formData[key] && (!originalData || formData[key] !== originalData[key])) {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // Add avatar if selected
        if (avatar) {
          formDataToSend.append('avatar', avatar);
        }
      
        // Send update request
        // const response = await axios.put(
        //   "http://localhost:5000/api/v1/account/updateLodgerProfile",
        //   formDataToSend,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       'Content-Type': 'multipart/form-data'
        //     }
        //   }
        // );
      
        setSuccess("Cập nhật hồ sơ thành công!");
        setOriginalData(formData);
        setIsEditing(false);
      } else {
        setSuccess("Không có thay đổi nào được thực hiện.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets form to original data
   */
  const handleDiscard = () => {
    if (originalData) {
      setFormData({ ...originalData });
    } else {
      setFormData({ ...initialFormData });
    }
    
    // Reset avatar if there was an original
    if (avatarPreview && avatar) {
      setAvatar(null);
      // If avatarPreview came from an uploaded file, reset it
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(originalData?.avatar || null);
      }
    }
    
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  /**
   * Navigates back to previous page
   */
  const handleGoBack = () => {
    navigate(-1);
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
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md mb-8"
          onClick={handleGoBack}
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
                  className="w-full border border-gray-300 p-2 rounded-md mt-1 bg-gray-100"
                  value={formData.email}
                  readOnly
                />
                <small className="text-gray-500">Email không thể thay đổi</small>
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
                    placeholder="Để trống nếu không thay đổi"
                    minLength={8}
                  />
                </div>
                <small className="text-gray-500">Ít nhất 8 ký tự</small>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Căn cước công dân</label>
                <input
                  type="text"
                  name="identityCard"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.identityCard}
                  onChange={handleInputChange}
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
                  minLength={10}
                />
                <small className="text-gray-500">Ít nhất 10 ký tự</small>
              </div>

              <div>
                <label className="block text-gray-700 text-sm">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Phòng</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1 bg-gray-100"
                  value={formData.room}
                  readOnly
                />
                <small className="text-gray-500">Phòng không thể thay đổi</small>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Ngày thuê</label>
                <input
                  type="date"
                  name="rentalDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1 bg-gray-100"
                  value={formData.rentalDate}
                  readOnly
                />
                <small className="text-gray-500">Không thể thay đổi</small>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm">Ngày ngừng thuê</label>
                <input
                  type="date"
                  name="leaseTerminationDate"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1 bg-gray-100"
                  value={formData.leaseTerminationDate}
                  readOnly
                />
                <small className="text-gray-500">Không thể thay đổi</small>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0 flex flex-col items-center">
            <div className="text-green-600 font-medium mb-2">Ảnh đại diện</div>
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300 overflow-hidden">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
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
              <div className="text-green-600 font-medium text-center mb-2">Trạng thái tài khoản</div>
              <div className="text-gray-600">
                {isActive ? "Đang hoạt động" : "Không hoạt động"}
              </div>
            </div>
          </div>
          
          <div className="w-full flex justify-center space-x-8 mt-8">
            <button 
              type="button" 
              className="bg-gray-500 text-white px-8 py-2 rounded-md"
              onClick={handleDiscard}
              disabled={loading || !isEditing}
            >
              Hủy thay đổi
            </button>
            <button 
              type="submit" 
              className={`${isEditing ? 'bg-green-600' : 'bg-gray-400'} text-white px-8 py-2 rounded-md`}
              disabled={loading || !isEditing}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLodgerAccount;