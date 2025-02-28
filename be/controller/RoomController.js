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
};

export default AuthController;
