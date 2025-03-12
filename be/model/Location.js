import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    detailLocation: {
        type: String,
        default: ""
    },
    srcMap: {
        type: String,
        default: ""
    }
});

export default mongoose.model('Location', LocationSchema);
