import * as ProblemService from '../service/ProblemService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const ProblemController = {
    addOne: catchAsyncErrors(async(req, res, next)=>{
        await ProblemService.addOne(req, res, next);
    }),
    deleteOne: catchAsyncErrors(async(req, res, next)=>{
        await ProblemService.deleteOne(req, res);
    }),
    updateOne: catchAsyncErrors(async(req, res, next) =>{
        await ProblemService.updateOne(req, res);
    })
}

export default ProblemController;