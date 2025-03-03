import * as RoomService from "../service/Room.Service.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const AuthController = {
  ViewListUtilities: catchAsyncErrors(async (req, res) => {
    await RoomService.ViewListUtilities(req, res);
  }),
  AddNewUtilities: catchAsyncErrors(async (req, res) => {
    await RoomService.AddNewUtilities(req, res);
  }),
  UpdateUtilities: catchAsyncErrors(async (req, res) => {
    await RoomService.UpdateUtilities(req, res);
  }),
  ChangeUtilitiesStatus: catchAsyncErrors(async (req, res) => {
    await RoomService.ChangeUtilitiesStatus(req, res);
  }),
  DeleteUtilities: catchAsyncErrors(async (req, res) => {
    await RoomService.DeleteUtilities(req, res);
  }),
  GetAllRoom: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.getAllRoom(req, res, next);
  }),
  createRoom: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.createRoom(req, res, next)
  })
};

export default AuthController;
