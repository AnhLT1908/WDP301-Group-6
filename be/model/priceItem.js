const mongoose = require('mongoose')

const priceItemSchema = new mongoose.Schema({
    base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DefaultPrice",
    },
    unitPrice: {
        type: Number
    },
    startUnit: {
        type: Number,
    },
    endUnit: {
        type: Number,
    },
    totalUnit: {
        type: Number,
    } 
});


module.exports = mongoose.model('priceItem', priceItemSchema)
