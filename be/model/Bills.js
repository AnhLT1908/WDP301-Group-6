const mongoose = require('mongoose')

const priceItemSchema = Schema({
    base: {
        type: Schema.ObjectId,
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


const BillSchema = new mongoose.Schema({
    roomId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    houseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    billCode: {
        type: Number
    },
    roomPrice: {
        type: Number,
        required: true,
    },
    priceList: [{
        type : priceItemSchema
    }],
    debt: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
    },
    note: {
        type: String,
        default: ""
    },
    paymentLink: {
        type: Object,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paymentMethod: {
        type: String,
        enum: ["Banking", "Cash", ""],
        default: ""
    }
},  
    { 
    timestamps: true 
    }
);

module.exports = mongoose.model('Bill', BillSchema);