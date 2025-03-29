// Room.Service.js
import DefaultUtilities from "../model/DefaultUtilities.js";
import Room from "../model/Room.js";
import Bill from "../model/Bills.js";
import House from "../model/House.js";
import mongoose from "mongoose";
import Account from "../model/Account.js";
import Contract from "../model/Contract.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import {
  generateTransactionId,
  generateVietQR,
} from "../service/BillService.js";

export const getAllRoom = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const ViewListUtilities = async (req, res) => {
  try {
    const { roomId } = req.params;

    const utilities = await Room.findById(roomId)
      .populate("utilities")
      .sort({ name: 1 });

    if (!utilities || utilities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No utilities found for this room",
      });
    }

    return res.status(200).json({
      success: true,
      data: utilities.utilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching utilities",
      error: error.message,
    });
  }
};

export const AddNewUtilities = async (req, res) => {
  try {
    const { name, roomId, status } = req.body;

    // Basic validation
    if (!name || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Name and roomId are required",
      });
    }

    // Create a new utility
    const newUtility = new DefaultUtilities({
      name,
      roomId,
      status: status || "active",
    });

    const savedUtility = await newUtility.save();

    // Update the room by adding the new utility's ID
    await Room.findByIdAndUpdate(roomId, {
      $push: { utilities: savedUtility._id },
    });

    return res.status(201).json({
      success: true,
      message: "Utility added successfully and linked to the room",
      data: savedUtility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding utility",
      error: error.message,
    });
  }
};

export const UpdateUtilities = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // Check if utility exists
    const utility = await DefaultUtilities.findById(id);
    if (!utility) {
      return res.status(404).json({
        success: false,
        message: "Utility not found",
      });
    }

    // Update fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (status) updatedData.status = status;

    const updatedUtility = await DefaultUtilities.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Utility updated successfully",
      data: updatedUtility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating utility",
      error: error.message,
    });
  }
};

