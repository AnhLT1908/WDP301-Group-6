const mongoose = require('mongoose');

const DefaultUtilitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('DefaultUtilities', DefaultUtilitiesSchema)