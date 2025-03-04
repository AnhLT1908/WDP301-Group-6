import express from 'express';
import NewController from '../controller/NewController.js';
import protect from '../middleware/verifyToken.js';
const NewRouter = express.Router();

NewRouter.get("/:newsId", protect, NewController.getOne)
NewRouter.get("/house/:houseId/",NewController.getAll)
NewRouter.post("/",NewController.addOne);
NewRouter.put("/:newsId", protect, NewController.updateOne);
NewRouter.delete("/:newsId",NewController.deleteOne);

export default NewRouter;