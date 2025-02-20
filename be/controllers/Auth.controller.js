const asyncHandler = require("../middleware/asyncErrorCatch.js");
const AuthService = require("../service/Auth.service.js")

const AuthController = {
  forgotPasswordHandler: asyncHandler(async (req, res) => {
    await AuthService.forgotPasswordHandler(req, res);
  }),
  verifyPasswordResetCode: asyncHandler(async (req, res) => {
    await AuthService.verifyPasswordResetCode(req, res);
  }),
  resetPasswordHandler: asyncHandler(async (req, res) => {
    await AuthService.resetPasswordHandler(req, res);
  }),
};

module.exports = AuthController;
