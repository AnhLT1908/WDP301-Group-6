import express from 'express';
import ProblemController from '../controller/ProblemController.js';
import protect from '../middleware/verifyToken.js';
const ProblemRouter = express.Router();

ProblemRouter.post("/", protect,  ProblemController.createTransferRequest);
ProblemRouter.post("/Add-problem", protect, ProblemController.addOne);
ProblemRouter.delete("/:problemId", protect, ProblemController.deleteOne);
ProblemRouter.put("/:problemId", protect, ProblemController.updateOne)
ProblemRouter.get("/:problemId", ProblemController.getOne);
ProblemRouter.get("/", ProblemController.getAll);

export default ProblemRouter;