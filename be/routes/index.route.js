const express = require("express");
const AuthRoute = require("./auth.route.js");

const indexRouter = express.Router();

indexRouter.use("/auth", AuthRoute);

module.exports = indexRouter;
