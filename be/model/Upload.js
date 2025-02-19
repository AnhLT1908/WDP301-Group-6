const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
    imageName: {
        type: String
    },
    ImageData:{
        type: String
    }
});

module.exports = mongoose.model('Upload', UploadSchema)