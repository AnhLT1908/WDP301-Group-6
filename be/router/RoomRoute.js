import express from "express";
import RoomController from "../controller/RoomController.js";
import { protect, isAuthorized } from "../middleware/verifyToken.js";

const RoomRouter = express.Router();
RoomRouter.get("/view-equipment/:roomId", RoomController.ViewListUtilitiesbyRoom);
RoomRouter.post("/add-equipment", RoomController.AddNewUtilities);
RoomRouter.put("/update-equipment/:id", RoomController.UpdateUtilities);
RoomRouter.patch("/:id/equipment-status", RoomController.ChangeUtilitiesStatus);
RoomRouter.delete("/delete-room-equipment/:roomId/:utilityId", RoomController.DeleteUtilities);

RoomRouter.get("/", RoomController.GetAllRoom);
RoomRouter.post("/addRoom", protect, RoomController.addRoom);
RoomRouter.get("/:roomId", RoomController.getOne);
RoomRouter.get("/member/:houseId", protect, RoomController.GetLodgerMemberOfHouse);
RoomRouter.get("/manager/:houseId", protect, RoomController.GetMemberManagerOfHouse);
RoomRouter.post("/:roomId/member", RoomController.addMember);
RoomRouter.get("/:roomId/services", protect, RoomController.getRoomService);
RoomRouter.get("/:roomId/equipment", protect, RoomController.getRoomEquipment);
RoomRouter.get("/house/:houseId", RoomController.GetRoomByHouseId);
RoomRouter.put("/:roomId/status", RoomController.ChangeRoomStatus);
RoomRouter.put("/:roomId", RoomController.updateRoomDetails);
RoomRouter.patch("/accountId/:accountId/change-room", RoomController.ChangeRoom);


export default RoomRouter;
