const express = require('express');
const AccountRouter = express.Router();
const AccountController = require('../controller/AccountController');

AccountRouter.get("/profile", AccountController.getProfile);

module.exports = AccountRouter;