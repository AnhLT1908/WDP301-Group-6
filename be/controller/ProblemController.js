import * as ProblemService from '../service/ProblemService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const ProblemController = {
    GetOne: catchAsyncErrors(async(req, res)=>{
        await ProblemService.GetOne(req, res);
    }),
    updateOne: catchAsyncErrors(async(req, res)=>{
        await ProblemService.updateOne(req, res);
    }),
    delete: catchAsyncErrors(async(req, res)=>{
        await ProblemService.deleteOne(req, res);
    }),
    addOne: catchAsyncErrors(async(req, res)=>{
        await ProblemService.addOne(req, res);
    })
}

export default ProblemController;