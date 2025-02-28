import * as AccountService from '../service/AccountService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const AccountController = {
    getProfile: catchAsyncErrors(async (req, res) => {
        await AccountService.getProfile(req, res);
    }),
    CreateAccount: catchAsyncErrors(async (req, res) => {
        await AccountService.CreateAccount(req, res);
    }),
    GetAll: catchAsyncErrors(async (req, res) => {
        await AccountService.GetAll(req, res);
    }),
    UpdateProfile: catchAsyncErrors(async (req, res) => {
        await AccountService.UpdateProfile(req, res);
    }),
    ChangePassword: catchAsyncErrors(async (req, res) => {
        await AccountService.ChangePassword(req, res);
    })
};

export default AccountController;
