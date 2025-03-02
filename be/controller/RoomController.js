import * as RoomService from '../service/RoomService.js';
import catchAsyncErrors from '../middleware/asyncErrorCatch.js';

const RoomController = {
    addOne: catchAsyncErrors(async(req, res)=>{
        await RoomService.addOne(req, res);
    })
}

export default RoomController;