import express from "express";
import ContractController from "../controller/ContractController.js";
import protect from "../middleware/verifyToken.js";
const ContractRouter = express.Router();
// Tạo hóa đơn cho phòng
ContractRouter.post(
  "/room/:roomId",
  protect,
  ContractController.createContract
);
ContractRouter.get("/room/:roomId", ContractController.getContractByRoom);
ContractRouter.get("/:contractId", ContractController.getContractById);
ContractRouter.patch("/:contractId", ContractController.updateContract);
ContractRouter.delete("/:contractId", ContractController.deleteContract);
ContractRouter.get("/house/:houseId", ContractController.getContractsByHouse);
ContractRouter.patch(
  "/lodger/:contractId",
  protect,
  ContractController.updateContractLodgerSide
);
ContractRouter.put(
  "/:contractId/related-parties",
  ContractController.addRelatedParty
);
ContractRouter.delete(
  "/:contractId/related-parties/:accountId",
  ContractController.removeRelatedParty
);

export default ContractRouter;
