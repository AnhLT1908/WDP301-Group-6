const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL_USER,
    pass: process.env.AUTH_EMAIL_PASSWORD,
  },
});

async function sendEmail(payload) {
  try {
    console.log("Email sent:");
    const info = await transporter.sendMail(payload);
    return info;
  } catch (err) {
    console.error("Error while sending email:", err); // Log lỗi
    throw err;
  }
}

module.exports = sendEmail;