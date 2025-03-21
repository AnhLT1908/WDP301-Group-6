import Account from '../model/Account.js';
import bcrypt from 'bcrypt';
import Room from '../model/Room.js';
import House from '../model/House.js';
import getCurrentUser from '../utils/getCurrentUser.js';
import mongoose from 'mongoose';
import Notification from '../model/Notification.js';

export const GetAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;
        const { house } = req.params;
        console.log("House id find room", house);
        const rooms = await Room.find({ house });
        console.log("Room list", rooms);
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
            memberOfHouse: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi Server Error",
        });
    }
};

export const getLodgerAccount = async (req, res) => {
    const { accountId } = req.params;
    console.log("Lodger account id", accountId);
    try {
        const accountData = await Account.findById(accountId)
            .populate('roomId', 'name status') // Populate room name and status
            .exec();

        if (!accountData) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        return res.status(200).json({
            message: 'Lấy thông tin tài khoản thành công',
            data: accountData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Lỗi Server Error',
            error: error.message,
        });
    }
};

export const updateLodgerAccount = async (req, res) => {
    const { accountId } = req.params;
    const {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        identityCard,
        phone,
        room,
        rentalDate,
        leaseTerminationDate,
        gender,
        status,
    } = req.body;

    console.log("Received update data: ", req.body);

    try {
        const accountData = await Account.findById(accountId);
        if (!accountData) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        if (email && email !== accountData.email) {
            const checkEmailExists = await Account.findOne({ email: email });
            if (checkEmailExists !== null) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            accountData.password = await bcrypt.hash(password, salt);
        }

        // Update room data if room has changed
        if (room) {
            const roomData = await Room.findById(room);
            if (!roomData) {
                return res.status(404).json({ message: 'Phòng không tồn tại' });
            }

            if (roomData.members?.length >= roomData.quantityMember) {
                return res.status(400).json({ message: 'Phòng đã đầy' });
            }

            accountData.roomId = roomData._id;
        }

        // Update account data
        accountData.firstName = firstName || accountData.firstName;
        accountData.lastName = lastName || accountData.lastName;
        accountData.email = email || accountData.email;
        accountData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : accountData.dateOfBirth;
        accountData.identityCard = identityCard || accountData.identityCard;
        accountData.phone = phone || accountData.phone;
        accountData.rentalDate = rentalDate ? new Date(rentalDate) : accountData.rentalDate;
        accountData.leaseTerminationDate = leaseTerminationDate ? new Date(leaseTerminationDate) : accountData.leaseTerminationDate;
        accountData.gender = gender || accountData.gender;
        accountData.status = status !== undefined ? status : accountData.status;

        // Save updated account
        await accountData.save();

        return res.status(200).json({
            message: 'Cập nhật tài khoản thành công',
            data: accountData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Lỗi Server Error',
            error: error.message,
        });
    }
};

export const getManagerAccounts = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;

        const totalManagers = await Account.countDocuments({ accountType: "Manager" });
        const managers = await Account.find({ accountType: "Manager" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode")
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
        const { password, refreshToken, passwordResetCode, imageStores, ...other } = profile._doc;
        return res.status(200).json({
            data: other,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const CreateLodgerAccount = async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, identityCard, phone, room, rentalDate, leaseTerminationDate, status, accountType } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email đã tồn tại" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({ message: "Phòng không tồn tại" });
        }

        if (roomData.members?.length >= roomData.quantityMember) {
            return res.status(400).json({ message: "Phòng đã đầy" });
        }

        const accountData = await Account.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            identityCard,
            phone,
            roomId: roomData._id,
            rentalDate: rentalDate ? new Date(rentalDate) : null,
            leaseTerminationDate: leaseTerminationDate ? new Date(leaseTerminationDate) : null,
            status: status,
            accountType: accountType || "Lodger",
        });

        await Room.findByIdAndUpdate(
            roomData._id,
            { 
                $push: { 
                    members: {
                        accountId: accountData._id,
                        joinDate: rentalDate ? new Date(rentalDate) : new Date()
                    }
                },
                $set: { 
                    status: roomData.members.length + 1 >= roomData.quantityMember ? "full" : "available"
                }
            },
            { new: true, runValidators: true }
        );

        return res.status(201).json({
            message: "Tạo tài khoản thành công",
            data: {
                firstName: accountData.firstName,
                lastName: accountData.lastName,
                email: accountData.email,
                accountType: accountData.accountType,
                room: roomData.name,
                gender: accountData.gender
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Lỗi Server Error",
            error: error.message
        });
    }
};

