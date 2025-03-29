import Contract from "../model/Contract.js";
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
    const { benB, description, startDate, endDate, roomId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "roomId không hợp lệ!" });
    }
    const room = await Room.findById(roomId).populate("house");
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng!" });
    }
    const benA = getCurrentUser(req);
    if (!benA) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được người gọi API!",
      });
    }
    const benAAccount = await Account.findById(benA);
    if (!benAAccount || benAAccount.accountType !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Bên A phải là tài khoản Manager (chủ trọ)!",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(benB)) {
      return res
        .status(400)
        .json({ success: false, message: "benB không hợp lệ!" });
    }
    const benBAccount = await Account.findById(benB);
    if (!benBAccount || benBAccount.accountType !== "Lodger") {
      return res.status(400).json({
        success: false,
        message: "Bên B phải là tài khoản Lodger!",
      });
    }
    const contractStartDate = startDate ? new Date(startDate) : new Date();
    const contractEndDate = endDate ? new Date(endDate) : oneYearFromNow();
    if (
      isNaN(contractStartDate.getTime()) ||
      isNaN(contractEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "startDate hoặc endDate không hợp lệ!",
      });
    }
    if (contractStartDate >= contractEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate phải nhỏ hơn endDate!",
      });
    }
    const overlappingContract = await Contract.findOne({
      roomId,
      status: "valid",
      $or: [
        {
          startDate: { $lte: contractEndDate },
          endDate: { $gte: contractStartDate },
        },
      ],
    });
    if (overlappingContract) {
      return res.status(400).json({
        success: false,
        message:
          "Phòng này đã có hợp đồng khác trong khoảng thời gian bạn chọn!",
        overlappingContract,
      });
    }
    const isMemberAlreadyInRoom = room.members.some(
      (member) =>
        member.accountId && member.accountId.toString() === benB.toString()
    );
    if (!isMemberAlreadyInRoom && room.members.length >= room.quantityMember) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã đạt số lượng thành viên tối đa!",
      });
    }
    const contract = new Contract({
      roomId,
      benA,
      benB,
      description: description || "",
      startDate: contractStartDate,
      endDate: contractEndDate,
    });
    const savedContract = await contract.save();
    if (!savedContract) {
      return res.status(500).json({
        success: false,
        message: "Không thể tạo hợp đồng!",
      });
    }
    if (!isMemberAlreadyInRoom) {
      try {
        const memberJoinDate = contractStartDate;
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          {
            $push: {
              members: {
                accountId: benB,
                joinDate: memberJoinDate,
              },
            },
            $set: {
              status:
                room.members.length + 1 >= room.quantityMember ? false : true,
            },
          },
          { new: true, runValidators: true }
        );
        if (!updatedRoom) {
          await Contract.findByIdAndDelete(savedContract._id);
          return res.status(500).json({
            success: false,
            message: "Không thể cập nhật phòng!",
          });
        }
        const updatedAccount = await Account.findByIdAndUpdate(
          benB,
          {
            roomId: roomId,
            rentalDate: memberJoinDate,
            isContact: true,
          },
          { new: true }
        );

        if (!updatedAccount) {
          await Contract.findByIdAndDelete(savedContract._id);

          await Room.findByIdAndUpdate(roomId, {
            $pull: {
              members: { accountId: benB },
            },
            $set: {
              status: room.members.length < room.quantityMember,
            },
          });

          return res.status(500).json({
            success: false,
            message: "Không thể cập nhật tài khoản người thuê!",
          });
        }
      } catch (error) {
        await Contract.findByIdAndDelete(savedContract._id);
        throw error;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Tạo hợp đồng thành công và cập nhật phòng cho người thuê!",
      data: savedContract,
    });
  } catch (error) {
    console.error("Lỗi trong createContract:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo hợp đồng!",
      error: error.message,
    });
  }
};

export const getContractByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "roomId không hợp lệ!" });
    }

    const contracts = await Contract.find({ roomId }).populate(
      "benA benB roomId"
    );
    if (!contracts.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng nào cho phòng này!",
      });
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

export const getContractsByLodger = async (req, res, next) => {
  try {
    const { lodgerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lodgerId)) {
      return res
        .status(400)
        .json({ success: false, message: "lodgerId không hợp lệ!" });
    }

    const contracts = await Contract.find({ benB: lodgerId }).populate(
      "benA benB roomId"
    );
    if (!contracts.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng nào cho người thuê này!",
      });
    }

    return res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts,
    });
  } catch (error) {
    console.error("Lỗi trong getContractsByLodger:", error);
    next(error);
  }
};

