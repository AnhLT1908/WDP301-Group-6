const mongoose = require('mongoose');

const ConnectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log(`✅ MongoDB connected: ${process.env.MONGODB_URL}`);
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // Dừng server nếu kết nối thất bại
    }
};
module.exports = ConnectDB;