import mongoose from 'mongoose';

const priceItemSchema = new mongoose.Schema({
    base: {
        type:  mongoose.Schema.Types.ObjectId,
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
    priceList: [
       priceItemSchema
    ],
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
        enum: ["Banking", "Cash", "Unknown"],
        default: ""
    }
},  
    { 
    timestamps: true 
    }
);
export default mongoose.model('Bill', BillSchema);
