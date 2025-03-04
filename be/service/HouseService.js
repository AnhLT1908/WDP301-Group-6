import DefaultPrice from '../model/DefaultPrice.js';
import House from '../model/House.js';
import Room from '../model/Room.js';
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
        next(error); // ✅ Đẩy lỗi vào middleware
    }
};
