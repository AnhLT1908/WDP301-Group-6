const mongoose = require('mongoose');

const DefaultPriceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    unit:{
        type: String,
        enum: ["đồng/tháng", "đồng/quý", "đồng/kWh", "đồng/khối", "đồng/người"],
        default: ""
    }
})

module.exports = mongoose.model('DefaultPrice', DefaultPriceSchema)