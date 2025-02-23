import mongoose from 'mongoose';

const oneYearFormNow =()=>{
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
}

const ContactSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date,
        default: oneYearFormNow
    }
},
    {
        timestamps: true
    }
)

export default mongoose.model('Contact', ContactSchema)