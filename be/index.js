<<<<<<< HEAD
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import morgan from 'morgan';
import indexRouter from './router/IndexRoute.js';
import helmet from 'helmet';
import ConnectDB from './config/connectDB.js';
import errorMiddleware from './middleware/ErrorHandler.js'
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT;

const corsOptions = {
  origin: true, // Allow requests from all origins
  credentials: true, // allow sending cookies from the client
};

ConnectDB();

app.use(cors(corsOptions));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
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
// Middleware xử lý lỗi 
=======
const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const indexRouter = require("./routes/index.route.js");


const db = require("./config/connectDB.js");

const app = express();
app.set('view engine', 'ejs');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());


const PORT = process.env.PORT || 3000;

app.use("/api/v1", indexRouter);
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
app.get("/", (req, res) => {
  res.send("Server đang chạy ngon lành 🚀");
});

<<<<<<< HEAD
app.use("/api/v1", indexRouter);
app.use(errorMiddleware);

const startServer = async () => {
  await ConnectDB(); // Đảm bảo MongoDB kết nối trước khi chạy server

  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
=======
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
db.connectDB();
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