export const CreateManagerAccount = async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, identityCard, phone, gender, status, accountType } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email đã tồn tại" });

        const defaultPassword = "Admin@123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        
        const accountData = await Account.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            identityCard,
            phone,
            gender,
            status: status,
            accountType: accountType,
        });

        return res.status(201).json({
            message: "Tạo tài khoản thành công",
            data: {
                firstName: accountData.firstName,
                lastName: accountData.lastName,
                email: accountData.email,
                accountType: accountData.accountType,
                gender: accountData.gender
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Lỗi Server Error",
            error: error.message
        });
    }
};

export const UpdateProfile = async (req, res) => {
    try {
        const accountId = getCurrentUser(req);
        const account = await Account.findById(accountId);
        
        if (!account) {
            return res.status(404).json({ message: "Account không tìm thấy" });
        }

        const { firstName, lastName, phone, avatar } = req.body;

        const updatedAccount = await Account.findByIdAndUpdate(
            accountId, 
            { firstName, lastName, phone, avatar }, 
            { new: true }
        );

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

export const setManagerInactive = async (req, res, next) => {
    try {
        const { managerId } = req.params;
        const adminId = getCurrentUser(req);

        // Kiểm tra quyền Admin
        const admin = await Account.findById(adminId);
        if (!admin || admin.accountType !== "Admin") {
            return res.status(403).json({ success: false, message: "Chỉ Admin mới có quyền thực hiện hành động này!" });
        }

        // Kiểm tra managerId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(managerId)) {
            return res.status(400).json({ success: false, message: "managerId không hợp lệ!" });
        }

        // Tìm Manager
        const manager = await Account.findById(managerId);
        if (!manager || manager.accountType !== "Manager") {
            return res.status(404).json({ success: false, message: "Không tìm thấy Manager!" });
        }

        // Nếu đã inactive, không cần cập nhật
        if (!manager.status) {
            return res.status(400).json({ success: false, message: "Manager này đã ở trạng thái inactive!" });
        }

        // Cập nhật status thành inactive
        manager.status = false;
        await manager.save();

        // Gửi thông báo cho Manager
        await Notification.create({
            sender: adminId,
            recipients: [{ user: managerId, isRead: false }],
            message: `Tài khoản Manager của bạn đã bị Admin đặt thành inactive.`,
            type: "general",
        });

        return res.status(200).json({
            success: true,
            message: "Đặt trạng thái Manager thành inactive thành công!",
            data: manager,
        });
    } catch (error) {
        console.error("Lỗi trong setManagerInactive:", error);
        next(error);
    }
};

export const ChangePassword = async (req, res) => {
    try {
        const accountId = getCurrentUser(req);
        const { oldPassword, newPassword } = req.body;
        const account = await Account.findById(accountId);
        
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại !",
            });
        }
        
        const comparePassword = await bcrypt.compare(oldPassword, account.password);

        if (!comparePassword) {
            return res.status(200).json({
                success: false,
                message: "Mật khẩu cũ không đúng",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        account.password = hashedPassword;
        await account.save();
        
        return res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};


export const updateAccountContactStatus = async (req, res, next) => {
    try {
        const { accountId } = req.params; // ID của tài khoản cần thay đổi
        const { isContact } = req.body; // Giá trị mới của isContact (true/false)
        const currentUserId = getCurrentUser(req); // Người thực hiện thao tác

        // Kiểm tra accountId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(accountId)) {
            return res.status(400).json({
                success: false,
                message: "accountId không hợp lệ!",
            });
        }

        // Kiểm tra quyền của người dùng (Admin hoặc Manager)
        const currentUser = await Account.findById(currentUserId);
        if (!currentUser || !["Admin", "Manager"].includes(currentUser.accountType)) {
            return res.status(403).json({
                success: false,
                message: "Chỉ Admin hoặc Manager mới có quyền thay đổi trạng thái isContact!",
            });
        }

        // Tìm tài khoản cần cập nhật
        const targetAccount = await Account.findById(accountId);
        if (!targetAccount) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản!",
            });
        }

        // Kiểm tra isContact phải là Boolean
        if (typeof isContact !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isContact phải là true hoặc false!",
            });
        }

        // Nếu đặt isContact thành true, đảm bảo không có tài khoản nào khác trong phòng đã là isContact
        if (isContact === true) {
            const existingContact = await Account.findOne({
                roomId: targetAccount.roomId,
                isContact: true,
                _id: { $ne: accountId }, // Không tính tài khoản đang cập nhật
            });

            if (existingContact) {
                return res.status(400).json({
                    success: false,
                    message: `Phòng đã có người đại diện khác (${existingContact.firstName} ${existingContact.lastName})!`,
                    existingContact,
                });
            }
        }

        // Cập nhật trạng thái isContact
        targetAccount.isContact = isContact;
        await targetAccount.save();

        // Gửi thông báo trong hệ thống (tùy chọn)
        await Notification.create({
            sender: currentUserId,
            recipients: [{ user: targetAccount._id, isRead: false }],
            message: `Trạng thái người đại diện của bạn đã được cập nhật thành ${isContact ? "bật" : "tắt"}.`
        });

        return res.status(200).json({
            success: true,
            message: `Trạng thái isContact đã được cập nhật thành ${isContact ? "true" : "false"}.`,
            data: targetAccount,
        });
    } catch (error) {
        console.error("Lỗi trong updateAccountContactStatus:", error);
        next(error);
    }
};

