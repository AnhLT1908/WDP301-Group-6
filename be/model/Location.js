import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    district:{
        type: String,
        default: ""
    },
    ward:{
        type: String,
        default: ""
    },
    province:{
        type: String,
        default: ""
    },
    detailLocation:{
        type: String,
        default: ""
    }
}) 

export default mongoose.model('Location', LocationSchema)