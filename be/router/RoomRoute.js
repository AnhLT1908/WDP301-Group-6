import express from "express";
import RoomController from "../controller/RoomController.js";
import { protect } from "../middleware/verifyToken.js";

const RoomRouter = express.Router();
RoomRouter.get("/view-equipment/:roomId", RoomController.ViewListUtilities);
RoomRouter.post("/add-equipment", RoomController.AddNewUtilities);
RoomRouter.put("/update-equipment/:id", RoomController.UpdateUtilities);
RoomRouter.patch("/:id/equipment-status", RoomController.ChangeUtilitiesStatus);
RoomRouter.delete("/delete-room-equipment/:roomId/:utilityId", RoomController.DeleteUtilities);


export default RoomRouter;
