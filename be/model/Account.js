import mongoose from 'mongoose';
import validator from 'validator';

const AccountSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            minlength: [10, "Email must be at least 10 characters"],
            maxlength: [50, "Email must be at most 50 characters"],
            validate: [validator.isEmail, "Invalid email"],
        },
        phone: {
            type: String,
            default: null,
            minlength: [10, "Phone must be at least 10 characters"],
        },
        dateOfBirth: {
            type: Date,
            default: null,
        },
        identityCard: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password must be at least 8 characters"],
        },
        accountType: {
            type: String,
            enum: ["Lodger", "Manager", "Admin"],
            default: "Lodger",
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Room',
        },
        rentalDate: {
            type: Date,
            default: null,
        },
        leaseTerminationDate: {
            type: Date,
            default: null,
        },
        status: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        passwordResetCode: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "PasswordResetCode",
        },
        isContact: {
            type: Boolean,
            default: false, // Mặc định không phải người đại diện
            //Trường Boolean mới, mặc định là false. Khi được đặt là true, 
            // người này sẽ là người đại diện cho phòng để nhận thông báo và chịu trách nhiệm thanh toán hóa đơn.
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Account', AccountSchema);
