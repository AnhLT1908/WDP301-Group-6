import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import morgan from "morgan";
import indexRouter from "./router/IndexRoute.js";
import helmet from "helmet";
import ConnectDB from "./config/connectDB.js";
import './cron.js'

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT;

const corsOptions = {
  origin: true, // Allow requests from all origins
  credentials: true, // allow sending cookies from the client
};

ConnectDB();

app.use(cors(corsOptions));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());

cloudinary.config({
  cloud_name: "dtpujfoo8",
  api_key: "697855136624351",
  api_secret: "gYkgLXmSaCiVhCM40clYpA_dFr8",
});

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "admin",
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

app.get("/", (req, res) => {
  res.send("Server đang chạy ngon lành 🚀");
});

app.use("/api/v1", indexRouter);

const startServer = async () => {
  await ConnectDB(); // Đảm bảo MongoDB kết nối trước khi chạy server
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
