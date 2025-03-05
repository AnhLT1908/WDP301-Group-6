import Account from '../model/Account.js';
import Problem from '../model/Problem.js';
import Room from '../model/Room.js';
import getCurrentUser from '../utils/getCurrentUser.js';
import getPaginationData from '../utils/getPaginationData.js';
import Notification from '../model/Notification.js';

export const addOne = async(req, res, next)=>{
    try {
        const {roomId} = req.body;
        const creatorId = getCurrentUser(req);

        const room = await Room.findById(roomId)
        .populate({ 
            path: "houseId", 
            select: "hostId", 
            populate: { path: "hostId", select: "_id" }
        });

        if (!room) {
            return res.status(404).json({ message: "Phòng không tồn tại!" });
        }       

        if (!room.houseId || !room.houseId.hostId) {
            return res.status(400).json({ message: "Phòng không có chủ nhà hợp lệ!" });
        }

        // Tạo mới Problem
        const data = await Problem.create({ 
            ...req.body, 
            creatorId, 
            houseId: room.houseId._id 
        });        
        const recipients = room.houseId?.hostId ? [{ user: room.houseId.hostId._id }] : [];

        await Notification.create({
                sender: creatorId,
                recipient: recipients,  // Đảm bảo luôn có giá trị hợp lệ
                message: `Một vấn đề mới đã được thêm vào phòng ${room.name}`,
        });
        return res.status(201).json({ 
            message: "Thêm vấn đề thành công!", 
            data 
        });
    } catch (error) {
        next(error)
    }
}

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
