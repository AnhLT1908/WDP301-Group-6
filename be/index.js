const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
app.set('view engine', 'ejs');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server đang chạy ngon lành 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
