const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
    district:{
        type: String,
        default: ""
    },
    ward:{
        type: String,
        default: ""
    },
    province:{
        type: String,
        default: ""
    },
    detailLocation:{
        type: String,
        default: ""
    }
}) 

module.exports = mongoose.model('Location', LocationSchema)