import Account from '../model/Account.js';
import bcrypt from 'bcrypt';
import Room from '../model/Room.js';
import getCurrentUser from '../utils/getCurrentUser.js';
import mongoose from 'mongoose';
import Account from '../model/Account.js';
import bcrypt from 'bcrypt';
import Room from '../model/Room.js';
import getCurrentUser from '../utils/getCurrentUser.js';
import mongoose from 'mongoose';

export const GetAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;
        
        const { house } = req.params;
        console.log("House id find room", house)
        const rooms = await Room.find({ house });
        console.log("Room list", rooms)
        const totalAccounts = await Account.countDocuments({ roomId: { $in: rooms.map((room) => room._id) } });
        const data = await Account.find({ roomId: { $in: rooms.map((room) => room._id) } })
                .skip(skip)
                .limit(limitPerPage)
                .sort({ createdAt: -1 })
                .exec();

        const totalPages = Math.ceil(totalAccounts / limitPerPage);
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
  console.log("Lodger account id", accountId)
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
    accountData.leaseTerminationDate = leaseTerminationDate
      ? new Date(leaseTerminationDate)
      : accountData.leaseTerminationDate;
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
        // Lọc các tài khoản có accountType là "Manager"
        const totalManagers = await Account.countDocuments({ accountType: "Manager" });
        const managers = await Account.find({ accountType: "Manager" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode") // Ẩn thông tin nhạy cảm
            .exec();

        const totalPages = Math.ceil(totalManagers / limitPerPage);
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


export const CreateLodgerAccount = async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, identityCard, phone, room, rentalDate, leaseTerminationDate, status, accountType } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email đã tồn tại" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
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
        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({ message: "Phòng không tồn tại" });
        }

        if (roomData.members?.length >= roomData.quantityMember) {
            return res.status(400).json({ message: "Phòng đã đầy" });
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
            // gender,
            status: status,
            accountType: accountType || "Lodger",
        });
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
            // gender,
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
    const { firstName, lastName, email, password, dateOfBirth, identityCard, phone, gender, status, accountType } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email đã tồn tại" });

        const password = "Admin@123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
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
        const password = "Admin@123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
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
    try {
        const accountId = getCurrentUser(req);
        const account = await Account.findById(accountId);
        
        if (!account) {
            return res.status(404).json({ message: "Account không tìm thấy" });
        }

        const { 
            firstName,
            lastName, 
            phone, 
            avatar, 
        } = req.body;
        const updatedAccount = await Account.findByIdAndUpdate
        (
            accountId, {
            firstName,
            lastName,
            phone,
            avatar,
        }, { new: true });
        const { 
            firstName,
            lastName, 
            phone, 
            avatar, 
        } = req.body;
        const updatedAccount = await Account.findByIdAndUpdate
        (
            accountId, {
            firstName,
            lastName,
            phone,
            avatar,
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
      const account = await Account.findById(accountId); // Remove the 'Q' typo here
      if (!account) {
        res.status(404).json({
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
      console.error(error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message
      });
    }
  };

export const ChangeStatus = async (req, res, next) => {
    try {
        const accountId = getCurrentUser(req);
        const { status } = req.body;
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
        return res.status(200).json({
            success: true,
            message: `Account changed to ${status}`,
            data: updatedAccount,
        });
    } catch (error) {
        next(error);
    }
};

export const getListLodger = async(req,res,next)=>{
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;
export const getListLodger = async(req,res,next)=>{
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;

        // Lọc các tài khoản có accountType là "Manager"
        const totalLodger = await Account.countDocuments({ accountType: "Lodger" });
        const lodger = await Account.find({ accountType: "Lodger" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode") // Ẩn thông tin nhạy cảm
            .lean()
        // Lọc các tài khoản có accountType là "Manager"
        const totalLodger = await Account.countDocuments({ accountType: "Lodger" });
        const lodger = await Account.find({ accountType: "Lodger" })
            .skip(skip)
            .limit(limitPerPage)
            .sort({ createdAt: -1 })
            .select("-password -refreshToken -passwordResetCode") // Ẩn thông tin nhạy cảm
            .lean()

        const totalPages = Math.ceil(totalLodger / limitPerPage);
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
        console.error("Error fetching manager accounts:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
}
