import mongoose from 'mongoose';

const UploadSchema = new mongoose.Schema({
    imageName: {
        type: String
    },
    ImageData:{
        type: String
    }
});

export default mongoose.model('Upload', UploadSchema);