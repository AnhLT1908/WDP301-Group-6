// Room.Service.js
import DefaultUtilities from "../model/DefaultUtilities.js";
import Room from "../model/Room.js";
import Bill from "../model/Bills.js";
import House from "../model/House.js";
import mongoose from 'mongoose';


export const getAllRoom = async(req, res, next)=>{
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

console.log(ViewListUtilities);


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

export const getRoomEquipment = async (req, res) => {
    try {
        const { roomId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          return res.status(400).json({ message: "Invalid roomId" });
        }

        const room = await Room.findById(roomId)
            .populate("utilities");
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
      const { houseId, name, floor, status, roomType, roomPrice, deposit, area } = req.body;

      if (!houseId || !name || !roomPrice || !area || !floor) {
          return res.status(400).json({
              success: false,
              message: "Thiếu thông tin bắt buộc! (houseId, name, roomPrice, quantityMember, area, email)",
          });
      }

      if (!mongoose.Types.ObjectId.isValid(houseId)) {
        return res.status(400).json({ success: false, message: "Invalid houseId" });
      }
      
      const house = await House.findById(houseId);      
      if (!house) {
          return res.status(404).json({ success: false, message: "House không tồn tại!" });
      }

      const existingRoom = await Room.findOne({ house: houseId, name });
      if (existingRoom) {
          return res.status(400).json({ success: false, message: `Phòng '${name}' đã tồn tại.` });
      }

      const newRoom = await Room.create({
        name,
        house: houseId, 
        floor: floor,
        area, 
        priceList: {
          roomPrice, 
          deposit: deposit || 0,
        },
        status: status && ["full", "available"].includes(status) ? status : "available",
        utilities: house.utilities || [],
        deleted: false,
        deletedAt: null,
      });

      house.numberOfRoom += 1;
      await house.save();

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
      return res.status(400).json({ success: false, message: "Invalid roomId" });
    }

    const room = await Room.findById(roomId)
      .populate("utilities")
      .populate("houseId")
      .populate({
        path: "house",
        populate: { path: "priceList", populate: "base" },
      });

    // Nếu không tìm thấy phòng
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Kiểm tra nếu `members` tồn tại trước khi truy cập `.length`
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
        const room = await Room.findById(roomId).populate("utilities")

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
          ...(room.utilities || []).map(utility => ({
            name: utility.name,
            price: utility.price || 0,
          })),
        ];

        // Nếu có hóa đơn mới nhất, lấy tổng số tiền cần thanh toán
        const totalAmount = latestBill ? latestBill.total : room.priceList.roomPrice;

        res.json({
            room: room.name,
            services,
            totalAmount,
        });
    } catch (error) {
        next(error);
    }
};


export const addMember = async(req, res, next) =>{
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

    const existingMember = room.members.some(member => member.accountId.toString() === accountId);
    if (existingMember) {
      return res.status(400).json({ message: "Thành viên đã tồn tại trong phòng." });
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
}


export const ChangeRoomStatus = async (req, res) => {
  const validStatuses = ["full", "available"];
  const { newStatus } = req.body;

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      error: `Invalid status value. Allowed values: ${validStatuses.join(", ")}`,
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
      "floor", "name", "status", "area", "utilities",
      "priceList", "roomBill", "roomReport", "deleted", "members"
    ];

    // Validate if the provided keys are allowed
    const updateKeys = Object.keys(updateData);
    const isValidUpdate = updateKeys.every(key => allowedFields.includes(key));
    if (!isValidUpdate) {
      return res.status(400).json({ error: `Invalid update fields: ${updateKeys.join(", ")}` });
    }

    if (updateData.status && !["full", "available"].includes(updateData.status)) {
      return res.status(400).json({
        error: "Invalid status value. Allowed values: full, available",
      });
    }

    // Validate status if it's being updated
    if (updateData.members) {
      updateData.members.forEach(member => {
        if (!member.accountId || !member.joinDate) {
          throw new Error("Members must include accountId and joinDate");
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }


    // Update the room details
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, { new: true });
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

export const GetRoomByHouseId = async(req, res) =>{
  try {
    const { houseId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(houseId)){
      return res.status(400).json({
        message: "Invalid HouseId"
      })
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({
        message: "House not found with the provided houseId",
      });
    }

    const rooms = await Room.find({ house: houseId}).populate("house members.accountId utilities roomBill roomReport")
    console.log(`Rooms found for houseId ${houseId}:`, rooms);
    return res.status(200).json({
      message: "Here your Room",
      rooms
    })
  } catch (error) {
    console.error("Error in GetRoomByHouseId:", error); // Log for debugging
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}

export const GetMemberLodgerOfHouse = async(req, res) =>{
  try {
    const {houseId} = req.params;

    const house = await House.findById(houseId);
    if(!house){
      return res.status(404).json({ message: "Không tìm thấy nhà trọ"})
    }
    //Lấy danh sách phòng thuộc houseId
    const rooms = await Room.find({house: houseId, deleted: false})
      .populate({
        path: "members.accountId",
        match: {accountType: "Lodger"},
        select: "firstName lastName email phone gender",
      })

    const lodgers = rooms
      .flatMap(room => room.members)
      .map(member => member.accountId) 
      .filter(account => account !== null);

    //Tìm danh sách tài khoản có accoutType = Lodger
    if (lodgers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No lodgers found for this house",
        members: [],
      });
    }

    return res.status(200).json({success: true, members: lodgers})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const GetMemberManagerOfHouse = async(req, res) =>{
  try {
    const {houseId} = req.params;

    const house = await House.findById(houseId);
    if(!house){
      return res.status(404).json({ message: "Không tìm thấy nhà trọ"})
    }
    //Lấy danh sách phòng thuộc houseId
    const rooms = await Room.find({house: houseId, deleted: false})
      .populate({
        path: "members.accountId",
        match: {accountType: "Manager"},
        select: "firstName lastName email phone gender",
      })

    const lodgers = rooms
      .flatMap(room => room.members)
      .map(member => member.accountId) 
      .filter(account => account !== null);

    //Tìm danh sách tài khoản có accoutType = Lodger
    if (lodgers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No manager found for this house",
        members: [],
      });
    }

    return res.status(200).json({success: true, members: lodgers})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
