import mongoose, { Schema } from 'mongoose';

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    house: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House",
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    members: [{
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        },
        joinDate: {
            type: Date,
            required: true
        }
    }],
    area: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["full", "available"],
        default: "available"
    },
    utilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DefaultUtilities"
    }],
    priceList: {
        roomPrice: {
            type: Number,
            required: true
        },
        deposit: {
            type: Number,
            default: 0
        },
        debt: {
            type: Number,
            default: 0
        },
        monthlyElectricityUsage: [{
            value: {
                type: Number,
                default: 0
            },
            month: {
                type: String,
                required: true
            }
        }],
        monthlyWaterUsage: [{
            value: { 
                type: Number, 
                default: 0 
            },
            month: { 
                type: String, 
                required: true 
            }
        }],
        monthlyServiceUsage: [{
            value: { 
                type: Number, 
                default: 0 
            },
            month: { 
                type: String, 
                required: true 
            }
        }],
        monthlyInternetUsage:[{
            value: {
                type: Number,
                default: 0
            }
        }]
    },
    roomBill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill"
    },
    roomReport: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    }],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
export default mongoose.model('Room', RoomSchema);
