const Account = require('../model/Account');
const bcrypt = require("bcrypt");
const Room = require('../model/Room')
function getCurrentUser(req) {
    return req.user && req.user.id ? req.user.id : null;
}

exports.GetAll= async(req, res)=> {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitPerPage;
        
        const { houseId } = req.params;

        const rooms = await Room.find({ houseId});
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
            message: "Internal Server Error",
        });
    }
}
exports.getProfile = async(req, res) => {
    try {
        const accountId = getCurrentUser(req)
        const profile = await Account.findById(accountId)
        if (!profile) {
            return res.send("Account not found")
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
        res.status(500).json({message: error.message});
    }
}

exports.CreateAccount = async(req, res) => {
    const { email,username, role, name } = req.body;
    try {
        const checkEmailExists = await Account.findOne({ email: email });
        if (checkEmailExists !== null)
            return res.status(400).json({ message: "Email has exists" });
        const checkUsername = await Account.findOne({username})
        if (checkUsername !== null) {
            return res.status(400).json({ message: "Username has exists" });
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
            message: "Create Successfully",
            data: {
                username: accountData.username,
                name: accountData.name,
                email: accountData.email,
                accountType: accountData.accountType,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}