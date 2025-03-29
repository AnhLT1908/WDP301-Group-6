import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BillEvidenceUpload from "../components/BillEvidenceUpload";

export default function LodgerRoomDetail() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const data = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = data ? JSON.parse(data) : null;

  console.log("User: ", user);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  // Fetch bill data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/v1/room/${roomId}`
        );
        const roomData = res.data.data;
        console.log("roomData", roomData);
        setRoom(roomData);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleTurnBack = () => {
    navigate(`/home`);
  };

  if (!room || isLoading) {
    return (
      <p className="text-center text-gray-500">Loading invoice details...</p>
    );
  }

  return (
    <div className="p-8 ">
      <div className="flex justify-between">
        <button
          onClick={handleTurnBack}
          className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-4 py-2 rounded-md mb-8"
        >
          Quay về
        </button>
        <p className="text-yellow-500 font-bold text-3xl">Chi Tiết Phòng Trọ</p>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col w-1/2">
          {/* Room Information */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông Tin Nhà Trọ</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Nhà trọ:</strong> {room.house?.name || "N/A"}
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                {`${room.house?.location?.detailLocation}, Xã ${room.house?.location?.ward}, Huyện ${room.house?.location?.district}, Thành Phố ${room.house?.location?.province}` ||
                  "N/A"}
              </p>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Tên Phòng:</strong> {room.name || "N/A"}
              </p>
              <p>
                <strong>Tầng:</strong> {room.floor || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-5">
              <p>
                <strong>Diện Tích:</strong> {room.area}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin tài chính</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Giá Phòng:</strong>{" "}
                {room.priceList.roomPrice.toLocaleString("vn-VN") || "N/A"} VND
              </p>
              <p>
                <strong>Tiền đặt cọc:</strong>{" "}
                {room.priceList.deposit === 0
                  ? "Không có tiền đặt cọc"
                  : room.priceList.deposit.toLocaleString("vn-VN") + " VND" ||
                    "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin thành viên</h2>
            <div className="mb-4">
              <p>
                <strong>Số lượng thành viên:</strong>{" "}
                {room.currentMember || "N/A"} người
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tên thành viên
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Số điện thoại
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {room.members.map((member, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${member.accountId.lastName} ${member.accountId.firstName}` ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.accountId.phone || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.accountId.email || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
