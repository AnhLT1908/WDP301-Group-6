import * as NewService from '../service/NewService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const NewController = {
    getOne: catchAsyncErrors(async(req, res)=>{
        await NewService.getOne(req, res);
    }),
    getAll: catchAsyncErrors(async(req, res)=>{
        await NewService.getAll(req, res);
    }),
    addOne: catchAsyncErrors(async(req, res)=>{
        await NewService.addOne(req, res);
    }),
    updateOne: catchAsyncErrors(async(req, res)=>{
        await NewService.updateOne(req, res)
    }),
    deleteOne: catchAsyncErrors(async(req, res)=> {
        await NewService.deleteOne(req, res)
    })
}

export default NewController;