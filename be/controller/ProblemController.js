import * as ProblemService from '../service/ProblemService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';
import { getOne } from '../service/HouseService.js';

const ProblemController = {
    createTransferRequest: catchAsyncErrors(async(req, res, next) =>{
        await ProblemService.createTransferRequest(req, res, next)
    }),
    addOne: catchAsyncErrors(async(req, res, next)=>{
        await ProblemService.addOne(req, res, next);
    }),
    deleteOne: catchAsyncErrors(async(req, res, next)=>{
        await ProblemService.deleteOne(req, res);
    }),
    updateOne: catchAsyncErrors(async(req, res, next) =>{
        await ProblemService.updateOne(req, res);
    }),
    getOne: catchAsyncErrors(async(req, res, next) =>{
        await ProblemService.getOne(req, res);
    }),
    getAll: catchAsyncErrors(async(req, res, next) =>{
        await ProblemService.getAll(req, res);
    }),
}

export default ProblemController;