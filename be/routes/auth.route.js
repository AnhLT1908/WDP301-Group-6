const express = require("express");
const accountValidate = require("../validations/Accout.validate.js")
const validateData = require("../validations/ValidateData.js")
const AuthController = require("../controllers/Auth.controller.js")

const AuthRoute = express.Router();

AuthRoute.post("/forgot-password", AuthController.forgotPasswordHandler);
AuthRoute.post("/verify-password-reset-code", AuthController.verifyPasswordResetCode);
AuthRoute.post("/reset-password", validateData(accountValidate.validateNewPassword), AuthController.resetPasswordHandler);


module.exports = AuthRoute;
