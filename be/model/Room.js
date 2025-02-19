const mongoose = require('mongoose')

const imageCCCD = Schema ({
    type : {
        type: String,
        enum: ['after', 'before']
    },
    url : {
        type: String,
    }
})

const member = Schema ({
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
        enum: ["male","female"]
    },
    cccd: {
        type: String,
    },
    avatar: {
        type: Schema.ObjectId,
        ref: "Upload"
    },
    imageCCCDs: [imageCCCD],
    note: {
        type: String,
    }
})


const RoomSchema = new mongoose.Schema({
    floor:{
        type: Number
    },
    name:{
        type: String
    },
    status:{
        type: String,
        enum: ["Empty", "Full", "Available"],
        default: "Empty"
    },
    quantityMember:{
        type: Number,
        required: true
    },
    members: [member],
    roomType:{
        type: String,
        enum: ['normal', 'premium'],
        default: "normal"
    },
    roomPrice:{
        type: Number,
        required: true
    },
    deposit:{
        type: Number
    },
    utilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DefaultUtilities",
    }],
    otherUtilities : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "OtherUtilities",
    }],
    area: {
        type: Number,
        required: true
    },
    houseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "House"
    },
    deleted: {
        type: Boolean,
        required: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Room', RoomSchema);