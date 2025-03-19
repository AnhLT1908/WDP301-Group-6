import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InvoiceDetail() {
  // Component state initialization
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [room, setRoom] = useState(null);
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lodgers, setLodgers] = useState([]);
  const [bills, setBills] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isBillPopupOpen, setIsBillPopupOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Fetch bill data
  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/bill/bill-detail/${billId}`);
        setBill(res.data.data);
        
        // Once we have the bill data, fetch the associated room
        if (res.data.data?.roomId) {
          fetchRoomData(res.data.data.roomId);
        }
        
      } catch (error) {
        console.error("Error fetching bill data:", error);
        setLoading(false);
      }
    };
    
    fetchBillData();
  }, [billId]);

  // Function to fetch room data
  const fetchRoomData = async (roomId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/room/${roomId}`);
      setRoom(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setLoading(false);
    }
  };

  // Fetch lodgers data
  useEffect(() => {
    const fetchLodgers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/account/lodger-accout-list");
        setLodgers(res.data.data);
      } catch (error) {
        console.error("Error fetching lodger data:", error);
      }
    };
    fetchLodgers();
  }, []);

  // Fetch bills for a specific room
  const fetchBills = async () => {
    if (!room?._id) return;
    
    try {
      const res = await axios.get("http://localhost:5000/api/v1/bill/");
      const filteredBills = res.data.data.filter(bill => bill.roomId === room._id);
      setBills(filteredBills);
      setIsBillPopupOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setRoom((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (field, value) => {
    setRoom((prev) => ({
      ...prev,
      priceList: { ...prev.priceList, [field]: value },
    }));
  };

  const handleMemberChange = (index, accountId) => {
    setRoom((prev) => {
      const newMembers = [...prev.members];
      newMembers[index] = { accountId };
      return { ...prev, members: newMembers };
    });
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !room?._id) return;

    const member = lodgers.find((lodger) => lodger.email === newMemberEmail);
    if (!member) {
      alert("Không tìm thấy thành viên với email này!");
      return;
    }

    const accountId = member._id;
    const joinDate = new Date().toISOString();

    try {
      await axios.post(`http://localhost:5000/api/v1/room/${room._id}/member`, {
        accountId: accountId,
        joinDate: joinDate,
      });

      setRoom((prev) => ({
        ...prev,
        members: [...prev.members, { accountId: accountId }],
      }));

      setNewMemberEmail("");
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Không thể thêm thành viên. Vui lòng thử lại.");
    }
  };

  const handleUpdateRoom = async () => {
    if (!room?._id) return;
    
    try {
      const updatedRoom = {
        name: room.name,
        floor: room.floor,
        area: room.area,
        status: room.status,
        priceList: room.priceList,
        roomBill: room.roomBill,
        members: room.members,
      };

      console.log("Dữ liệu gửi đi:", updatedRoom);
      const response = await axios.put(
        `http://localhost:5000/api/v1/room/${room._id}`, 
        updatedRoom
      );
      console.log("Phản hồi từ server:", response.data);

      setIsEditing(false);
      alert("Cập nhật phòng thành công!");
    } catch (error) {
      console.error(
        "Error updating room:", 
        error.response ? error.response.data : error.message
      );
      alert("Không thể cập nhật phòng. Vui lòng kiểm tra console để biết chi tiết.");
    }
  };

  const getLodgerName = (accountId) => {
    const lodger = lodgers.find(l => l._id === accountId);
    return lodger ? `${lodger.firstName} ${lodger.lastName}` : "Không tìm thấy";
  };

  // Navigate to create new invoice page
  const handleCreateNewInvoice = () => {
    if (room?._id) {
      navigate(`/manager/invoice/new-invoice/${room._id}`);
    } else {
      alert("Không thể tạo hóa đơn mới: Thiếu thông tin phòng");
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (!room) return <div className="container mx-auto p-4">Không tìm thấy thông tin phòng.</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-screen">
      <div className="mb-8">
        <div className="w-52">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded w-full"
            onClick={() => navigate(`/manager/room/rooms-list`)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tổng quát</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput
            label="Tên phòng"
            value={room.name}
            onChange={(val) => handleInputChange("name", val)}
            editable={isEditing}
          />
          <RoomInput
            label="Tầng nhà"
            value={room.floor}
            onChange={(val) => handleInputChange("floor", val)}
            editable={isEditing}
          />
          <RoomInput
            label="Diện tích"
            value={room.area}
            onChange={(val) => handleInputChange("area", val)}
            editable={isEditing}
          />
          <RoomInput
            label="Trạng thái"
            value={room.status}
            onChange={(val) => handleInputChange("status", val)}
            editable={isEditing}
          />
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          {room.priceList && Object.keys(room.priceList).map((key) => (
            <RoomInput
              key={key}
              label={key}
              value={room.priceList[key]}
              onChange={(val) => handlePriceChange(key, val)}
              editable={isEditing}
            />
          ))}
          <RoomInput
            label="Tiền nhà tháng"
            value={room.roomBill}
            onChange={(val) => handleInputChange("roomBill", val)}
            editable={isEditing}
          />
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thành viên</h2>
        <div className="flex flex-col space-y-4">
          {room.members && room.members.map((member, index) => (
            <RoomInput
              key={index}
              label={`Thành viên ${index + 1}`}
              value={getLodgerName(member.accountId)}
              onChange={(val) => handleMemberChange(index, val)}
              editable={false}
            />
          ))}
          {isEditing && (
            <>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="Nhập email thành viên"
              />
              <button 
                onClick={handleAddMember} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Thêm thành viên
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-4 gap-4">
        {isEditing ? (
          <button 
            onClick={handleUpdateRoom} 
            className="bg-green-500 text-white px-6 py-3 rounded w-full"
          >
            Lưu
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)} 
            className="bg-green-500 text-white px-6 py-3 rounded w-full"
          >
            Edit
          </button>
        )}
        <button
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
          onClick={fetchBills}
        >
          Xem hóa đơn phòng
        </button>
        <button
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
          onClick={handleCreateNewInvoice}
        >
          Tạo hóa đơn mới
        </button>
        <button 
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
        >
          Xem báo cáo phòng
        </button>
      </div>

      {isBillPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Danh sách hóa đơn</h3>
            <ul>
              {bills.map((bill) => (
                <li key={bill._id} className="mb-4">
                  <p>Note: {bill.note}</p>
                  <p>Total: {bill.total}</p>
                  <p>Status: {bill.status}</p>
                  <button
                    onClick={() => navigate(`/bill/${bill._id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Xem chi tiết
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsBillPopupOpen(false)}
              className="bg-red-500 text-white px-6 py-3 rounded w-full mt-4"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const RoomInput = ({ label, value, onChange, editable }) => {
  return (
    <div className="flex justify-between">
      <label className="w-1/4">{label}</label>
      {editable ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded p-2 w-3/4"
        />
      ) : (
        <span>{value || ""}</span>
      )}
    </div>
  );
};