import express from 'express';
import AccountRouter from '../router/AccountRoute.js';
import AuthRouter from '../router/AuthRouter.js';
import RoomRouter from './RoomRoute.js';
import HouseRouter from '../router/HouseRouter.js';
const indexRouter = express.Router();

indexRouter.use("/account", AccountRouter);
indexRouter.use("/auth", AuthRouter);
indexRouter.use("/room", RoomRouter);
indexRouter.use("/house", HouseRouter);

export default indexRouter;
