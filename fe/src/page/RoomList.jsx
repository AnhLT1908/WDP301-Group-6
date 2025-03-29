import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    house: "",
    name: "",
    floor: "",
    roomPrice: "",
    deposit: "",
    area: "",
    status: true,
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // API instance với token
  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchRooms = async () => {
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

        const houseResponse = await api.get("/house");
        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        console.log("House", houseResponse);

        const managerHouse = houseResponse.data.houses.find(
          (house) => house.hostId === managerId
        );

        console.log("managerHouse", managerHouse);
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        // Lưu houseId để dùng khi thêm phòng
        setNewRoomData((prev) => ({ ...prev, house: managerHouse._id }));
        console.log("New room data: ", newRoomData);
        const response = await api.get("/room/");
        console.log("roomList", response);

        if (Array.isArray(response.data.data)) {
          const filteredRooms = response.data.data.filter(
            (room) => room.house === managerHouse._id
          );
          console.log("filteredRooms", filteredRooms);
          setRooms(filteredRooms);
        } else {
          setRooms([]);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  console.log("rooms list", rooms);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRoom = async () => {
    try {
      const response = await api.post("/room/addRoom", newRoomData);
      const newRoom = response.data.data;

      // Cập nhật danh sách phòng
      setRooms((prev) => [...prev, newRoom]);
      setIsAddModalOpen(false);
      setNewRoomData({
        house: newRoomData.houseId,
        name: "",
        floor: "",
        roomPrice: "",
        deposit: "",
        area: "",
        status: true,
      });
      alert("Thêm phòng thành công!");
    } catch (error) {
      console.error("Error adding room:", error);
      alert(
        error.response?.data?.message ||
          "Không thể thêm phòng. Vui lòng thử lại!"
      );
    }
  };

  const handleChangePages = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="w-full">
      <div className="shadow overflow-hidden m-6">
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-400 p-6 mx-6">
          <div>
            <h6 className="text-white text-lg font-medium">Danh sách phòng</h6>
          </div>
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800"
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm phòng
          </button>
        </div>

        <div className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "Tên phòng",
                    "Tầng nhà",
                    "Số thành viên",
                    "Tiền phòng",
                    "Diện tích",
                    "Tính năng",
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <span className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => {
                  const cellClass = `py-3 px-6 ${
                    index === index.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;
                  return (
                    <tr
                      key={room._id}
                      className="hover:bg-gray-300 transition duration-100"
                    >
                      <td className={cellClass}>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-semibold text-blue-gray-700">
                              {room.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          Tầng {room.floor}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {room.members.length > 0
                            ? `${room.members.length} thành viên`
                            : "Chưa có thành viên nào"}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {room.priceList.roomPrice.toLocaleString("vn-VN")} VND
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {room.area} m²
                        </p>
                      </td>

                      <td className={cellClass}>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center"
                            onClick={() =>
                              navigate(`/manager/room/room-detail/${room._id}`)
                            }
                          >
                            <Eye
                              size={20}
                              className="text-blue-600 hover:text-blue-800"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center mr-2 w-[110px] ${
            currentPage === 1
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-700"
          } p-2 rounded-lg text-base font-semibold text-white`}
        >
          Trang Trước
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleChangePages(pageNum)}
                className={`flex items-center justify-center px-3 py-1 text-lg font-semibold rounded-md ${
                  pageNum === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-green-500 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleChangePages(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex justify-center items-center ml-2 w-[110px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Trang Sau
        </button>
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-semibold mb-4">
              Thêm thông tin phòng mới
            </h3>
            <div className="flex flex-col space-y-4">
              <label for="roomName">
                Tên phòng <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="roomName"
                value={newRoomData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên phòng"
                className="border rounded p-2"
                required
              />
              <label for="roomName">
                Tầng nhà <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="floor"
                id="roomFloor"
                value={newRoomData.floor}
                onChange={handleInputChange}
                placeholder="Nhập tầng nhà"
                className="border rounded p-2"
              />
              <label for="roomName">
                Giá phòng <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="roomPrice"
                id="roomPrice"
                value={newRoomData.roomPrice}
                onChange={handleInputChange}
                placeholder="Nhập giá phòng"
                className="border rounded p-2"
                required
              />
              <label for="roomName">Tiền cọc:</label>
              <input
                type="number"
                name="deposit"
                id="roomDeposit"
                value={newRoomData.deposit}
                onChange={handleInputChange}
                placeholder="Nhập tiền cọc (Không bắt buộc)"
                className="border rounded p-2"
              />
              <label for="roomName">
                Diện tích <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="area"
                id="roomArea"
                value={newRoomData.area}
                onChange={handleInputChange}
                placeholder="Nhập diện tích phòng"
                className="border rounded p-2"
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleAddRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