export const getContractByManager = async (req, res, next) => {
  try {
    const { managerId } = req.params;

    const contracts = await Contract.find({ benA: managerId }).populate(
      "benA benB roomId"
    );

    if (!contracts.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng!",
      });
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
      return res
        .status(400)
        .json({ success: false, message: "contractId không hợp lệ!" });
    }

    const contract = await Contract.findById(contractId).populate(
      "benA benB roomId"
    );
    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hợp đồng!" });
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
      return res
        .status(400)
        .json({ success: false, message: "contractId không hợp lệ!" });
    }

    const contract = await Contract.findById(contractId).populate("roomId");
    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hợp đồng!" });
    }

    // Các trường cho phép cập nhật
    const allowedFields = [
      "description",
      "status",
      "verifyTwoSide",
      "startDate",
      "endDate",
    ];
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({
          success: false,
          message: `Trường không hợp lệ: ${key}. Chỉ cho phép: ${allowedFields.join(
            ", "
          )}`,
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
      return res
        .status(400)
        .json({ success: false, message: "contractId không hợp lệ!" });
    }

    const contract = await Contract.findById(contractId).populate("roomId");
    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hợp đồng!" });
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
      return res
        .status(400)
        .json({ success: false, message: "houseId không hợp lệ!" });
    }

    // Tìm tất cả phòng thuộc houseId
    const rooms = await Room.find({ house: houseId });
    const roomIds = rooms.map((room) => room._id);

    // Tìm tất cả hợp đồng liên quan đến các phòng này
    const contracts = await Contract.find({
      roomId: { $in: roomIds },
    }).populate("benA benB roomId");
    if (!contracts.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng nào cho nhà này!",
      });
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

export const updateContractLodgerSide = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { verifyTwoSide } = req.body;
    const userId = req.user._id;
    console.log("req.user", userId.toString());

    // Validate contractId
    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res
        .status(400)
        .json({ success: false, message: "contractId không hợp lệ!" });
    }

    // Check if only verifyTwoSide field is being updated
    if (
      Object.keys(req.body).length !== 1 ||
      !req.body.hasOwnProperty("verifyTwoSide")
    ) {
      return res.status(400).json({
        success: false,
        message: "Chỉ được phép cập nhật trường verifyTwoSide!",
      });
    }

    // Validate verifyTwoSide value
    if (verifyTwoSide !== "verified" && verifyTwoSide !== "unverified") {
      return res.status(400).json({
        success: false,
        message:
          "Giá trị verifyTwoSide không hợp lệ! Chỉ chấp nhận 'verified' hoặc 'unverified'.",
      });
    }

    // Find contract and populate relevant fields
    const contract = await Contract.findById(contractId).populate(
      "benA benB roomId"
    );

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hợp đồng!" });
    }
    console.log("contract.benB._id", contract.benB._id.toString());
    // Check if the user is benB of the contract
    if (contract.benB._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật hợp đồng này!",
      });
    }

    // Check if the user is a Lodger
    const account = await mongoose.model("Account").findById(userId);
    if (!account || account.accountType !== "Lodger") {
      return res.status(403).json({
        success: false,
        message: "Chỉ Lodger mới có quyền thực hiện thao tác này!",
      });
    }

    // Update contract
    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      {
        verifyTwoSide,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("benA benB roomId");

    // Update isContact status for benB
    await mongoose
      .model("Account")
      .findByIdAndUpdate(contract.benB._id, { isContact: true });

    return res.status(200).json({
      success: true,
      message: "Cập nhật hợp đồng và trạng thái liên hệ thành công!",
      data: updatedContract,
    });
  } catch (error) {
    console.error("Lỗi trong updateContractLodgerSide:", error);
    next(error);
  }
};

export const addRelatedParty = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { accountId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: "Invalid contractId" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "Invalid accountId" });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Initialize relatedParties if null
    if (contract.relatedParties === null) {
      contract.relatedParties = [];
    }

    // Check if account already exists in relatedParties
    if (contract.relatedParties.includes(accountId)) {
      return res
        .status(400)
        .json({ message: "Account already exists in relatedParties" });
    }

    // Validate maximum limit for relatedParties (4 people)
    if (contract.relatedParties.length >= 4) {
      return res
        .status(400)
        .json({ message: "Maximum number of relatedParties reached (4)" });
    }

    // Add account to relatedParties
    contract.relatedParties.push(accountId);
    await contract.save();

    return res.status(200).json({
      success: true,
      message: "Added account to contract relatedParties",
      contract,
    });
  } catch (error) {
    console.error("Error adding related party:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const removeRelatedParty = async (req, res) => {
  try {
    const { contractId, accountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: "Invalid contractId" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "Invalid accountId" });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Ensure relatedParties is an array
    if (!contract.relatedParties || !Array.isArray(contract.relatedParties)) {
      return res
        .status(400)
        .json({ message: "relatedParties is not properly initialized" });
    }

    // Check if account exists in relatedParties
    const partyIndex = contract.relatedParties.findIndex(
      (party) => party.toString() === accountId
    );

    if (partyIndex === -1) {
      return res
        .status(404)
        .json({ message: "Account not found in relatedParties" });
    }

    // Remove account from relatedParties
    contract.relatedParties.splice(partyIndex, 1);
    await contract.save();

    return res.status(200).json({
      success: true,
      message: "Account removed from contract relatedParties",
      contract,
    });
  } catch (error) {
    console.error("Error removing related party:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
