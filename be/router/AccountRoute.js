import express from 'express';
import AccountController from '../controller/AccountController.js';
import validateData from '../validations/ValidateData.js';
import accountValidate from '../validations/AccountValidate.js';

const AccountRouter = express.Router();

AccountRouter.get("/profile", AccountController.getProfile);

AccountRouter.get("/house/:houseId", /*Token Manager*/ AccountController.GetAll);

AccountRouter.post("/create", validateData(accountValidate.validateAccount), /*Token Manager*/ AccountController.CreateAccount);

// AccountRouter.post(
//   "/create",
//   validateData(accountValidate.validateAccount),
//   /*Token Manager*/
//   AccountController.CreateAccount
// );

AccountRouter.put(
  "/profile/change-password",
  validateData(accountValidate.validateChangePassword),
  AccountController.ChangePassword
);

AccountRouter.put(
  "/profile",
  validateData(accountValidate.validateProfile),
  AccountController.UpdateProfile
);

export default AccountRouter;
