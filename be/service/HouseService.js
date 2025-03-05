import DefaultPrice from '../model/DefaultPrice.js';
import House from '../model/House.js';
import Room from '../model/Room.js';
import mongoose from "mongoose";
import getCurrentUser from '../utils/getCurrentUser.js';

export const addHouse = async (req, res, next) => { // Thêm next ở đây
    try {
        const { name,status, location, electricPrice, waterPrice, servicePrice, rules } = req.body;
        
        if (!servicePrice) {
            return next(new ErrorHandler("Thiếu servicePrice", 400)); // ✅ Dùng next()
        }

        const defaultPriceWater = await DefaultPrice.findOne({ name: "Tiền nước theo khối" });
        if (!defaultPriceWater) {
            return next(new ErrorHandler("Không tìm thấy giá tiền nước", 400));
        }

        const hostId = getCurrentUser(req);
        const house = new House({
            name,
            location,
            status,
            electricPrice,
            waterPrice,
            servicePrice,
            rules,
            hostId,
        });

        await house.save();
        res.status(201).json({ success: true, data: house });
    } catch (error) {
        next(error); // Đẩy lỗi vào middleware
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

export const getOne = async(req, res)=>{
    try {
        const {houseId} = req.params;

        const existHouse = await House.findById(houseId);
        if(!existHouse){
            res.status(404).json({
                message: "House don't exist",
                error: error.message
            })
        }

        return res.status(200).json({
            success: true,
            data: existHouse,
        })
    } catch (error) {
        
    }
}

export const ChangeHouseStatus = async(req, res, next) =>{
    try {
        const {houseId} = req.params;
        const {status} = req.body;

        // Kiểm tra status phải là Boolean (true/false)
        if (typeof status !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Status must be either true or false",
            });
        }
        
        const existHouse = await House.findById(houseId);
        if(!existHouse){
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy căn trọ"
            });
        }

        const updatedHouseStatus = await House.findByIdAndUpdate(
            houseId,
            {status},
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: `Status House changed to ${status}`,
            data: updatedHouseStatus
        })
    } catch (error) {
        next(error)   
    }
}

export const getAll = async (req, res, next) => {
    try {
        const houses = await House.find(); 
        res.status(200).json({
            success: true,
            count: houses.length,
            data: houses,
        });
    } catch (error) {
        next(error); 
    }
};
