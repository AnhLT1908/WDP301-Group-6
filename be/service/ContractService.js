import Contract from "../model/Contract.js"
import Room from "../model/Room.js";
import Account from "../model/Account.js";
import Notification from "../model/Notification.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import mongoose from "mongoose";

const oneYearFromNow = () => {
  let date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

export const createContract = async (req, res, next) => {
  try {
      const { roomId } = req.params;
      const { benB, description, startDate, endDate } = req.body;

      // Kiểm tra roomId hợp lệ
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
          return res.status(400).json({ success: false, message: "roomId không hợp lệ!" });
      }

      // Kiểm tra phòng tồn tại
      const room = await Room.findById(roomId).populate("house");
      if (!room) {
          return res.status(404).json({ success: false, message: "Không tìm thấy phòng!" });
      }

      const benA = getCurrentUser(req); // Lấy thông tin người gọi API (Manager)
      if (!benA) {
          return res.status(401).json({ success: false, message: "Không xác định được người gọi API!" });
      }

      // Kiểm tra benA (Manager)
      const benAAccount = await Account.findById(benA);
      if (!benAAccount || benAAccount.accountType !== "Manager") {
          return res.status(403).json({
              success: false,
              message: "Bên A phải là tài khoản Manager (chủ trọ)!",
          });
      }

      // Kiểm tra benB (Lodger)
      if (!mongoose.Types.ObjectId.isValid(benB)) {
          return res.status(400).json({ success: false, message: "benB không hợp lệ!" });
      }

      const benBAccount = await Account.findById(benB);
      if (!benBAccount || benBAccount.accountType !== "Lodger") {
          return res.status(400).json({
              success: false,
              message: "Bên B phải là tài khoản Lodger!",
          });
      }

      // Xử lý startDate và endDate
      const contractStartDate = startDate ? new Date(startDate) : new Date();
      const contractEndDate = endDate ? new Date(endDate) : oneYearFromNow();

      // Kiểm tra định dạng ngày hợp lệ
      if (isNaN(contractStartDate.getTime()) || isNaN(contractEndDate.getTime())) {
          return res.status(400).json({
              success: false,
              message: "startDate hoặc endDate không hợp lệ!",
          });
      }

      // Kiểm tra startDate < endDate
      if (contractStartDate >= contractEndDate) {
          return res.status(400).json({
              success: false,
              message: "startDate phải nhỏ hơn endDate!",
          });
      }

      // Kiểm tra xem phòng đã có hợp đồng nào khác trong khoảng thời gian này chưa
      const overlappingContract = await Contract.findOne({
          roomId,
          status: "valid",
          $or: [
              { startDate: { $lte: contractEndDate }, endDate: { $gte: contractStartDate } },
          ],
      });
      if (overlappingContract) {
          return res.status(400).json({
              success: false,
              message: "Phòng này đã có hợp đồng khác trong khoảng thời gian bạn chọn!",
              overlappingContract,
          });
      }

      // Tạo hợp đồng mới
      const contract = new Contract({
          roomId,
          benA,
          benB,
          description: description || "",
          startDate: contractStartDate,
          endDate: contractEndDate,
      });
      await contract.save();

      return res.status(201).json({
          success: true,
          message: "Tạo hợp đồng thành công!",
          data: contract,
      });
  } catch (error) {
      console.error("Lỗi trong createContract:", error);
      next(error);
  }
};


  export const getContractByRoom = async (req, res, next) => {
    try {
      const { roomId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ success: false, message: "roomId không hợp lệ!" });
      }
  
      const contracts = await Contract.find({ roomId }).populate("benA benB roomId");
      if (!contracts.length) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng nào cho phòng này!" });
      }
  
      return res.status(200).json({
        success: true,
        count: contracts.length,
        data: contracts,
      });
    } catch (error) {
      console.error("Lỗi trong getContractByRoom:", error);
      next(error);
    }
  };

  export const getContractById = async (req, res, next) => {
    try {
      const { contractId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(contractId)) {
        return res.status(400).json({ success: false, message: "contractId không hợp lệ!" });
      }
  
      const contract = await Contract.findById(contractId).populate("benA benB roomId");
      if (!contract) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng!" });
      }
  
      return res.status(200).json({
        success: true,
        data: contract,
      });
    } catch (error) {
      console.error("Lỗi trong getContractById:", error);
      next(error);
    }
  };


  export const updateContract = async (req, res, next) => {
    try {
      const { contractId } = req.params;
      const { description, status, verifyTwoSide, startDate, endDate } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(contractId)) {
        return res.status(400).json({ success: false, message: "contractId không hợp lệ!" });
      }
  
      const contract = await Contract.findById(contractId).populate("roomId");
      if (!contract) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng!" });
      }
  
      // Các trường cho phép cập nhật
      const allowedFields = ["description", "status", "verifyTwoSide", "startDate", "endDate"];
      const updateData = {};
      for (const key of Object.keys(req.body)) {
        if (!allowedFields.includes(key)) {
          return res.status(400).json({
            success: false,
            message: `Trường không hợp lệ: ${key}. Chỉ cho phép: ${allowedFields.join(", ")}`,
          });
        }
        updateData[key] = req.body[key];
      }
  
      // Cập nhật hợp đồng
      const updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("benA benB roomId");
  
      // Gửi thông báo khi trạng thái hoặc xác nhận thay đổi
      if (status || verifyTwoSide) {
        await Notification.create({
          sender: getCurrentUser(req),
          recipients: [
            { user: contract.benA, isRead: false },
            { user: contract.benB, isRead: false },
          ],
          message: `Hợp đồng của phòng ${contract.roomId.name} đã được cập nhật: ${status || ""} ${verifyTwoSide || ""}`,
          type: "general",
          link: `/contracts/${contractId}`,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Cập nhật hợp đồng thành công!",
        data: updatedContract,
      });
    } catch (error) {
      console.error("Lỗi trong updateContract:", error);
      next(error);
    }
  };

  export const deleteContract = async (req, res, next) => {
    try {
      const { contractId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(contractId)) {
        return res.status(400).json({ success: false, message: "contractId không hợp lệ!" });
      }
  
      const contract = await Contract.findById(contractId).populate("roomId");
      if (!contract) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng!" });
      }
  
      await Contract.findByIdAndDelete(contractId);
  
      // Gửi thông báo
      await Notification.create({
        sender: getCurrentUser(req),
        recipients: [
          { user: contract.benA, isRead: false },
          { user: contract.benB, isRead: false },
        ],
        message: `Hợp đồng của phòng ${contract.roomId.name} đã bị xóa.`,
        type: "general",
      });
  
      return res.status(200).json({
        success: true,
        message: "Xóa hợp đồng thành công!",
      });
    } catch (error) {
      console.error("Lỗi trong deleteContract:", error);
      next(error);
    }
  };

  export const getContractsByHouse = async (req, res, next) => {
    try {
      const { houseId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(houseId)) {
        return res.status(400).json({ success: false, message: "houseId không hợp lệ!" });
      }
  
      // Tìm tất cả phòng thuộc houseId
      const rooms = await Room.find({ house: houseId });
      const roomIds = rooms.map(room => room._id);
  
      // Tìm tất cả hợp đồng liên quan đến các phòng này
      const contracts = await Contract.find({ roomId: { $in: roomIds } }).populate("benA benB roomId");
      if (!contracts.length) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng nào cho nhà này!" });
      }
  
      return res.status(200).json({
        success: true,
        count: contracts.length,
        data: contracts,
      });
    } catch (error) {
      console.error("Lỗi trong getContractsByHouse:", error);
      next(error);
    }
  };