import * as HouseService from "../service/HouseService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const HouseController = {
    addHouse: catchAsyncErrors(async(req, res, next)=>{
        await HouseService.addHouse(req, res, next)
    })
}

export default HouseController;