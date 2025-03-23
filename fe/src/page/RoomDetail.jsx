import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lodgers, setLodgers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [bills, setBills] = useState([]);
  const [isBillPopupOpen, setIsBillPopupOpen] = useState(false);
  const [contracts, setContracts] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/room/${roomId}`);
        const roomData = {
          ...res.data.data,
          priceList: {
            roomPrice: res.data.data.priceList?.roomPrice || 0,
            deposit: res.data.data.priceList?.deposit || 0,
          },
        };
        setRoom(roomData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const fetchLodgers = async () => {
      try {
        const res = await api.get("/account/lodger-accout-list");
        setLodgers(res.data.data);
      } catch (error) {
        console.error("Error fetching lodger data:", error);
      }
    };
    fetchLodgers();
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get(`/contract/room/${roomId}`);
        setContracts(res.data.data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };
    fetchContracts();
  }, [roomId]);

  const fetchBills = async () => {
    try {
      const res = await api.get("/bill/");
      const filteredBills = res.data.data.filter(
        (bill) => bill.roomId === roomId
      );
      setBills(filteredBills);
      setIsBillPopupOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const updateRoomStatus = async (memberCount) => {
    try {
      const newStatus = memberCount < 3 ? "available" : "full"; // Đổi sang string theo backend
      await api.put(`/room/${roomId}/status`, { status: newStatus });
      setRoom((prev) => ({ ...prev, status: newStatus === "available" })); // Chuyển lại boolean cho frontend
    } catch (error) {
      console.error("Error updating room status:", error);
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

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      alert("Vui lòng nhập email thành viên!");
      return;
    }

    const member = lodgers.find((lodger) => lodger.email === newMemberEmail);
    if (!member) {
      alert("Không tìm thấy thành viên với email này!");
      return;
    }

    const accountId = member._id;

    const contractMembers = contracts
      .filter((contract) => contract.roomId.toString() === room._id.toString())
      .flatMap((contract) => [
        contract.benA.toString(),
        contract.benB.toString(),
        ...contract.relatedParties.map((id) => id.toString()),
      ]);

    if (contractMembers.includes(accountId.toString())) {
      alert(
        "Thành viên này đã có trong hợp đồng của phòng (benA, benB hoặc relatedParties)!"
      );
      return;
    }

    const relatedPartiesCount = contracts
      .filter((contract) => contract.roomId.toString() === room._id.toString())
      .reduce((total, contract) => total + contract.relatedParties.length, 0);

    if (relatedPartiesCount >= 3) {
      alert("Số lượng bên liên quan trong hợp đồng đã đạt tối đa 3 người!");
      return;
    }

    const currentMemberCount = room.members.length;
    if (currentMemberCount >= 3) {
      alert("Phòng đã đạt tối đa 3 thành viên!");
      return;
    }

    const joinDate = new Date().toISOString();

    try {
      const response = await api.post(`/room/${roomId}/member`, {
        accountId: accountId,
        joinDate: joinDate,
      });

      const updatedMembers = [...room.members, { accountId: accountId, joinDate: joinDate }];
      setRoom((prev) => ({
        ...prev,
        members: updatedMembers,
      }));

      await updateRoomStatus(updatedMembers.length);

      setNewMemberEmail("");
      alert("Thêm thành viên thành công!");
    } catch (error) {
      console.error("Error adding member:", error.response?.data || error.message);
      alert("Không thể thêm thành viên! Vui lòng kiểm tra console để biết chi tiết.");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      if (!room.priceList?.roomPrice || Number(room.priceList.roomPrice) <= 0) {
        alert("Giá phòng phải lớn hơn 0!");
        return;
      }

      // Chỉ gửi các field được phép cập nhật (loại bỏ status và members)
      const updatedRoom = {
        name: room.name,
        floor: room.floor,
        area: room.area,
        priceList: {
          roomPrice: Number(room.priceList.roomPrice),
          deposit: Number(room.priceList.deposit || 0),
        },
        roomBill: room.roomBill,
      };

      console.log("Dữ liệu gửi đi:", updatedRoom);

      const response = await api.put(`/room/${roomId}`, updatedRoom);
      setRoom((prev) => ({
        ...prev,
        ...response.data.room, // Cập nhật lại state với dữ liệu từ server
        priceList: {
          roomPrice: response.data.room.priceList.roomPrice,
          deposit: response.data.room.priceList.deposit || 0,
        },
      }));
      setIsEditing(false);
      alert("Cập nhật phòng thành công!");
    } catch (error) {
      console.error(
        "Error updating room:",
        error.response ? error.response.data : error.message
      );
      alert("Không thể cập nhật phòng! Vui lòng kiểm tra console để biết chi tiết.");
    }
  };

  const getLodgerName = (accountId) => {
    const lodger = lodgers.find((l) => l._id === accountId);
    return lodger ? `${lodger.firstName} ${lodger.lastName}` : "Không tìm thấy";
  };

  const handleCreateInvoice = (roomId) => {
    navigate(`/manager/invoice/new-invoice/${roomId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (!room) return <p>Không tìm thấy thông tin phòng.</p>;

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
            value={room.status ? "Available" : "Full"}
            editable={false}
          />
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput
            label="Giá phòng"
            value={room.priceList?.roomPrice || ""}
            onChange={(val) => handlePriceChange("roomPrice", val)}
            editable={isEditing}
            type="number"
          />
          <RoomInput
            label="Tiền cọc"
            value={room.priceList?.deposit || ""}
            onChange={(val) => handlePriceChange("deposit", val)}
            editable={isEditing}
            type="number"
          />
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
          {room.members.map((member, index) => (
            <RoomInput
              key={index}
              label={`Thành viên ${index + 1}`}
              value={getLodgerName(member.accountId)}
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

      <div className="mt-auto grid grid-cols-3 gap-4">
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
        <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
          Xem báo cáo phòng
        </button>
        <button
          onClick={() => handleCreateInvoice(roomId)}
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
        >
          Tạo hóa đơn phòng
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
                    onClick={() =>
                      navigate(`/manager/invoice-detail/${bill._id}`)
                    }
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
};

const RoomInput = ({ label, value, onChange, editable, type = "text" }) => {
  return (
    <div className="flex justify-between">
      <label className="w-1/4">{label}</label>
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded p-2 w-3/4"
        />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};

export default RoomDetail;