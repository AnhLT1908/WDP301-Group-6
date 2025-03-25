import mongoose, { Schema } from 'mongoose';
const imageCCCD = new Schema({
    type: {
        type: String,
        enum: ['after', 'before']
    },
    url: {
        type: String,
    }
});

const member = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    dob: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    identityCard: {
        type: String,
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload"
    },
    note: {
        type: String,
    }
});

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    house: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    floor: {
        type: Number,
        required: true
    },
    members: [{
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            validate: {
                validator: function (v) {
                    return v.length <= 3; // Tối đa 4 người
                },
                message: 'Số lượng bên liên quan không được vượt quá 3 người'
            },
            default: []
        },
        joinDate: {
            type: Date,
        }
    }],
    area: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
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