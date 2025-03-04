import express from "express";
import RoomController from "../controller/RoomController.js";
import { protect } from "../middleware/verifyToken.js";

const RoomRouter = express.Router();
RoomRouter.get("/view-equipment/:roomId", RoomController.ViewListUtilities);
RoomRouter.post("/add-equipment", RoomController.AddNewUtilities);
RoomRouter.put("/update-equipment/:id", RoomController.UpdateUtilities);
RoomRouter.patch("/:id/equipment-status", RoomController.ChangeUtilitiesStatus);
RoomRouter.delete("/delete-room-equipment/:roomId/:utilityId", RoomController.DeleteUtilities);

RoomRouter.get("/", protect, RoomController.GetAllRoom);
RoomRouter.post("/addRoom", protect, RoomController.addRoom);
RoomRouter.get("/:roomId", protect, RoomController.getOne);
RoomRouter.post("/:roomId/member", protect, RoomController.addMember);
RoomRouter.get("/:roomId/services", protect, RoomController.getRoomService);
RoomRouter.get("/:roomId/equipment", protect, RoomController.getRoomEquipment);

export default RoomRouter;
