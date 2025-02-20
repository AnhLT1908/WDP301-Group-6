const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASSWORD,
    }
});



async function sendEmail(payload) {
    transporter.sendMail(payload, (err, info) => {
        if (err) {
            return err;
        }
    });
}

module.exports = sendEmail;
