const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

const AccountSchema = new mongoose.Schema({
    name:{
        type: String,
        required: null
    },
    username:{
        type: String,
        required: null
    },
    email:{
        type: String,
        required: null,
        minLenght: [10, "Email must be at least 10 characters"],
        maxLenght: [50, "Email must be at most 50 characters"],
        validate: [validator.isEmail, "Invalid email"]
    },
    phone:{
        type: String,
        default: null,
        minLenght: [10, "Phone must be at least 10 characters"],
    },
    avatar:{
        type: String,
        default: null
    },
    password:{
        type: String,
        required: null,
        minLenght: [8, "Password must be at least 8 characters"]
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Room'
    },
    status:{
        type: Boolean,
        default: false
    },
    passwordResetCode: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "PasswordResetCode",
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('Account', AccountSchema);