import * as AccountService from "../service/AccountService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const AccountController = {
  getProfile: catchAsyncErrors(async (req, res) => {
    await AccountService.getProfile(req, res);
  }),
  getLodgerAccount: catchAsyncErrors(async (req, res) => {
    await AccountService.getLodgerAccount(req, res);
  }),
  updateLodgerAccount: catchAsyncErrors(async (req, res) => {
    await AccountService.updateLodgerAccount(req, res);
  }),
  CreateLodgerAccount: catchAsyncErrors(async (req, res) => {
    await AccountService.CreateLodgerAccount(req, res);
  }),
  CreateManagerAccount: catchAsyncErrors(async (req, res) => {
    await AccountService.CreateManagerAccount(req, res);
  }),
  GetAll: catchAsyncErrors(async (req, res) => {
    await AccountService.GetAll(req, res);
  }),
  UpdateProfile: catchAsyncErrors(async (req, res) => {
    await AccountService.UpdateProfile(req, res);
  }),
  ChangePassword: catchAsyncErrors(async (req, res) => {
    await AccountService.ChangePassword(req, res);
  }),
  ChangeStatus: catchAsyncErrors(async (req, res) => {
    await AccountService.ChangeStatus(req, res);
  }),
  getManagerAccounts: catchAsyncErrors(async (req, res) => {
    await AccountService.getManagerAccounts(req, res);
  }),
  getListLodger: catchAsyncErrors(async (req, res) => {
    await AccountService.getListLodger(req, res);
  }),
  transferManagerToHouse: catchAsyncErrors(async(req, res, next) =>{
    await AccountService.transferManagerToHouse(req, res, next);
  }),
  updateAccountContactStatus: catchAsyncErrors(async(req, res, next) =>{
    await AccountService.updateAccountContactStatus(req, res, next)
  }),
  deleteLodgerIfNotInContract: catchAsyncErrors(async(req, res, next) => {
    await AccountService.deleteLodgerIfNotInContract(req, res, next)
  })
};

export default AccountController;
