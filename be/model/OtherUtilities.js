const mongoose = require('mongoose');

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

module.exports = mongoose.model("OtherUtilities", OtherUtilitiesSchema)