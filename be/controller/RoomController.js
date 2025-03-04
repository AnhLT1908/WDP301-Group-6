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
  ChangeRoomStatus: catchAsyncErrors(async (req, res) => {
    await RoomService.ChangeRoomStatus(req, res);
  }),
  updateRoomDetails: catchAsyncErrors(async (req, res) => {
    await RoomService.updateRoomDetails(req, res);
  }),

};

export default AuthController;
