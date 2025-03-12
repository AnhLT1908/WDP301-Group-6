import DefaultPrice from "../model/DefaultPrice.js";
import House from "../model/House.js";
import Room from "../model/Room.js";
import mongoose from "mongoose";
import getCurrentUser from "../utils/getCurrentUser.js";
import ErrorHandler from "../middleware/ErrorHandler.js";

export const addHouse = async (req, res, next) => {
  try {
    const {
      name,
      status,
      location,
      electricPrice,
      waterPrice,
      servicePrice,
      rules = null,
      numberOfRoom,
      numberOfMember = 0,
      priceList = [],
      utilities = [],
      deleted = false,
      deleteAt = null,
    } = req.body;

    if (!servicePrice) {
      return next(new ErrorHandler("Thiếu servicePrice", 400));
    }

    // const defaultPriceWater = await DefaultPrice.findOne({
    //   name: "Tiền nước theo khối",
    // });
    // if (!defaultPriceWater) {
    //   return next(new ErrorHandler("Không tìm thấy giá tiền nước", 400));
    // }

    const hostId = getCurrentUser(req);
    const house = new House({
      name,
      status,
      location,
      electricPrice,
      waterPrice,
      servicePrice,
      rules,
      numberOfRoom,
      numberOfMember,
      priceList,
      utilities,
      deleted,
      deleteAt,
      hostId,
    });

    await house.save();
    res.status(201).json({ success: true, data: house });
  } catch (error) {
    next(error);
  }
};

export const updateOne = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    console.log("House ID received:", houseId);

    // Kiểm tra ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid House ID format",
      });
    }

    console.log("Request Body:", req.body);

    // Kiểm tra house có tồn tại không
    const existingHouse = await House.findById(houseId);
    if (!existingHouse) {
      return res.status(404).json({
        success: false,
        message: "House not found!",
      });
    }

    console.log("House before update:", existingHouse);

    // Cập nhật thông tin
    const updatedHouse = await House.findByIdAndUpdate(
      houseId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedHouse) {
      return res.status(500).json({
        success: false,
        message: "Update failed!",
      });
    }

    console.log("Updated House:", updatedHouse);

    res.status(200).json({
      success: true,
      message: "House updated successfully",
      data: updatedHouse,
    });
  } catch (error) {
    console.error("Update House Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const { houseId } = req.params;

    const existHouse = await House.findById(houseId);
    if (!existHouse) {
      res.status(404).json({
        message: "House don't exist",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: existHouse,
    });
  } catch (error) {}
};

export const ChangeHouseStatus = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const { status } = req.body;

    // Kiểm tra status phải là Boolean (true/false)
    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Status must be either true or false",
      });
    }

    const existHouse = await House.findById(houseId);
    if (!existHouse) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy căn trọ",
      });
    }

    const updatedHouseStatus = await House.findByIdAndUpdate(
      houseId,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Status House changed to ${status}`,
      data: updatedHouseStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const houses = await House.find();
    res.status(200).json({
      success: true,
      count: houses.length,
      houses,
    });
  } catch (error) {
    next(error);
  }
};

export const viewServiceFee = async (req, res, next) => {
  try {
    const serviceFeeByHouse = await House.find(
      {},
      "servicePrice waterPrice electricPrice name"
    );
    res.status(200).json({
      success: true,
      data: serviceFeeByHouse,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFee = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const { electricPrice, waterPrice, servicePrice } = req.body;

    if (electricPrice < 0 || waterPrice < 0 || servicePrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Fees must be greater than or equal to 0",
      });
    }
    const updatedHouse = await House.findByIdAndUpdate(
      houseId,
      { electricPrice, waterPrice, servicePrice },
      { new: true, runValidators: true }
    );

    if (!updatedHouse) {
      return res
        .status(404)
        .json({ success: false, message: "House not found" });
    }

    res.json({ success: true, data: updatedHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
