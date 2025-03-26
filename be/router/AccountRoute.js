import express from "express";
import AccountController from "../controller/AccountController.js";
import validateData from "../validations/ValidateData.js";
import accountValidate from "../validations/AccountValidate.js";
import { protect, isAuthorized } from "../middleware/verifyToken.js";

const AccountRouter = express.Router();

AccountRouter.get("/profile", protect, AccountController.getProfile);

AccountRouter.get(
  "/lodgerAccount/:house",
  /*Token Manager*/ AccountController.GetAll
);

AccountRouter.post(
  "/create",
  protect,
  /*Token Manager*/ AccountController.CreateLodgerAccount
);

AccountRouter.get(
  "/lodger/:accountId",
  protect,
  AccountController.getLodgerAccount
);

AccountRouter.patch(
  "/:accountId/contact-status",
  protect,
  AccountController.updateAccountContactStatus
);
AccountRouter.post(
  "/transfer-manager",
  protect,
  AccountController.transferManagerToHouse
);

AccountRouter.put(
  "/updateLodgerAccount/:accountId",
  protect,
  AccountController.updateLodgerAccount
);

AccountRouter.post(
  "/create-manager",
  protect,
  validateData(accountValidate.validateAccount),
  /*Token Manager*/ AccountController.CreateManagerAccount
);

AccountRouter.patch(
  "/accounts/:accountId/status",
  protect,
  AccountController.ChangeStatus
);

//AccountRouter.get("/manager", protect, AccountController.getManagerAccounts);

AccountRouter.get("/manager", protect, AccountController.getManagerAccounts);

AccountRouter.get(
  "/lodger-account-list",
  // protect,
  AccountController.getListLodger
);

AccountRouter.put(
  "/profile/change-password",
  validateData(accountValidate.validateChangePassword),
  AccountController.ChangePassword
);

AccountRouter.put(
  "/profile",
  protect,
  validateData(accountValidate.validateProfile),
  AccountController.UpdateProfile
);

export default AccountRouter;
