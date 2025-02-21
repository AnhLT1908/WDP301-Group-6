const mongoose = require('mongoose');
const validate = require('validator')

const NewSchema = new mongoose.Schema({
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    houseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    images: {
        type: [String],
        default: [],
        validate: {
          validator: function(arr) {
            return arr.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/.test(url));
          },
          message: "Ảnh không hợp lệ, chỉ chấp nhận URL hình ảnh"
        }
    },
    likedBy: {
        type: [Schema.Types.ObjectId], //đây là mảng các ObjectId
        ref: "Account",
        default: []
    },
      commentsId: {
        type: [Schema.Types.ObjectId], 
        ref: "Comments",
        default: []
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
},
{
    timestamps: true
})

module.exports = mongoose.model('New', NewSchema)