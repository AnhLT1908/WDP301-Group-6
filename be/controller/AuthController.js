import * as AuthService from "../service/AuthService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const AuthController = {
  Login: catchAsyncErrors(async (req, res) => {
    await AuthService.Login(req, res);
  }),
  Register: catchAsyncErrors(async (req, res) => {
    await AuthService.Register(req, res);
  }),
  Logout: catchAsyncErrors(async (req, res) => {
    await AuthService.Logout(req, res);
  }),
  forgotPasswordHandler: catchAsyncErrors(async (req, res) => {
    await AuthService.forgotPasswordHandler(req, res);
  }),
  verifyPasswordResetCode: catchAsyncErrors(async (req, res) => {
    await AuthService.verifyPasswordResetCode(req, res);
  }),
  resetPasswordHandler: catchAsyncErrors(async (req, res) => {
    await AuthService.resetPasswordHandler(req, res);
  }),
  RefreshTokenHandler: catchAsyncErrors(async (req, res) => {
    await AuthService.RefreshTokenHandler(req, res);
  }),
};

export default AuthController;
