import * as StatisticsService from "../service/StatisticsService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const StatisticsController = {
  statisticGenneral: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticGeneral(req, res, next);
  }),
  statisticAllBills: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticAllBills(req, res, next);
  }),
  statisticProblem: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticProblem(req, res, next);
  }),
  statisticRevenue: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticRevenue(req, res, next);
  }),
  statisticHouselBills: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticHouselBills(req, res, next);
  }),
  statisticHouseProblem: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticHouseProblem(req, res, next);
  }),
  statisticHouseRevenue: catchAsyncErrors(async (req, res, next) => {
    await StatisticsService.statisticHouseRevenue(req, res, next);
  }),
};

export default StatisticsController;
