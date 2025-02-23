import mongoose from 'mongoose';


const CommentSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    content:{
        type: String,
        default: ""
    },
    newsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'New'
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedAt: {
        type:  Date,
        default: null,
    }
})

export default mongoose.model('Comment', CommentSchema)
