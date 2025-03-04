import express from 'express';
import HouseController from '../controller/HouseController.js';
import { isAuthorized, protect } from '../middleware/verifyToken.js';
const HouseRouter = express.Router();

HouseRouter.post("/", protect,  HouseController.addHouse);

export default HouseRouter;