export const ChangeUtilitiesStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    // Check if utility exists
    const utility = await DefaultUtilities.findById(id);
    if (!utility) {
      return res.status(404).json({
        success: false,
        message: "Utility not found",
      });
    }

    const updatedUtility = await DefaultUtilities.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Utility status changed to ${status}`,
      data: updatedUtility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error changing utility status",
      error: error.message,
    });
  }
};

export const DeleteUtilities = async (req, res) => {
  try {
    const { roomId, utilityId } = req.params;
    if (![roomId, utilityId].every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { utilities: utilityId } },
      { new: true }
    );

    if (!updatedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const deletedUtility = await DefaultUtilities.findByIdAndDelete(utilityId);
    return res.status(200).json({
      success: true,
      message: "Utility deleted successfully",
      deletedFromRoom: updatedRoom,
      deletedFromDefaultUtilities: !!deletedUtility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error delete utilities",
      error: error.message,
    });
  }
};

export const changeRoom = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    let { newRoomId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res
        .status(400)
        .json({ success: false, message: "accountId không hợp lệ!" });
    }

    const account = await Account.findById(accountId);
    if (!account || account.accountType !== "Lodger") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Chỉ Lodger mới có thể chuyển phòng!",
        });
    }

    const oldRoomId = account.roomId;
    if (!oldRoomId) {
      return res
        .status(400)
        .json({ success: false, message: "Tài khoản không thuộc phòng nào!" });
    }

    const oldRoom = await Room.findById(oldRoomId).populate("house");
    if (
      !oldRoom ||
      !oldRoom.members.some(
        (member) => member.accountId.toString() === accountId
      )
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Bạn không thuộc phòng cũ!" });
    }

    // Kiểm tra nợ hóa đơn
    const unpaidBills = await Bill.find({ roomId: oldRoomId, isPaid: false });
    if (unpaidBills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phòng cũ còn nợ hóa đơn chưa thanh toán!",
        unpaidBills,
      });
    }

    // Tìm phòng trống nếu không cung cấp newRoomId
    if (!newRoomId) {
      const availableRoom = await Room.findOne({
        house: oldRoom.house,
        status: "available",
        deleted: false,
      });
      if (!availableRoom) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy phòng trống trong nhà này!",
          });
      }
      newRoomId = availableRoom._id;
    }

    const newRoom = await Room.findById(newRoomId).populate("house");
    if (!newRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng mới!" });
    }
    if (newRoom.status === "full") {
      return res
        .status(400)
        .json({ success: false, message: "Phòng mới đã đầy!" });
    }

    // 1. Cập nhật roomId trong tài khoản
    account.roomId = newRoomId;
    account.rentalDate = new Date();
    await account.save();

    // 2. Xử lý phòng cũ
    oldRoom.members = oldRoom.members.filter(
      (member) => member.accountId.toString() !== accountId
    );
    if (oldRoom.members.length === 0) {
      oldRoom.status = "available";
    }
    await oldRoom.save();

    if (account.isContact) {
      account.isContact = false;
      await account.save();
      if (oldRoom.members.length > 0) {
        const newContact = await Account.findOne({
          roomId: oldRoomId,
          _id: { $ne: accountId },
        });
        if (newContact) {
          newContact.isContact = true;
          await newContact.save();
        }
      }
    }

    // 3. Thêm vào phòng mới
    newRoom.members.push({ accountId, joinDate: new Date() });
    if (newRoom.members.length >= 3) {
      newRoom.status = "full";
    }
    await newRoom.save();

    // 4. Tạo hóa đơn mới
    const transactionId = generateTransactionId();
    const billCode = `BILL-${newRoomId}-${Date.now()}-${transactionId}`;
    const totalAmount = newRoom.priceList.roomPrice;
    const { qrUrl } = generateVietQR(
      totalAmount,
      `Thanh toán tiền phòng ${newRoom.house.name} - ${newRoom.name}`
    );

    const bill = new Bill({
      roomId: newRoomId,
      houseId: newRoom.house._id,
      billCode,
      roomPrice: newRoom.priceList.roomPrice,
      priceList: [],
      debt: 0,
      total: totalAmount,
      note: "Hóa đơn khởi tạo khi chuyển phòng",
      paymentLink: qrUrl,
      transactionId,
      isPaid: false,
      paymentMethod: "Unknown",
    });
    await bill.save();

    // 5. Tạo hợp đồng mới
    const manager = await Account.findOne({ accountType: "Manager" });
    const contactAccount =
      (await Account.findOne({ roomId: newRoomId, isContact: true })) ||
      (await Account.findOneAndUpdate(
        { roomId: newRoomId, accountType: "Lodger" },
        { isContact: true },
        { new: true }
      )); // Nếu chưa có người đại diện, chọn một Lodger bất kỳ
    const otherMembers = newRoom.members
      .filter(
        (member) =>
          member.accountId.toString() !== contactAccount._id.toString()
      )
      .map((member) => member.accountId);

    const contract = new Contract({
      roomId: newRoomId,
      benA: manager._id,
      benB: contactAccount._id, // Người đại diện
      relatedParties: otherMembers, // Các thành viên còn lại
      description: "Hợp đồng mới sau khi chuyển phòng",
      startDate: Date.now(),
      endDate: oneYearFromNow(),
    });
    await contract.save();

    // 6. Gửi thông báo
    await Notification.create([
      {
        sender: accountId,
        recipients: [{ user: manager._id, isRead: false }],
        message: `${account.firstName} ${account.lastName} đã chuyển từ phòng ${oldRoom.name} sang phòng ${newRoom.name}.`,
        type: "room_change",
      },
      {
        sender: manager._id,
        recipients: [{ user: contactAccount._id, isRead: false }],
        message: `Phòng ${newRoom.name} có hóa đơn mới: ${billCode} và hợp đồng mới: ${contract._id}.`,
        type: "bill",
        link: `/bills/${bill._id}`,
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Chuyển phòng thành công!",
      data: {
        account,
        oldRoom: oldRoom.name,
        newRoom: newRoom.name,
        bill,
        contract,
      },
    });
  } catch (error) {
    console.error("Lỗi trong changeRoom:", error);
    next(error);
  }
};

export const getRoomEquipment = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    const room = await Room.findById(roomId).populate("utilities");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      roomId: room._id,
      name: room.name,
      equipment: room.utilities || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addRoom = async (req, res, next) => {
  try {
    const { house, name, floor, roomPrice, deposit, area, status } = req.body;

    if (!house || !name || !roomPrice || !area || !floor) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền các trường có dấu sao đỏ",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(house)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid houseId" });
    }

    const houses = await House.findById(house);
    if (!houses) {
      return res
        .status(404)
        .json({ success: false, message: "House không tồn tại!" });
    }

    const existingRoom = await Room.findOne({ house: house, name });
    if (existingRoom) {
      return res
        .status(400)
        .json({ success: false, message: `Phòng '${name}' đã tồn tại.` });
    }
    const newRoom = await Room.create({
      name,
      house: house,
      floor: floor,
      area,
      priceList: {
        roomPrice,
        deposit: deposit || 0,
      },
      status: status,
      utilities: houses.utilities || [],
      deleted: false,
      deletedAt: null,
    });

    houses.numberOfRoom += 1;
    await houses.save();

    return res.status(201).json({
      success: true,
      message: "Tạo phòng thành công!",
      data: newRoom,
    });
  } catch (error) {
    next(error);
  }
};

export const GetOne = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Kiểm tra roomId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid roomId" });
    }

    const room = await Room.findById(roomId)
      .populate("house")
      .populate("members.accountId");

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const currentMember = room.members ? room.members.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        currentMember,
        ...room._doc,
      },
    });
  } catch (error) {
    console.error("Error fetching room details:", error);
    next(error);
  }
};

export const getRoomServices = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }
    // Lấy thông tin phòng
    const room = await Room.findById(roomId).populate("utilities");

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng!" });
    }

    // Lấy hóa đơn mới nhất của phòng
    const latestBill = await Bill.findOne({ roomId })
      .sort({ createdAt: -1 }) // Lấy hóa đơn mới nhất
      .limit(1);

    // Tạo danh sách phí dịch vụ
    const services = [
      { name: "Tiền thuê phòng", price: room.priceList.roomPrice },
      ...(room.utilities || []).map((utility) => ({
        name: utility.name,
        price: utility.price || 0,
      })),
    ];

    // Nếu có hóa đơn mới nhất, lấy tổng số tiền cần thanh toán
    const totalAmount = latestBill
      ? latestBill.total
      : room.priceList.roomPrice;

    res.json({
      room: room.name,
      services,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { accountId, joinDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "Invalid accountId" });
    }

    if (!joinDate || isNaN(new Date(joinDate))) {
      return res.status(400).json({ message: "Invalid joinDate" });
    }
    const room = await Room.findById(roomId);

    if (!room) {
      throw new Error("Không tìm thấy phòng.");
    }

    //  Bỏ qua xử lý hình ảnh
    room.members.push({ accountId, joinDate: new Date(joinDate) });
    await room.save();

    const newMember = room.members[room.members.length - 1];
    return res.status(201).json({
      success: true,
      message: "Thêm thành viên thành công",
      member: newMember,
    });
  } catch (error) {
    throw error;
  }
};

export const ChangeRoomStatus = async (req, res) => {
  const { newStatus } = req.body;

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      error: `Invalid status value. Allowed values: ${validStatuses.join(
        ", "
      )}`,
    });
  }

  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: "Invalid roomId" });
  }
  const updatedRoom = await Room.findByIdAndUpdate(
    roomId,
    { status: newStatus },
    { new: true }
  );

  if (!updatedRoom) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.status(200).json({
    message: "Room status updated successfully",
    room: updatedRoom,
  });
};

export const updateRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updateData = req.body;

    // Allowed fields for updating
    const allowedFields = [
      "floor",
      "name",
      "status",
      "area",
      "utilities",
      "priceList",
      "roomBill",
      "roomReport",
      "deleted",
      "members",
    ];

    // Validate if the provided keys are allowed
    const updateKeys = Object.keys(updateData);
    const isValidUpdate = updateKeys.every((key) =>
      allowedFields.includes(key)
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ error: `Invalid update fields: ${updateKeys.join(", ")}` });
    }

    if (
      updateData.status &&
      !["full", "available"].includes(updateData.status)
    ) {
      return res.status(400).json({
        error: "Invalid status value. Allowed values: full, available",
      });
    }

    // Validate status if it's being updated
    if (updateData.members) {
      updateData.members.forEach((member) => {
        if (!member.accountId || !member.joinDate) {
          throw new Error("Members must include accountId and joinDate");
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    // Update the room details
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
    });
    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json({
      message: "Room details updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const GetRoomByHouseId = async (req, res) => {
  try {
    const { houseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return res.status(400).json({
        message: "Invalid HouseId",
      });
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({
        message: "House not found with the provided houseId",
      });
    }

    const rooms = await Room.find({ house: houseId }).populate(
      "house members.accountId utilities roomBill roomReport"
    );
    console.log(`Rooms found for houseId ${houseId}:`, rooms);
    return res.status(200).json({
      message: "Here your Room",
      rooms,
    });
  } catch (error) {
    console.error("Error in GetRoomByHouseId:", error); // Log for debugging
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
export const GetRoomByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;
    console.log(managerId);
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({
        message: "Invalid managerId",
      });
    }

    const house = await House.find({ hostId: managerId });
    console.log(house);
    if (!house) {
      return res.status(404).json({
        message: "House not found with the provided managerID",
      });
    }

    const rooms = await Room.find({ houseId: house.hostId }).populate(
      "house members.accountId utilities roomBill roomReport"
    );
    return res.status(200).json({
      message: "Here your Room",
      rooms,
    });
  } catch (error) {
    console.error("Error in GetRoomByHouseId:", error); // Log for debugging
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const GetMemberLodgerOfHouse = async (req, res) => {
  try {
    const { houseId } = req.params;

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "Không tìm thấy nhà trọ" });
    }
    //Lấy danh sách phòng thuộc houseId
    const rooms = await Room.find({ house: houseId, deleted: false }).populate({
      path: "members.accountId",
      match: { accountType: "Lodger" },
      select: "firstName lastName email phone gender",
    });

    const lodgers = rooms
      .flatMap((room) => room.members)
      .map((member) => member.accountId)
      .filter((account) => account !== null);

    //Tìm danh sách tài khoản có accoutType = Lodger
    if (lodgers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No lodgers found for this house",
        members: [],
      });
    }

    return res.status(200).json({ success: true, members: lodgers });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const GetMemberManagerOfHouse = async (req, res) => {
  try {
    const { houseId } = req.params;

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "Không tìm thấy nhà trọ" });
    }
    //Lấy danh sách phòng thuộc houseId
    const rooms = await Room.find({ house: houseId, deleted: false }).populate({
      path: "members.accountId",
      match: { accountType: "Manager" },
      select: "firstName lastName email phone gender",
    });

    const lodgers = rooms
      .flatMap((room) => room.members)
      .map((member) => member.accountId)
      .filter((account) => account !== null);

    //Tìm danh sách tài khoản có accoutType = Lodger
    if (lodgers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No manager found for this house",
        members: [],
      });
    }

    return res.status(200).json({ success: true, members: lodgers });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { roomId, accountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "Invalid accountId" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }

    // Check if member exists in room
    const memberIndex = room.members.findIndex(
      (member) => member.accountId.toString() === accountId
    );

    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ message: "Thành viên không tồn tại trong phòng." });
    }

    // Remove member from room
    room.members.splice(memberIndex, 1);
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Xóa thành viên thành công",
      room,
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
