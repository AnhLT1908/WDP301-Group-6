const express = require('express');
const AccountRouter = require('../router/AccountRoute');
const indexRouter = express.Router();

indexRouter.use("/account", AccountRouter);


module.exports = indexRouter;