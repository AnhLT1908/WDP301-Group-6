import mongoose from 'mongoose';

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

export default mongoose.model("PasswordResetCode", PasswordResetCodeSchema)