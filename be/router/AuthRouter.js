import express from 'express';
import AuthController from '../controller/AuthController.js';
import validateData from '../validations/ValidateData.js';
import validateAccount from '../validations/AccountValidate.js';
import { protect } from '../middleware/verifyToken.js';

const AuthRouter = express.Router();

AuthRouter.post(
  "/verify-password-reset-code",
  AuthController.VerifyPasswordResetCode
);

AuthRouter.post(
  "/reset-password",
  validateData(validateAccount.validateNewPassword),
  AuthController.ResetPasswordHandler
);

AuthRouter.post("/forgot-password", AuthController.ForgotPasswordHandler);
AuthRouter.post("/login", AuthController.Login);

AuthRouter.post(
  "/register",
  validateData(validateAccount.validateRegister),
  AuthController.Register
);

AuthRouter.get("/logout", protect, AuthController.Logout);
AuthRouter.post("/refreshtoken", AuthController.RefreshTokenHandler);

export default AuthRouter;
