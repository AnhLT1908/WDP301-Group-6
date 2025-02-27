import mongoose from "mongoose";

const DefaultUtilitiesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

export default mongoose.model("DefaultUtilities", DefaultUtilitiesSchema);
