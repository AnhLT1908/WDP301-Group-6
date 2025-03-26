import Account from '../model/Account.js';
import Problem from '../model/Problem.js';
import Room from '../model/Room.js';
import getCurrentUser from '../utils/getCurrentUser.js';
import getPaginationData from '../utils/getPaginationData.js';
import Notification from '../model/Notification.js';

export const createTransferRequest = async (req, res, next) => {
    try {
        const { roomId, content } = req.body;
        const creatorId = getCurrentUser(req); // Người gửi yêu cầu

        // Kiểm tra tài khoản
        const account = await Account.findById(creatorId);
        if (!account || account.accountType !== "Lodger") {
            return res.status(403).json({ success: false, message: "Chỉ Lodger mới có thể tạo yêu cầu chuyển phòng!" });
        }

        // Kiểm tra xem người này có trong phòng không (dựa trên Room.members)
        const room = await Room.findById(roomId);
        if (!room || !room.members.some(member => member.accountId.toString() === creatorId)) {
            return res.status(400).json({ success: false, message: "Bạn không thuộc phòng này!" });
        }

        // Tạo báo cáo chuyển phòng
        const problem = new Problem({
            type: "other", 
            status: "none",
            title: "Yêu cầu chuyển phòng",
            content: content || "Tôi muốn chuyển sang phòng khác.",
            roomId,
            creatorId,
            houseId: room.house,
        });
        await problem.save();

        // Gửi thông báo cho Manager
        const manager = await Account.findOne({ accountType: "Manager" });
        await Notification.create({
            sender: creatorId,
            recipients: [{ user: manager._id, isRead: false }],
            message: `${account.firstName} ${account.lastName} yêu cầu chuyển phòng từ ${room.name}.`,
            type: "problem",
            link: `/problems/${problem._id}`,
        });

        return res.status(201).json({
            success: true,
            message: "Yêu cầu chuyển phòng đã được gửi!",
            data: problem,
        });
    } catch (error) {
        console.error("Lỗi trong createTransferRequest:", error);
        next(error);
    }
};
export const addOne = async(req, res, next)=>{
    try {
        const { roomId, content } = req.body;
        const creatorId = getCurrentUser(req); // Người gửi yêu cầu

        // Kiểm tra tài khoản
        const account = await Account.findById(creatorId);
        if (!account || account.accountType !== "Lodger") {
            return res.status(403).json({ success: false, message: "Chỉ Lodger mới có thể tạo yêu cầu chuyển phòng!" });
        }

        // Kiểm tra xem người này có trong phòng không (dựa trên Room.members)
        const room = await Room.findById(roomId);
        if (!room || !room.members.some(member => member.accountId.toString() === creatorId)) {
            return res.status(400).json({ success: false, message: "Bạn không thuộc phòng này!" });
        }

        // Tạo báo cáo chuyển phòng
        const problem = new Problem({
            type: "other",
            status: false, // Thay từ "none" thành false
            title: "Yêu cầu chuyển phòng",
            content: content || "Tôi muốn chuyển sang phòng khác.",
            roomId,
            creatorId,
            houseId: room.houseId,
          });
        await problem.save();

        // Gửi thông báo cho Manager
        const manager = await Account.findOne({ accountType: "Manager" });
        await Notification.create({
            sender: creatorId,
            recipients: [{ user: manager._id, isRead: false }],
            message: `${account.firstName} ${account.lastName} yêu cầu chuyển phòng từ ${room.name}.`,
            type: "problem",
            link: `/problems/${problem._id}`,
        });

        return res.status(201).json({
            success: true,
            message: "Yêu cầu chuyển phòng đã được gửi!",
            data: problem,
        });
    } catch (error) {
        console.error("Lỗi trong createTransferRequest:", error);
        next(error);
    }
};
export const deleteOne = async (req, res, next) => {
    try {
        const { problemId } = req.params;

        // Kiểm tra xem problem có tồn tại không
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Vấn đề không tồn tại!" });
        }

        // Xóa problem
        await Problem.findByIdAndDelete(problemId);
        
        return res.status(200).json({ message: "Xóa vấn đề thành công!" });
    } catch (error) {
        next(error);
    }
};

export const updateOne = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        const updateData = req.body;

        // Kiểm tra xem problem có tồn tại không
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Vấn đề không tồn tại!" });
        }

        // Cập nhật problem
        const updatedProblem = await Problem.findByIdAndUpdate(problemId, updateData, { new: true });

        return res.status(200).json({ 
            message: "Cập nhật vấn đề thành công!", 
            data: updatedProblem 
        });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Vấn đề không tồn tại!" });
        }
        return res.status(200).json({ data: problem });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const problems = await Problem.find();
        return res.status(200).json({ data: problems });
    } catch (error) {
        next(error);
    }
};
