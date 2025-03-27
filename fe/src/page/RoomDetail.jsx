import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RoomDetail = () => {
  // ===== STATE DECLARATIONS =====
  const { roomId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Các state quản lý dữ liệu phòng và UI
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Các state quản lý người thuê và thành viên
  const [lodgers, setLodgers] = useState([]); // Danh sách người thuê trong phòng hiện tại
  const [lodgerNoRoom, setLodgerNoRoom] = useState([]); // Danh sách người thuê chưa có phòng
  const [newMemberEmail, setNewMemberEmail] = useState(""); // Email thành viên mới được chọn

  // Các state quản lý hóa đơn và hợp đồng
  const [bills, setBills] = useState([]);
  const [isBillPopupOpen, setIsBillPopupOpen] = useState(false);
  const [contracts, setContracts] = useState([]);

  // ===== API SETUP =====
  const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // ===== FETCH DATA FUNCTIONS =====

  // Hàm lấy thông tin phòng
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

  // Hàm lấy danh sách người thuê
  const fetchLodgers = async () => {
    try {
      // Lấy tất cả tài khoản người thuê từ API
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
        // Lọc ra người thuê có trong phòng hiện tại
        const lodgersWithRoom = lodgerList.filter(
          (lodger) => lodger?.roomId?.toString() === roomId?.toString()
        );
        setLodgers(lodgersWithRoom);

        // Lọc ra người thuê chưa có phòng nào
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

  // Gọi hàm fetchLodgers khi roomId thay đổi
  useEffect(() => {
    fetchLodgers();
  }, [roomId]);

  // Logging để debug
  console.log("lodgersFilter", lodgers);
  console.log("lodgersNoRoomFilter", lodgerNoRoom);

  // Hàm lấy danh sách hợp đồng
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

  // Hàm lấy danh sách hóa đơn và hiển thị popup
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

  // ===== EVENT HANDLERS =====

  // Cập nhật trạng thái phòng dựa trên số lượng thành viên
  const updateRoomStatus = async (memberCount) => {
    try {
      // Phòng còn trống nếu số lượng thành viên < 5, ngược lại là đầy
      const newStatus = memberCount < 5 ? true : false;
      await api.put(`/room/${roomId}/status`, { status: newStatus });
      setRoom((prev) => ({ ...prev, status: newStatus === true }));
    } catch (error) {
      console.error("Error updating room status:", error);
    }
  };

  // Xử lý thay đổi input thông tin phòng
  const handleInputChange = (field, value) => {
    setRoom((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý thay đổi giá phòng và tiền cọc
  const handlePriceChange = (field, value) => {
    setRoom((prev) => ({
      ...prev,
      priceList: { ...prev.priceList, [field]: value },
    }));
  };

  // ===== MEMBER MANAGEMENT =====

  /**
   * Xử lý thêm thành viên vào phòng
   * Quy trình:
   * 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
   * 2. Thêm thành viên vào phòng
   * 3. Cập nhật roomId trong thông tin tài khoản thành viên
   * 4. Thêm thành viên vào relatedParties của hợp đồng (nếu có)
   * 5. Cập nhật trạng thái phòng và làm mới UI
   */
  const handleAddMember = async () => {
    // Kiểm tra email thành viên đã được chọn chưa
    if (!newMemberEmail) {
      alert("Vui lòng nhập email thành viên!");
      return;
    }

    // Tìm kiếm thành viên trong danh sách người thuê chưa có phòng
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

    // Tìm hợp đồng liên quan đến phòng này
    const roomContract = contracts.find(
      (contract) => contract.roomId._id.toString() === room._id.toString()
    );

    // Nếu có hợp đồng, kiểm tra các điều kiện ràng buộc
    if (roomContract) {
      // Xử lý trường hợp benA và benB là đối tượng chứa thuộc tính _id
      const benAId =
        typeof roomContract.benA === "object"
          ? roomContract.benA._id
          : roomContract.benA;
      const benBId =
        typeof roomContract.benB === "object"
          ? roomContract.benB._id
          : roomContract.benB;

      // Tạo danh sách các thành viên đã có trong hợp đồng
      const contractMembers = [benAId.toString(), benBId.toString()];

      // An toàn thêm các bên liên quan nếu tồn tại
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

      // Kiểm tra thành viên đã có trong hợp đồng chưa
      if (contractMembers.includes(accountId.toString())) {
        alert("Thành viên này đã có trong hợp đồng của phòng!");
        return;
      }

      // Kiểm tra giới hạn relatedParties (tối đa 4 người)
      if (
        roomContract.relatedParties &&
        Array.isArray(roomContract.relatedParties) &&
        roomContract.relatedParties.length >= 4
      ) {
        alert("Số lượng bên liên quan trong hợp đồng đã đạt tối đa 4 người!");
        return;
      }
    }

    // Kiểm tra giới hạn thành viên phòng (tối đa 5 người)
    const currentMemberCount = room.members.length;
    if (currentMemberCount >= 5) {
      alert("Phòng đã đạt tối đa 5 thành viên!");
      return;
    }

    const joinDate = new Date().toISOString();

    try {
      // Bước 1: Thêm thành viên vào phòng
      const roomResponse = await api.post(`/room/${roomId}/member`, {
        accountId: accountId,
        joinDate: joinDate,
      });

      // Cập nhật state local cho thành viên phòng
      const updatedMembers = [
        ...room.members,
        { accountId: accountId, joinDate: joinDate },
      ];

      setRoom((prev) => ({
        ...prev,
        members: updatedMembers,
      }));

      // Bước 2: Cập nhật roomId trong thông tin tài khoản người thuê
      try {
        await api.put(`/account/updateLodgerAccount/${accountId}`, {
          roomId: roomId,
          rentalDate: joinDate,
        });

        console.log(`Updated account ${accountId} with roomId ${roomId}`);
      } catch (accountError) {
        console.error(
          "Error updating account with roomId:",
          accountError.response?.data || accountError.message
        );
        // Tiếp tục thực hiện mặc dù có lỗi, sẽ xử lý rollback nếu cần
      }

      // Bước 3: Nếu có hợp đồng cho phòng này, thêm thành viên vào relatedParties
      if (roomContract) {
        try {
          // Đầu tiên, khởi tạo relatedParties nếu là null
          if (roomContract.relatedParties === null) {
            try {
              // Sử dụng endpoint cập nhật chung
              await api.put(`/contract/${roomContract._id}`, {
                relatedParties: [],
              });

              console.log(
                "Initialized empty relatedParties array for contract"
              );

              // Cập nhật state contract local
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

              // Cập nhật roomContract trong scope hiện tại
              roomContract.relatedParties = [];
            } catch (initError) {
              console.error("Error initializing relatedParties:", initError);
              // Vẫn tiếp tục thử thêm thành viên
            }
          }

          // Log dữ liệu gửi đi để debug
          console.log("Contract ID:", roomContract._id);
          console.log("Account ID to add:", accountId);
          console.log("Account ID type:", typeof accountId);

          // Đảm bảo accountId là chuỗi hợp lệ cho ObjectId
          const accountIdString = accountId.toString();

          // Kiểm tra định dạng ObjectId trước khi gửi đến API
          if (!/^[0-9a-fA-F]{24}$/.test(accountIdString)) {
            console.error(
              "Invalid ObjectId format for accountId:",
              accountIdString
            );
            throw new Error("Invalid accountId format");
          }

          // Thêm thành viên vào relatedParties của hợp đồng với ID đã xác thực
          const response = await api.put(
            `/contract/${roomContract._id}/related-parties`,
            {
              accountId: accountIdString,
            }
          );

          console.log("Contract update response:", response.data);

          // Cập nhật state contract local khi API call thành công
          setContracts((prevContracts) =>
            prevContracts.map((contract) => {
              if (contract._id === roomContract._id) {
                // Sử dụng phiên bản an toàn của relatedParties
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

          // Tiếp tục thực hiện mặc dù việc cập nhật hợp đồng thất bại
          // Thành viên vẫn được thêm vào phòng, đây là hoạt động chính
        }
      }

      // Bước 4: Cập nhật trạng thái phòng dựa trên số lượng

      await updateRoomStatus(updatedMembers.length);

      // Bước 5: Reset input và thông báo thành công
      setNewMemberEmail("");

      // Bước 6: Làm mới danh sách người thuê để cập nhật UI
      fetchLodgers();

      alert("Thêm thành viên thành công!");
    } catch (error) {
      console.error(
        "Error adding member:",
        error.response?.data || error.message
      );

      // Thử rollback các thay đổi nếu việc cập nhật phòng thành công nhưng các bước sau thất bại
      try {
        // Chỉ thử rollback nếu cập nhật phòng thành công
        if (error.response?.status !== 400 && error.response?.status !== 404) {
          console.log("Attempting to rollback changes...");
          // Rollback có thể gồm việc xóa thành viên khỏi phòng
          // Cần một endpoint mới hoặc xử lý server-side
        }
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }

      alert(
        "Không thể thêm thành viên! Vui lòng kiểm tra console để biết chi tiết."
      );
    }
  };

  /**
   * Xử lý xóa thành viên khỏi phòng
   */

  const handleRemoveMember = async (accountId) => {
    // Hiển thị dialog xác nhận
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi phòng?")
    ) {
      return;
    }

    try {
      // Step 1: Remove member from room
      await api.delete(`/room/${roomId}/member/${accountId}`);

      // Update local room state
      setRoom((prev) => ({
        ...prev,
        members: prev.members.filter(
          (member) => member.accountId !== accountId
        ),
      }));

      // Step 2: Update account by setting roomId to null
      try {
        await api.put(`/account/updateLodgerAccount/${accountId}`, {
          roomId: null,
          // Reset rental date or set as needed
        });
        console.log(
          `Updated account ${accountId} by removing roomId assignment`
        );
      } catch (accountError) {
        console.error(
          "Error updating account roomId:",
          accountError.response?.data || accountError.message
        );
      }

      // Step 3: If there's a contract for this room, remove member from relatedParties
      const roomContract = contracts.find(
        (contract) => contract.roomId._id.toString() === room._id.toString()
      );

      if (
        roomContract &&
        roomContract.relatedParties &&
        Array.isArray(roomContract.relatedParties)
      ) {
        try {
          // Remove member from contract relatedParties
          await api.delete(
            `/contract/${roomContract._id}/related-parties/${accountId}`
          );

          // Update local contract state
          setContracts((prevContracts) =>
            prevContracts.map((contract) => {
              if (contract._id === roomContract._id) {
                return {
                  ...contract,
                  relatedParties: contract.relatedParties.filter(
                    (id) => id.toString() !== accountId.toString()
                  ),
                };
              }
              return contract;
            })
          );

          console.log(
            `Removed account ${accountId} from contract ${roomContract._id} related parties`
          );
        } catch (contractError) {
          console.error(
            "Error removing member from contract relatedParties:",
            contractError.response?.data || contractError.message
          );
        }
      }

      // Step 4: Update room status based on new member count
      const updatedMembers = room.members.filter(
        (member) => member.accountId !== accountId
      );
      await updateRoomStatus(updatedMembers.length);

      // Step 5: Refresh lodger lists to update UI
      fetchLodgers();

      alert("Xóa thành viên thành công!");
    } catch (error) {
      console.error(
        "Error removing member:",
        error.response?.data || error.message
      );
      alert(
        "Không thể xóa thành viên! Vui lòng kiểm tra console để biết chi tiết."
      );
    }
  };

  /**
   * Xử lý cập nhật thông tin phòng
   * - Kiểm tra tính hợp lệ của giá phòng
   * - Gửi thông tin cập nhật đến API
   * - Cập nhật state local với dữ liệu từ server
   */
  const handleUpdateRoom = async () => {
    try {
      // Validation dữ liệu nhập vào - Kiểm tra tên phòng
      if (!room.name || room.name.trim() === "") {
        alert("Tên phòng không được để trống!");
        return;
      }

      // Validation giá phòng - Đảm bảo là số dương
      const roomPrice = Number(room.priceList?.roomPrice);
      if (isNaN(roomPrice) || roomPrice <= 0) {
        alert("Giá phòng phải là số dương!");
        return;
      }

      // Validation tiền cọc - Đảm bảo là số không âm
      const deposit = Number(room.priceList?.deposit || 0);
      if (isNaN(deposit) || deposit < 0) {
        alert("Tiền cọc phải là số không âm!");
        return;
      }

      // Chuẩn bị dữ liệu cập nhật - Chỉ gửi những trường được phép thay đổi
      // Ở đây thiếu dấu đóng ngoặc } cho object updatedRoom
      const updatedRoom = {
        name: room.name.trim(),
        priceList: {
          roomPrice: roomPrice,
          deposit: deposit,
        },
      }; // Thêm dấu đóng ngoặc và dấu chấm phẩy tại đây

      console.log("Sending room update:", updatedRoom);

      // Gửi request cập nhật đến API
      const response = await api.put(`/room/${roomId}`, updatedRoom);

      // Validate kết quả trả về từ API
      if (!response.data || !response.data.room) {
        throw new Error("Invalid response from server");
      }

      // Cập nhật state local từ dữ liệu server trả về
      setRoom((prev) => ({
        ...prev,
        name: response.data.room.name,
        priceList: {
          roomPrice: response.data.room.priceList?.roomPrice || 0,
          deposit: response.data.room.priceList?.deposit || 0,
        },
        // Giữ lại các trường khác không được cập nhật
      }));

      // Thoát khỏi chế độ chỉnh sửa và hiển thị thông báo thành công
      setIsEditing(false);
      alert("Cập nhật phòng thành công!");
    } catch (error) {
      // Xử lý lỗi nâng cao với logging chi tiết
      console.error("Room update failed:", error);

      // Trích xuất thông điệp lỗi từ response API hoặc message lỗi
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";

      // Log thông tin chi tiết về lỗi để debug
      console.error("Error details:", {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data,
      });

      // Hiển thị thông báo lỗi cho người dùng
      alert(`Không thể cập nhật phòng: ${errorMessage}`);
    }
  };
  /**
   * Lấy tên người thuê từ ID tài khoản
   */
  const getLodgerName = (accountId) => {
    const lodger = lodgers.find((l) => l._id === accountId);
    return lodger ? `${lodger.firstName} ${lodger.lastName}` : "Không tìm thấy";
  };

  /**
   * Chuyển hướng đến trang tạo hóa đơn cho phòng
   */
  const handleCreateInvoice = (roomId) => {
    navigate(`/manager/invoice/new-invoice/${roomId}`);
  };

  // ===== RENDERING LOGIC =====

  // Hiển thị trạng thái loading khi đang tải dữ liệu
  if (loading) return <p>Loading...</p>;

  // Hiển thị thông báo lỗi nếu không tìm thấy thông tin phòng
  if (!room) return <p>Không tìm thấy thông tin phòng.</p>;

  // UI chính của trang chi tiết phòng
  return (
    <div className="container mx-auto p-4 flex flex-col min-h-screen">
      {/* Nút quay lại */}
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

      {/* Phần thông tin tổng quát về phòng */}
      {/* Phần thông tin tổng quát về phòng */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tổng quát</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput
            label="Tên phòng"
            value={room.name}
            onChange={(val) => handleInputChange("name", val)}
            editable={isEditing}
            required={true}
          />
          <RoomInput
            label="Tầng nhà"
            value={room.floor}
            onChange={(val) => handleInputChange("floor", val)}
            editable={false}
          />
          <RoomInput
            label="Diện tích"
            value={`${room.area} m²`}
            onChange={(val) => handleInputChange("area", val)}
            editable={false}
          />
          <RoomInput
            label="Trạng thái"
            value={room.status ? "Còn trống" : "Đã đầy"}
            editable={false}
          />
        </div>
      </div>

      {/* Phần thông tin tài chính */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin tài chính</h2>
        <div className="flex flex-col space-y-4">
          <RoomInput
            label="Giá phòng"
            value={room.priceList?.roomPrice || ""}
            onChange={(val) => handlePriceChange("roomPrice", val)}
            editable={isEditing}
            type="number"
            min="1"
            required={true}
            suffix="VND"
          />
          <RoomInput
            label="Tiền cọc"
            value={room.priceList?.deposit || ""}
            onChange={(val) => handlePriceChange("deposit", val)}
            editable={isEditing}
            type="number"
            min="0"
            suffix="VND"
          />
        </div>
      </div>

      {/* Phần thông tin thành viên */}
      <div className="bg-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thành viên</h2>
        <div className="flex flex-col space-y-4">
          {/* Danh sách thành viên hiện tại với nút xóa */}
          {lodgers.map((member, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-grow">
                <RoomInput
                  label={`Thành viên ${index + 1}`}
                  value={`${member.lastName} ${member.firstName}`}
                  editable={false}
                />
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="ml-4 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}

          {/* UI thêm thành viên mới */}
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

      {/* Các nút tác vụ chính */}
      <div className="mt-auto grid grid-cols-3 gap-4">
        {/* Nút lưu/chỉnh sửa phòng */}
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

        {/* Nút xem hóa đơn phòng */}
        <button
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
          onClick={fetchBills}
        >
          Xem hóa đơn phòng
        </button>

        {/* Nút xem báo cáo phòng */}
        <button className="bg-green-500 text-white px-6 py-3 rounded w-full">
          Xem báo cáo phòng
        </button>

        {/* Nút tạo hóa đơn phòng */}
        <button
          onClick={() => handleCreateInvoice(roomId)}
          className="bg-green-500 text-white px-6 py-3 rounded w-full"
        >
          Tạo hóa đơn phòng
        </button>
      </div>

      {/* Popup hiển thị danh sách hóa đơn */}
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

/**
 * Component hiển thị một trường input hoặc text tùy thuộc vào trạng thái có thể chỉnh sửa
 */
const RoomInput = ({
  label,
  value,
  onChange,
  editable,
  type = "text",
  required = false,
  min,
  suffix,
}) => {
  return (
    <div className="flex justify-between items-center">
      <label className="w-1/4 font-medium">{label}</label>
      {editable ? (
        <div className="w-3/4 flex items-center">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded p-2 flex-grow"
            required={required}
            min={min}
          />
          {suffix && <span className="ml-2">{suffix}</span>}
        </div>
      ) : (
        <span>
          {value}
          {suffix && ` ${suffix}`}
        </span>
      )}
    </div>
  );
};

export default RoomDetail;
