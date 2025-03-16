import * as RoomService from "../service/Room.Service.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const RoomController = {
  ViewListUtilitiesbyRoom: catchAsyncErrors(async (req, res) => {
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
  ViewListEquipment: catchAsyncErrors(async (req, res) => {
    await RoomService.ViewListEquipment(req, res);
  }),
  GetAllRoom: catchAsyncErrors(async (req, res, next) => {
    await RoomService.getAllRoom(req, res, next);
  }),
  addRoom: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.addRoom(req, res, next)
  }),
  getOne: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.GetOne(req, res, next)
  }),
  addMember: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.addMember(req, res, next)
  }),
  getRoomService: catchAsyncErrors(async(req, res, next)=>{
    await RoomService.getRoomServices(req, res, next)
  }),
  getRoomEquipment: catchAsyncErrors(async (req, res, next) => {
    await RoomService.getRoomEquipment(req, res, next);
  }),
  ChangeRoomStatus: catchAsyncErrors(async (req, res) => {
    await RoomService.ChangeRoomStatus(req, res);
  }),
  updateRoomDetails: catchAsyncErrors(async (req, res) => {
    await RoomService.updateRoomDetails(req, res);
  }),
  GetRoomByHouseId: catchAsyncErrors(async(req, res) =>{
    await RoomService.GetRoomByHouseId(req, res);
  }),
  GetLodgerMemberOfHouse: catchAsyncErrors(async(req, res)=>{
    await RoomService.GetMemberLodgerOfHouse(req, res)
  }),
  GetMemberManagerOfHouse: catchAsyncErrors(async(req, res) =>{
    await RoomService.GetMemberManagerOfHouse(req, res)
  })
};


export default RoomController;
