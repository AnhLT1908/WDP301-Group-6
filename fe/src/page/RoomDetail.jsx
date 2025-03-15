import React from "react";

const RoomDetail = () => {
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
          <div>
            <label className="block text-sm mb-1">Tên phòng</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tầng nhà</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Diện tích</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Khu trọ</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* Second card section - Financial Information */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm mb-1">Tiền đặt cọc phòng</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Gía phòng</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tiền nợ</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Số điện sử dụng hàng tháng</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* Third card section - Member Information */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thành viên</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm mb-1">Thành viên</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Thành viên</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Thành viên</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Thành viên</label>
            <input
              type="text"
              defaultValue="0382001888"
              className="border rounded p-2 w-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom buttons section - positioned at the bottom of the viewport */}
      <div className="mt-auto grid grid-cols-3 gap-4">
        <div>
          <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
            Status
          </button>
        </div>
        <div>
          <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
            Xem hóa đơn phòng
          </button>
        </div>
        <div>
          <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
            Xem báo cáo phòng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;