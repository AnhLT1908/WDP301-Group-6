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
    },
    price: {
        type: Number,
        required: true, 
        min: [0, "Price cannot be negative"]
    }
})

export default mongoose.model('DefaultPrice', DefaultPriceSchema)
