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
    ref: "House",
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  }],
  area: {
    type: Number,
    required: true
  },
  roomPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["full", "available"],
    default: "available"
  },
  utilities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "DefaultUtilities"
  }],
  debtMoney: {
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
    },
  }],
  roomBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill"
  },
  deposit: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Room', RoomSchema);
