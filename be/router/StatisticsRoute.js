import express from "express";
import StatisticsController from "../controller/StatisticsController.js";
import protect from "../middleware/verifyToken.js";
const StatisticRouter = express.Router();

StatisticRouter.get(
  "/general",
  protect,
  StatisticsController.statisticGenneral
);
StatisticRouter.get("/bills", protect, StatisticsController.statisticAllBills);
StatisticRouter.get(
  "/house/bills",
  protect,
  StatisticsController.statisticHouselBills
);
StatisticRouter.get(
  "/house/problems",
  protect,
  StatisticsController.statisticHouseProblem
);
StatisticRouter.get(
  "/house/revenues",
  protect,
  StatisticsController.statisticHouseRevenue
);
StatisticRouter.get(
  "/problems",
  protect,
  StatisticsController.statisticProblem
);
StatisticRouter.get(
  "/revenues",
  protect,
  StatisticsController.statisticRevenue
);
 
export default StatisticRouter;
