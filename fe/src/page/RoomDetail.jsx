import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/v1/room/${roomId}`)
      .then((response) => response.json())
      .then((data) => {
        setRoom(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setLoading(false);
      });
  }, [roomId]);

  if (loading) return <p>Loading...</p>;
  if (!room) return <p>Không tìm thấy thông tin phòng.</p>;

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-screen">
      {/* Top button section */}
      <div className="mb-8">
        <div className="w-52">
          <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
            Back
          </button>
        </div>
      </div>

      {/* First card section - Room Information */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tổng quát</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput label="Tên phòng" value={room.name} />
          <RoomInput label="Tầng nhà" value={room.floor} />
          <RoomInput label="Diện tích" value={room.area} />
          <RoomInput label="Khu trọ" value={room.zone} />
        </div>
      </div>

      {/* Second card section - Financial Information */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput label="Tiền đặt cọc phòng" value={room.deposit} />
          <RoomInput label="Giá phòng" value={room.price} />
          <RoomInput label="Tiền nợ" value={room.debt} />
          <RoomInput label="Số điện sử dụng hàng tháng" value={room.electricityUsage} />
        </div>
      </div>

      {/* Third card section - Member Information */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thành viên</h2>
        <div className="flex flex-col space-y-4">
          {room.members?.map((member, index) => (
            <RoomInput key={index} label={`Thành viên ${index + 1}`} value={member} />
          ))}
        </div>
      </div>

      {/* Bottom buttons section */}
      <div className="mt-auto grid grid-cols-3 gap-4">
        <button className="bg-green-500 text-white px-6 py-3 rounded w-full">Status</button>
        <button className="bg-green-500 text-white px-6 py-3 rounded w-full">Xem hóa đơn phòng</button>
        <button className="bg-green-500 text-white px-6 py-3 rounded w-full">Xem báo cáo phòng</button>
      </div>
    </div>
  );
};

const RoomInput = ({ label, value }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <input type="text" value={value || ""} className="border rounded p-2 w-full bg-white" readOnly />
  </div>
);

export default RoomDetail;
