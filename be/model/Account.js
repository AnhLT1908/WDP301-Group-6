<<<<<<< HEAD
import mongoose from 'mongoose';
import validator from 'validator';

const identifyCardSchema = new mongoose.Schema({
    identityNumber: {
        type: String,
        default: null,
    },
    imageFront: {
        type: String,
        default: null,
    },
    imageBack: {
        type: String,
        default: null,
    },
});

const AccountSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
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
        identityCard: {
            type: identifyCardSchema,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password must be at least 8 characters"],
        },
        accountType: {
            type: String,
            enum: ["Lodger", "Manager", "Admin"],
            default: "Lodger"
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Room',
        },
        status: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        payosClientId: {
            type: String,
        },
        payosAPIKey: {
            type: String,
        },
        payosCheckSum: {
            type: String,
        },
        passwordResetCode: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "PasswordResetCode",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Account', AccountSchema);
=======
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
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
