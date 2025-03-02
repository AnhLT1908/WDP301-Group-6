// Room.Service.js
import DefaultUtilities from "../model/DefaultUtilities.js";
import Room from "../model/Room.js";

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
