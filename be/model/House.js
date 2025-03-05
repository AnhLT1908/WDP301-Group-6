import mongoose, { Schema } from 'mongoose';

const priceItemSchema = new Schema({
    base: {
        type: Schema.ObjectId,
        ref: "DefaultPrice",
    },
    price: {
        type: Number,
        required: true
    }
})

const HouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    location:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Location',
        default: null
    },
    numberOfRoom: {
        type: Number,
        default: 0,
    },
    electricPrice: {
        type: Number,
        required: true,
    },
    waterPrice: {
        type: Number,
        required: true,
    },
    servicePrice: {
        type: Number,
        required: true,
    },
    priceList: [
        {
            type: priceItemSchema,
            default: {},
            unique: true,
        }
    ],
    utilities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DefaultUtilities",
        },
    ],
    otherUtilities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OtherUtilities",
        },
    ],
    hostId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deleteAt:{
        type: Date,
        default: null
    },
    },
    {
    timestamps: true
    }
);

export default mongoose.model('House', HouseSchema);