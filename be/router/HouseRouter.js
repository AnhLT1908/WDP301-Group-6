import express from 'express';
import HouseController from '../controller/HouseController.js';
import { protect } from '../middleware/verifyToken.js';
const HouseRouter = express.Router();

HouseRouter.post("/", protect,  HouseController.addHouse);
HouseRouter.put("/:houseId", protect, HouseController.updateOne);
HouseRouter.get("/:houseId", protect, HouseController.getOne);
HouseRouter.put("/:houseId/change-status", protect, HouseController.ChangeHouseStatus);
HouseRouter.get("/", protect,  HouseController.getAll);

export default HouseRouter;