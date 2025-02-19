const mongoose = require('mongoose');

const PasswordResetCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(),
        expires: 14400
    }
})

module.exports = mongoose.model("PasswordResetCode", PasswordResetCodeSchema)