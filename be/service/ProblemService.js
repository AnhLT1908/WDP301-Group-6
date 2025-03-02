import Account from "../model/Account.js";
import House from "../model/House.js";
import New from "../model/New.js";
import Notification from '../model/Notification.js';
import Problem from "../model/Problem.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import getPaginationData from '../utils/getPaginationData.js';

export const GetOne = async(req, res)=>{
    try {
        const {roomId} = req.body;
        const room = await Room.findById(roomId).populate({path: "houseId",select: "hostId",populate: {path: "hostId",select: "_id"}});
        const creatorId = getCurrentUser(req);
        const data = await Problem.create({...req.body,creatorId,houseId:room.houseId});
        await room.save();
        const roomAccount = await Account.findOne({roomId: roomId})
        await Notification.create({
            sender: getCurrentUser(req),
            recipients: [
                {
                    user: room.houseId.hostId._id,                        
                }
            ],
            message: "1 problem đã được thêm vào phòng " + room.name,
            type: "problem",
            link: CLIENT_URL + "/problem/" + data.id
        })
        return data;
    } catch (error) {
        throw error
    }
}

export const addOne = async(req, res)=>{
    try {
        const {roomId} = req.body;
        const room = await Room.findById(roomId).populate({path: "houseId",select: "hostId",populate: {path: "hostId",select: "_id"}});
        const creatorId = getCurrentUser(req);
        const data = await Problem.create({...req.body,creatorId,houseId:room.houseId});
        await room.save();
        const roomAccount = await Account.findOne({roomId: roomId})
        await Notification.create({
            sender: getCurrentUser(req),
            recipients: [
                {
                    user: room.houseId.hostId._id,                        
                }
            ],
            message: "1 problem đã được thêm vào phòng " + room.name,
            type: "problem",
            link: CLIENT_URL + "/problem/" + data.id
        })
        return data;
    } catch (error) {
        throw error
    }
}
export const deleteOne = async(req, res)=>{
    try {
        const {problemId} = req.params;
        await Problem.findByIdAndUpdate(problemId,{deleted: true,deletedAt: Date.now()});
        const newData = await Problem.findById(problemId);
        return newData;
    } catch (error) {
        throw error
    }
}

export const updateOne = async(req, res)=>{
    try {
        const {problemId} = req.params;
        await Problem.findByIdAndUpdate(problemId,{...req.body});
        const newData = await Problem.findById(problemId);
        const roomAccount = await Account.findOne({roomId: newData.roomId})
        const room = await Room.findById(newData.roomId)
        await Notification.create({
            sender: getCurrentUser(req),
            recipients: [
                {
                    user: roomAccount,                        
                }
            ],
            message: "Problem phòng " + room.name + " đã được cập nhật",
            type: "problem",
            link: CLIENT_URL + "/problem/" + newData.id
        })
        return newData
    } catch (error) {
        throw error
    }
}