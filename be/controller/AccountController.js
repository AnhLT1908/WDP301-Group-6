const AccountService = require('../service/AccountService');
const { errorMiddleware } = require('../middleware/ErrorHandler');
const catchAsyncErrors = require('../middleware/asyncErrorCatch');

const AccountController = {
    getProfile: catchAsyncErrors(async(req, res)=>{
        await AccountService.getProfile(req, res);
    })
}


module.exports = AccountController