import mongoose from 'mongoose';

const DefaultPriceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    unit:{
        type: String,
        enum: ["đồng/tháng", "đồng/quý", "đồng/kWh", "đồng/khối", "đồng/người"],
        default: ""
    }
})

export default mongoose.model('DefaultPrice', DefaultPriceSchema)