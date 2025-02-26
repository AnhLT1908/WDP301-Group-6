import * as AuthService from '../service/AuthService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

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
    ForgotPasswordHandler: catchAsyncErrors(async (req, res) => {
        await AuthService.ForgotPasswordHandler(req, res);
    }),
    VerifyPasswordResetCode: catchAsyncErrors(async (req, res) => {
        await AuthService.VerifyPasswordResetCode(req, res);
    }),
    ResetPasswordHandler: catchAsyncErrors(async (req, res) => {
        await AuthService.ResetPasswordHandler(req, res);
    }),
    RefreshTokenHandler: catchAsyncErrors(async (req, res) => {
        await AuthService.RefreshTokenHandler(req, res);
    }),
};

export default AuthController;
