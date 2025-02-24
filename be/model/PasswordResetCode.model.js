const mongoose = require("mongoose");
const { Schema } = mongoose;

const PasswordResetCode = new Schema({
  code: {
    type: String,
    require: true,
  },
  expiresAt: {
    type: Date,
    default: new Date(Date.now()),
    expires: "4h",
  },
});

module.exports = mongoose.model("PasswordResetCode", PasswordResetCode);
