import express from 'express';
import HouseController from '../controller/HouseController.js';
import { protect } from '../middleware/verifyToken.js';
const HouseRouter = express.Router();

HouseRouter.get("/", protect,  HouseController.getAll);

HouseRouter.get("/fee",  HouseController.viewServiceFee);
HouseRouter.put("/update-fee/:houseId",HouseController.updateFee)
HouseRouter.put("/:houseId", protect, HouseController.updateOne);
//HouseRouter.get("/:houseId", protect, HouseController.getOne);
HouseRouter.get("/:houseId", HouseController.getOne);
HouseRouter.put("/:houseId/change-status", protect, HouseController.ChangeHouseStatus);
HouseRouter.get("/",  HouseController.getAll);
HouseRouter.post("/create", protect, HouseController.addHouse);

export default HouseRouter;
