import mongoose from 'mongoose';

const DefaultUtilitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    }
})

export default mongoose.model('DefaultUtilities', DefaultUtilitiesSchema)