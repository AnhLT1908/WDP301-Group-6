import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lodgers, setLodgers] = useState([]);
  const [lodgerNoRoom, setLodgerNoRoom] = useState([]);
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
        console.log("Room data", roomData);
        setRoom(roomData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoom();
  }, [roomId]);

  const fetchLodgers = async () => {
    try {
      // Fetch all lodger accounts from the API
      const res = await api.get("/account/lodger-account-list");
      console.log("Lodger data:", res.data);

      if (!res.data.data || !Array.isArray(res.data.data)) {
        console.error("Invalid data format from API");
        return;
      }

      const lodgerList = res.data.data;
      console.log("Lodger list:", lodgerList);
      console.log("Current roomId for filtering:", roomId);

      if (lodgerList.length > 0) {
        // Find lodgers in this room
        const lodgersWithRoom = lodgerList.filter(
          (lodger) => lodger?.roomId?.toString() === roomId?.toString()
        );
        setLodgers(lodgersWithRoom);

        // Find lodgers without a room assignment
        const lodgersWithNoRoom = lodgerList.filter(
          (lodger) =>
            lodger.accountType === "Lodger" &&
            (lodger.roomId === null || lodger.roomId === undefined)
        );
        console.log("Lodgers with no room:", lodgersWithNoRoom);
        setLodgerNoRoom(lodgersWithNoRoom);
      }
    } catch (error) {
      console.error("Error fetching lodger data:", error);
    }
  };

  useEffect(() => {
    fetchLodgers();
  }, [roomId]);

  console.log("lodgersFilter", lodgers);
  console.log("lodgersNoRoomFilter", lodgerNoRoom);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get(`/contract/room/${roomId}`);
        console.log("Contract", res.data);
        setContracts(res.data.data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };
    fetchContracts();
  }, [roomId]);

  console.log("Room contract", contracts);

  const fetchBills = async () => {
    try {
      const res = await api.get(`bill/roomBill/${roomId}`);
      console.log("Bill room", res.data.data);
      setBills(res.data.data);
      setIsBillPopupOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const updateRoomStatus = async (memberCount) => {
    try {
      const newStatus = memberCount < 5 ? true : false;
      await api.put(`/room/${roomId}/status`, { status: newStatus });
      setRoom((prev) => ({ ...prev, status: newStatus === true }));
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

    const member = lodgerNoRoom.find(
      (lodger) => lodger.email === newMemberEmail
    );
    if (!member) {
      alert(
        "Không tìm thấy thành viên với email này hoặc thành viên đã có phòng!"
      );
      return;
    }

    const accountId = member._id;
    console.log("+++++++Checkcontract", contracts);
    console.log("+++++++Checkroom", room);

    // Get the contract for this room
    const roomContract = contracts.find(
      (contract) => contract.roomId._id.toString() === room._id.toString()
    );

    console.log("============roomContract", roomContract);

    // Check if member exists in any contract roles
    if (roomContract) {
      // Handle the case where benA and benB are objects with _id properties
      const benAId =
        typeof roomContract.benA === "object"
          ? roomContract.benA._id
          : roomContract.benA;
      const benBId =
        typeof roomContract.benB === "object"
          ? roomContract.benB._id
          : roomContract.benB;

      const contractMembers = [benAId.toString(), benBId.toString()];

      // Safely add relatedParties if they exist
      if (
        roomContract.relatedParties &&
        Array.isArray(roomContract.relatedParties)
      ) {
        contractMembers.push(
          ...roomContract.relatedParties.map((party) =>
            typeof party === "object" ? party._id.toString() : party.toString()
          )
        );
      }

      if (contractMembers.includes(accountId.toString())) {
        alert(
          "Thành viên này đã có trong hợp đồng của phòng (benA, benB hoặc relatedParties)!"
        );
        return;
      }

      // Check relatedParties limit (4 people maximum) - only if relatedParties exists
      if (
        roomContract.relatedParties &&
        Array.isArray(roomContract.relatedParties) &&
        roomContract.relatedParties.length >= 4
      ) {
        alert("Số lượng bên liên quan trong hợp đồng đã đạt tối đa 4 người!");
        return;
      }
    }

    // Check room members limit (5 people maximum)
    const currentMemberCount = room.members.length;
    if (currentMemberCount >= 5) {
      alert("Phòng đã đạt tối đa 5 thành viên!");
      return;
    }

    const joinDate = new Date().toISOString();

    try {
      // Step 1: Add member to the room
      const roomResponse = await api.post(`/room/${roomId}/member`, {
        accountId: accountId,
        joinDate: joinDate,
      });

      // Update local state for room members
      const updatedMembers = [
        ...room.members,
        { accountId: accountId, joinDate: joinDate },
      ];

      setRoom((prev) => ({
        ...prev,
        members: updatedMembers,
      }));

      // Step 2: Update the account with the roomId
      try {
        await api.put(`/account/updateLodgerAccount/${accountId}`, {
          roomId: roomId,
          rentalDate: joinDate,
          // Only update necessary fields to avoid overwriting other account data
        });

        console.log(`Updated account ${accountId} with roomId ${roomId}`);
      } catch (accountError) {
        console.error(
          "Error updating account with roomId:",
          accountError.response?.data || accountError.message
        );
        // Continue execution as we may need to rollback later if subsequent steps fail
      }

      // Step 3: If there's a contract for this room, add the member to relatedParties
      if (roomContract) {
        try {
          // First, ensure relatedParties is initialized if null
          if (roomContract.relatedParties === null) {
            try {
              // Use a general update endpoint instead
              await api.put(`/contract/${roomContract._id}`, {
                relatedParties: [],
              });

              console.log(
                "Initialized empty relatedParties array for contract"
              );

              // Update local contract state
              setContracts((prevContracts) =>
                prevContracts.map((contract) => {
                  if (contract._id === roomContract._id) {
                    return {
                      ...contract,
                      relatedParties: [],
                    };
                  }
                  return contract;
                })
              );

              // Update roomContract in local scope
              roomContract.relatedParties = [];
            } catch (initError) {
              console.error("Error initializing relatedParties:", initError);
              // Continue with the attempt to add the member anyway
            }
          }

          // Log the exact data we're sending to debug
          console.log("Contract ID:", roomContract._id);
          console.log("Account ID to add:", accountId);
          console.log("Account ID type:", typeof accountId);

          // Ensure accountId is a valid string format for ObjectId
          const accountIdString = accountId.toString();

          // Validate ObjectId format before sending to API
          if (!/^[0-9a-fA-F]{24}$/.test(accountIdString)) {
            console.error(
              "Invalid ObjectId format for accountId:",
              accountIdString
            );
            throw new Error("Invalid accountId format");
          }

          // Now add member to contract relatedParties with validated ID
          const response = await api.put(
            `/contract/${roomContract._id}/related-parties`,
            {
              accountId: accountIdString,
            }
          );

          console.log("Contract update response:", response.data);

          // Update local contract state only if API call succeeds
          setContracts((prevContracts) =>
            prevContracts.map((contract) => {
              if (contract._id === roomContract._id) {
                // Use the safe version of relatedParties
                const currentRelatedParties = contract.relatedParties || [];
                return {
                  ...contract,
                  relatedParties: [...currentRelatedParties, accountIdString],
                };
              }
              return contract;
            })
          );

          console.log(
            `Added account ${accountIdString} to contract ${roomContract._id} related parties`
          );
        } catch (contractError) {
          console.error(
            "Error adding member to contract relatedParties:",
            contractError.response?.data || contractError.message
          );

          // Continue execution despite contract update failure
          // The member is still added to the room, which is the primary operation
        }
      }

      // Step 4: Update room status based on member count
      await updateRoomStatus(updatedMembers.length);

      // Step 5: Reset input and notify success
      setNewMemberEmail("");

      // Step 6: Refresh lodger lists to update UI
      fetchLodgers();

      alert("Thêm thành viên thành công!");
    } catch (error) {
      console.error(
        "Error adding member:",
        error.response?.data || error.message
      );

      // Attempt to rollback changes if the initial room update succeeds but subsequent updates fail
      try {
        // Only attempt rollback if the room update succeeded
        if (error.response?.status !== 400 && error.response?.status !== 404) {
          console.log("Attempting to rollback changes...");
          // Rollback could involve removing the member from the room
          // This would need a new endpoint or could be handled server-side
        }
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }

      alert(
        "Không thể thêm thành viên! Vui lòng kiểm tra console để biết chi tiết."
      );
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
      alert(
        "Không thể cập nhật phòng! Vui lòng kiểm tra console để biết chi tiết."
      );
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
            value={room.area + "m2"}
            onChange={(val) => handleInputChange("area", val)}
            editable={isEditing}
          />
          <RoomInput
            label="Trạng thái"
            value={room.status ? "Còn trống" : "Đã đầy"}
            editable={false}
          />
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput
            label="Giá phòng"
            value={
              room.priceList?.roomPrice?.toLocaleString("vn-VN") + " VND" || ""
            }
            onChange={(val) => handlePriceChange("roomPrice", val)}
            editable={isEditing}
            type="number"
          />
          <RoomInput
            label="Tiền cọc"
            value={
              room.priceList?.deposit?.toLocaleString("vn-VN") + " VND" || ""
            }
            onChange={(val) => handlePriceChange("deposit", val)}
            editable={isEditing}
            type="number"
          />
        </div>
      </div>

      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thành viên</h2>
        <div className="flex flex-col space-y-4">
          {lodgers.map((member, index) => (
            <RoomInput
              key={index}
              label={`Thành viên ${index + 1}`}
              value={`${member.lastName} ${member.firstName}`}
              editable={false}
            />
          ))}
          {isEditing && (
            <>
              <div className="flex flex-col space-y-4">
                <label>Chọn thành viên mới:</label>
                <select
                  className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                >
                  <option value="">-- Chọn thành viên --</option>
                  {lodgerNoRoom.map((lodger, index) => (
                    <option key={lodger._id} value={lodger.email}>
                      {`${lodger.lastName} ${lodger.firstName} (${lodger.email})`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddMember}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Thêm thành viên
                </button>
              </div>
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
