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
app.get("/", (req, res) => {
  res.send("Server đang chạy ngon lành 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
db.connectDB();
