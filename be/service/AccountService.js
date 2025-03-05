import Account from '../model/Account.js';
import bcrypt from 'bcrypt';
import Room from '../model/Room.js';
import getCurrentUser from '../utils/getCurrentUser.js';

export const GetAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;
        
        const { houseId } = req.params;

        const rooms = await Room.find({ houseId });
        const totalAccounts = await Account.countDocuments({ roomId: { $in: rooms.map((room) => room._id) } });
        const data = await Account.find({ roomId: { $in: rooms.map((room) => room._id) } })
                .skip(skip)
                .limit(limitPerPage)
                .sort({ createdAt: -1 })
                .exec();

        const totalPages = Math.ceil(totalAccounts / limitPerPage);

        return res.status(201).json({
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalAccounts: totalAccounts,
                accountsPerPage: data.length,
            },
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi Server Error",
        });
    }
};

export const getManagerAccounts = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;

        // Lọc các tài khoản có accountType là "Manager"
        const totalManagers = await Account.countDocuments({ accountType: "Manager" });
        const managers = await Account.find({ accountType: "Manager" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode") // Ẩn thông tin nhạy cảm
            .exec();

        const totalPages = Math.ceil(totalManagers / limitPerPage);

        return res.status(200).json({
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalManagers,
                accountsPerPage: managers.length,
            },
            data: managers,
        });
    } catch (error) {
        console.error("Error fetching manager accounts:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const accountId = getCurrentUser(req);
        const profile = await Account.findById(accountId);
        if (!profile) {
            return res.send("Account không thấy");
        }
        const {
            password,
            refreshToken,
            passwordResetCode,
            imageStores,
            ...other
        } = profile._doc;
        return res.status(200).json({
            data: other,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const CreateAccount = async (req, res) => {
    const { email, username, role, name } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email đã tồn tại" });
        const checkUsername = await Account.findOne({ username });
        if (checkUsername !== null) {
            return res.status(400).json({ message: "Username có rồi" });
        }

        const password = "Admin@123";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const accountData = await Account.create({
            username,
            name,
            email,
            password: hashedPassword,
            accountType: role,
        });

        return res.status(201).json({
            message: "Tạo acc thành công",
            data: {
                username: accountData.username,
                name: accountData.name,
                email: accountData.email,
                accountType: accountData.accountType,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi Server Error",
        });
    }
};

export const UpdateProfile = async (req, res) => {
    try {
        const accountId = getCurrentUser(req);
        const account = await Account.findById(accountId);
        console.log(accountId);
        
        if (!account) {
            return res.status(404).json({ message: "Account không tìm thấy" });
        }

        const { 
            name, 
            phone, 
            avatar, 
            // payosClientId, 
            // payosAPIKey, 
            // payosCheckSum 
        } = req.body;
        const updatedAccount = await Account.findByIdAndUpdate(accountId, {
            name,
            phone,
            avatar,
            // payosClientId,
            // payosAPIKey,
            // payosCheckSum,
        }, { new: true });

        const { password, _id, refreshToken, passwordResetCode, imageStores, ...other } = updatedAccount._doc;
        return res.status(200).json({
            message: "Cập nhật thành công",
            data: other,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: "Lỗi Server Error",
        });
    }
};

export const ChangePassword = async (req, res) => {
    try {
        const accountId = getCurrentUser(req);
        const { oldPassword, newPassword } = req.body;
        const account = await Account.findById(accountId);
        if (!account) {
            res.status(200).json({
                success: false,
                message: "Tài khoản không tồn tại !",
            });
        } else {
            const comparePassword = await bcrypt.compare(
                oldPassword,
                account.password
            );
            if (!comparePassword) {
                return res.status(200).json({
                    success: false,
                    message: "Mật khẩu cũ không đúng",
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                account.password = hashedPassword;
                await account.save();
                return res.status(200).json({
                    success: true,
                    message: "Đổi mật khẩu thành công",
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi Server Error",
        });
    }
};

export const ChangeStatus = async (req, res, next) => {
    try {
        const accountId = getCurrentUser(req);
        const { status } = req.body;

        // Kiểm tra status phải là Boolean (true/false)
        if (typeof status !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Status must be either true or false",
            });
        }

        const existAccount = await Account.findById(accountId);
        if (!existAccount) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại!",
            });
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            { status },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: `Account changed to ${status}`,
            data: updatedAccount,
        });
    } catch (error) {
        next(error);
    }
};
