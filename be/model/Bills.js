import mongoose from "mongoose";

const priceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Không bắt buộc
    default: "unknown",
  },
  price: {
    type: Number,
    required: false, // Không bắt buộc
    default: 0,
  },
  usage: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: false, // Không bắt buộc
    default: 0,
  },
});

const BillSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
    },
    billCode: {
      type: String,
    },
    roomPrice: {
      type: Number,
      required: true,
    },
    priceList: [priceItemSchema],
    debt: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
    },
    note: {
      type: String,
      default: "",
    },
    paymentLink: {
      type: Object,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["Banking", "Cash", "Unknown"],
      default: "",
    },
    transactionId: {
      type: String,
      // required: true,
      unique: true,
    },
    billEvidence: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Bill", BillSchema);
