const mongoose = require('mongoose');
const validator = require('validator');

const identifyCard = new Schema({
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
    identityCard: {
        type: identifyCard,
        default: null,
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
    provider: {
        type: String,
        default: "register",
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
    timestamps: true
}
);

module.exports = mongoose.model('Account', AccountSchema);