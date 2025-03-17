import * as AccountService from '../service/AccountService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const AccountController = {
    getProfile: catchAsyncErrors(async (req, res) => {
        await AccountService.getProfile(req, res);
    }),
    CreateLodgerAccount: catchAsyncErrors(async (req, res) => {
        await AccountService.CreateLodgerAccount(req, res);
    }),
    CreateManagerAccount: catchAsyncErrors(async(req, res) =>{
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
    ChangeStatus: catchAsyncErrors(async(req, res)=>{
        await AccountService.ChangeStatus(req, res)
    }),
    getManagerAccounts: catchAsyncErrors(async(req, res)=>{
        await AccountService.getManagerAccounts(req, res)
    }),
    getListLodger: catchAsyncErrors(async(req,res)=>{
        await AccountService.getListLodger(req,res);
    })
};

export default AccountController;