export const transferManagerToHouse = async (req, res, next) => {
    try {
        const adminId = getCurrentUser(req); // Admin thực hiện thao tác
        const { managerId, houseId } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!mongoose.Types.ObjectId.isValid(managerId) || !mongoose.Types.ObjectId.isValid(houseId)) {
            return res.status(400).json({
                success: false,
                message: "managerId hoặc houseId không hợp lệ!",
            });
        }

        // Kiểm tra quyền Admin
        const admin = await Account.findById(adminId);
        if (!admin || admin.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Chỉ Admin mới có quyền chuyển Manager sang nhà trọ khác!",
            });
        }

        // Kiểm tra Manager
        const manager = await Account.findById(managerId);
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager không tồn tại!",
            });
        }

        
        if (manager.accountType !== "Manager") {
            return res.status(400).json({
                success: false,
                message: "Tài khoản này không phải Manager!",
            });
        }
        
        if (manager.status === false) {
            return res.status(400).json({
                success: false,
                message: "Không thể chuyển Manager vì trạng thái hiện tại là không hoạt động (status: false)!",
            });
        }
        // Kiểm tra House
        const house = await House.findById(houseId);
        if (!house) {
            return res.status(404).json({
                success: false,
                message: "Nhà trọ không tồn tại!",
            });
        }

        // Kiểm tra xem nhà trọ đã có Manager khác chưa
        const existingManager = await Account.findOne({
            _id: { $ne: managerId },
            accountType: "Manager",
            roomId: house._id,
        });
        if (existingManager) {
            return res.status(400).json({
                success: false,
                message: "Nhà trọ này đã có Manager khác quản lý!",
            });
        }

        // Cập nhật hostId của House
        house.hostId = managerId;
        await house.save();

        // Cập nhật roomId của Manager, bỏ qua validation
        manager.roomId = houseId;
        await manager.save({ validateBeforeSave: false }); // Tắt validation để tránh lỗi required

        return res.status(200).json({
            success: true,
            message: `Manager đã được chuyển sang quản lý nhà trọ ${house.name}`,
            data: {
                manager,
                house,
            },
        });
    } catch (error) {
        console.error("Lỗi trong transferManagerToHouse:", error);
        next(error);
    }
};

export const ChangeStatus = async (req, res, next) => {
    try {
        const adminId = getCurrentUser(req); // Admin thực hiện thao tác
        const { accountId } = req.params; // ID tài khoản cần thay đổi
        const { status } = req.body;

        // Kiểm tra quyền Admin
        const admin = await Account.findById(adminId);
        if (!admin || admin.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Chỉ Admin mới có quyền thay đổi trạng thái tài khoản!",
            });
        }

        // Kiểm tra status phải là Boolean
        if (typeof status !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Status phải là true hoặc false!",
            });
        }

        // Kiểm tra tài khoản cần thay đổi
        const targetAccount = await Account.findById(accountId);
        if (!targetAccount) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại!",
            });
        }

        // Không cho phép thay đổi trạng thái của Admin khác
        if (targetAccount.accountType === "Admin") {
            return res.status(403).json({
                success: false,
                message: "Không thể thay đổi trạng thái của tài khoản Admin!",
            });
        }

        // Cập nhật trạng thái
        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            { status },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: `Trạng thái tài khoản đã được cập nhật thành ${status ? "active" : "inactive"}`,
            data: updatedAccount,
        });
    } catch (error) {
        console.error("Lỗi trong updateAccountStatus:", error);
        next(error);
    }
};

export const getListLodger = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;

        const totalLodger = await Account.countDocuments({ accountType: "Lodger" });
        const lodger = await Account.find({ accountType: "Lodger" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode")
            .lean();

        const totalPages = Math.ceil(totalLodger / limitPerPage);

        return res.status(200).json({
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalLodger,
                accountsPerPage: lodger.length,
            },
            data: lodger,
        });
    } catch (error) {
        console.error("Error fetching lodger accounts:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
};
