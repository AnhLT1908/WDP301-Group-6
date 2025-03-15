import mongoose, { Schema } from "mongoose";

  const HouseSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["available", "full"],
        required: true,
      },
      location:{
          type: mongoose.Schema.Types.ObjectId,
          ref:'Location',
          default: null
      },
      numberOfRoom: {
        type: Number,
        default: 0,
      },
      numberOfMember: {
        type: Number,
      },
      DefaultPrice: [{
        electricPrice: {
          type: Number,
          required: true,
        },
        waterPrice: {
          type: Number,
          required: true,
        },
        servicePrice: {
          type: Number,
          required: true,
        },
        internetPrice:{
          type: Number,
          required: true
        }
    }],
      utilities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DefaultUtilities",
          default: [],
        },
      ],
      hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      deleted: {
        type: Boolean,
        default: false,
      },
      deleteAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

  export default mongoose.model("House", HouseSchema);
