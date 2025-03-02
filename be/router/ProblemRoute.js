import express from 'express';
import ProblemController from '../controller/ProblemController.js';
const problemRouter = express.Router();

problemRouter.get("/:problemId", ProblemController.GetOne);
problemRouter.put("/:problemId", ProblemController.updateOne);
problemRouter.delete("/:problemId", ProblemController.delete);
problemRouter.post("/", ProblemController.addOne);

export default problemRouter;