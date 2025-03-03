// Room.Service.js
import DefaultUtilities from "../model/DefaultUtilities.js";
import Room from "../model/Room.js";


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

