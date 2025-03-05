import express from 'express';
import StatisticsController from '../controller/StatisticsController.js';
import protect from '../middleware/verifyToken.js';
const StatisticRouter = express.Router();

StatisticRouter.get("/general", protect, StatisticsController.statisticGenneral)
StatisticRouter.get("/bills",protect,StatisticsController.statisticAllBills)
StatisticRouter.get("/problems",protect,StatisticsController.statisticProblem)
StatisticRouter.get("/revenue",protect,StatisticsController.statisticRevenue)

export default StatisticRouter;