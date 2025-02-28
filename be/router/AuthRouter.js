import express from 'express';
import AuthController from '../controller/AuthController.js';
import validateData from '../validations/ValidateData.js';
import validateAccount from '../validations/AccountValidate.js';

const AuthRouter = express.Router();

AuthRouter.post("/forgot-password", AuthController.forgotPasswordHandler);
AuthRouter.post("/verify-password-reset-code", AuthController.verifyPasswordResetCode);
AuthRouter.post("/reset-password", validateData(validateAccount.validateNewPassword), AuthController.resetPasswordHandler);

AuthRouter.post("/login", AuthController.Login);
AuthRouter.post(
  "/register",
  validateData(validateAccount.validateRegister),
  AuthController.Register
);

AuthRouter.get("/logout", /*verifyToken*/ AuthController.Logout);
AuthRouter.post("/refreshtoken", AuthController.RefreshTokenHandler);

export default AuthRouter;
