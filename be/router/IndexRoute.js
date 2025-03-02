import express from 'express';
import AccountRouter from '../router/AccountRoute.js';
import AuthRouter from '../router/AuthRouter.js';
import problemRouter from './ProblemRoute.js';
import HouseRouter from './HouseRoute.js';

const indexRouter = express.Router();

indexRouter.use("/account", AccountRouter);
indexRouter.use("/auth", AuthRouter);
indexRouter.use("/problem", problemRouter);
indexRouter.use("/house", HouseRouter);

export default indexRouter;
