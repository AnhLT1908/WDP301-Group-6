import * as HouseService from "../service/HouseService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const HouseController = {
    addHouse: catchAsyncErrors(async(req, res, next)=>{
        await HouseService.addHouse(req, res, next)
    }),
    updateOne: catchAsyncErrors(async(req, res, next)=>{
        await HouseService.updateOne(req, res, next)
    }),
    getOne: catchAsyncErrors(async(req, res, next)=>{
        await HouseService.getOne(req, res, next)
    }),
    ChangeHouseStatus: catchAsyncErrors(async(req, res, next)=>{
        await HouseService.ChangeHouseStatus(req, res, next)
    }),
    getAll: catchAsyncErrors(async(req, res, next) =>{
        await HouseService.getAll(req, res, next)
    })
}

export default HouseController;