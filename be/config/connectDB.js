const mongoose = require("mongoose");

const db = {};

db.connectDB = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    })
    .then(() => {
      console.log("Connect to MongoDB successfully");
    })
    .catch((error) => {
      console.error(error.message);
      process.exit();
    });
};

module.exports = db;
