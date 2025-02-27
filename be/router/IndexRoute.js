import express from 'express';
import AccountRouter from '../router/AccountRoute.js';
import AuthRouter from '../router/AuthRouter.js';
import RoomRouter from './RoomRoute.js';

const indexRouter = express.Router();

indexRouter.use("/account", AccountRouter);
indexRouter.use("/auth", AuthRouter);
indexRouter.use("/room", RoomRouter);

export default indexRouter;
