// Room.Service.js
import DefaultUtilities from "../model/DefaultUtilities.js";
import Room from "../model/Room.js";
import exceljs from 'exceljs';
import bcrypt from 'bcrypt';
import Account from "../model/Account.js";
import Bills from "../model/Bills.js";
import House from "../model/House.js";
import mongoose from 'mongoose'

export const getAllRoom = async(req, res, next)=>{
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
  });
  } catch (error) {
    next(error)
  }
}


export const getAllRoom = async(req, res, next)=>{
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
  });
  } catch (error) {
    next(error)
  }
}

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

export const getRoomEquipment = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId)
            .populate("utilities")
            .populate("otherUtilities");

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json({
            roomId: room._id,
            name: room.name,
            equipment: [...room.utilities, ...room.otherUtilities]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addRoom = async (req, res, next) => {
  try {
      const { houseId, name, floor, status, quantityMember, roomType, roomPrice, deposit, area } = req.body;

      if (!houseId || !name || !roomPrice || !quantityMember || !area ) {
          return res.status(400).json({
              success: false,
              message: "Thiếu thông tin bắt buộc! (houseId, name, roomPrice, quantityMember, area, email)",
          });
      }

      const house = await House.findById(houseId);
      if (!house) {
          return res.status(404).json({ success: false, message: "House không tồn tại!" });
      }

      const existingRoom = await Room.findOne({ houseId, name });
      if (existingRoom) {
          return res.status(400).json({ success: false, message: `Phòng '${name}' đã tồn tại.` });
      }

      const newRoom = await Room.create({
          floor: floor || name.charAt(0),
          name,
          status: status || "Empty",
          quantityMember,
          roomType: roomType || "normal",
          roomPrice,
          deposit: deposit || 0,
          area,
          houseId,
          utilities: house.utilities || [],
          otherUtilities: house.otherUtilities || [],
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
        path: "houseId",
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

        // Lấy thông tin phòng
        const room = await Room.findById(roomId)
            .populate("utilities")

        if (!room) {
            return res.status(404).json({ message: "Không tìm thấy phòng!" });
        }

        // Lấy hóa đơn mới nhất của phòng
        const latestBill = await Bills.findOne({ roomId })
            .sort({ createdAt: -1 }) // Lấy hóa đơn mới nhất
            .limit(1);

        // Tạo danh sách phí dịch vụ
        const services = [];

        // Thêm tiền phòng
        services.push({
            name: "Tiền thuê phòng",
            price: room.roomPrice,
        });

        // Thêm các tiện ích mặc định
        if (room.utilities.length > 0) {
            room.utilities.forEach((utility) => {
                services.push({
                    name: utility.name,
                    price: utility.price,
                });
            });
        }

        // Thêm các tiện ích khác
        if (room.otherUtilities.length > 0) {
            room.otherUtilities.forEach((utility) => {
                services.push({
                    name: utility.name,
                    price: utility.price,
                });
            });
        }

        // Nếu có hóa đơn mới nhất, lấy tổng số tiền cần thanh toán
        let totalAmount = room.roomPrice;
        if (latestBill) {
            totalAmount = latestBill.total;
        }

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
    const room = await Room.findById(roomId);

    if (!room) {
        throw new Error("Không tìm thấy phòng.");
    }

    const existingMember = room.members.find(
        (member) =>
            member.phone === req.body.phone ||
            member.cccd === req.body.cccd
    );

    if (existingMember) {
        throw new Error("Số điện thoại hoặc số CCCD đã tồn tại trong phòng.");
    }

    //  Bỏ qua xử lý hình ảnh
    room.members.push(req.body);
    await room.save();

    return room.members[room.members.length - 1]._doc;
  } catch (error) {
      throw error;
  }
}


export const ChangeRoomStatus = async (req, res) => {
  const validStatuses = ["Empty", "Full", "Available"];
  const { newStatus } = req.body;

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      error: `Invalid status value. Allowed values: ${validStatuses.join(
        ", "
      )}`,
    });
  }

  const { roomId } = req.params;
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
          "quantityMember",
          "roomType",
          "roomPrice",
          "deposit",
          "utilities",
          "otherUtilities",
          "area",
          "houseId",
          "members",
          "deleted"
      ];

      // Validate if the provided keys are allowed
      const updateKeys = Object.keys(updateData);
      const isValidUpdate = updateKeys.every(key => allowedFields.includes(key));

      if (!isValidUpdate) {
          return res.status(400).json({ error: `Invalid update fields: ${updateKeys.join(", ")}` });
      }

      // Validate status if it's being updated
      if (updateData.status) {
          const validStatuses = ["Empty", "Full", "Available"];
          if (!validStatuses.includes(updateData.status)) {
              return res.status(400).json({ error: `Invalid status value. Allowed values: ${validStatuses.join(", ")}` });
          }
      }

      // Validate roomType if it's being updated
      if (updateData.roomType) {
          const validRoomTypes = ["normal", "premium"];
          if (!validRoomTypes.includes(updateData.roomType)) {
              return res.status(400).json({ error: `Invalid room type. Allowed values: ${validRoomTypes.join(", ")}` });
          }
      }

      // Update the room details
      const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, { new: true });

      if (!updatedRoom) {
          return res.status(404).json({ error: "Room not found" });
      }

      return res.status(200).json({ message: "Room details updated successfully", room: updatedRoom });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

