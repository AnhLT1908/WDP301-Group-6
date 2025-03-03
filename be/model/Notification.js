import mongoose, { Schema } from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        recipients: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Account",
                },
                isRead: {
                    type: Boolean,
                    default: false, // Mặc định là false, tức là thông báo chưa được đọc bởi người nhận
                },
            },
        ],
        message: {
            type: String,
        },
        type: {
            type: String,
            enum: ["bill", "news", "problem", "general"],
        },
        link: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;