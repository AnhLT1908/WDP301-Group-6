const mongoose = require('mongoose');

const priceItemSchema = new Schema({
    base: {
        type: Schema.ObjectId,
        ref: "DefaultPrice",
    },
    price: {
        type: Number,
        require: true
    }
})

const HouseSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    status:{
        type: String,
        require: true
    },
    location:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Location',
        default: {}
    },
    numberOfRoom: {
        type: Number,
        default: 0,
    },
    electricPrice: {
        type: Number,
        require: true,
    },
    waterPrice: {
        type: Number,
        require: true,
    },
    servicePrice: {
        type: Number,
        require: true,
    },
    priceList: [
        {
            type: priceItemSchema,
            default: {},
            unique: true,
        }
    ],
})