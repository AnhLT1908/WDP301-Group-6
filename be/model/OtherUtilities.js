import mongoose from 'mongoose';

const OtherUtilitiesSchema = new mongoose.Schema({
    useID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    name: {
        type: String,
        default: ""
    }
});

export default mongoose.model("OtherUtilities", OtherUtilitiesSchema)