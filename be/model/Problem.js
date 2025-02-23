import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ["common", "electric", "water" ,"other"],
        default: "common",
        required: true
    },
    status:{
        type: String,
        enum:["none", "doing", "pending", "done"],
        default: "none"
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    houseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House'
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default: null
    }
},
    {
        timestamps: true
    }
);

export default mongoose.model('Problem', ProblemSchema)
