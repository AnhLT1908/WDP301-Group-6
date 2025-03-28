import express from "express";
import BillController from "../controller/BillController.js";
import { protect } from "../middleware/verifyToken.js";
const BillRouter = express.Router();

// Tạo hóa đơn cho phòng
BillRouter.post("/room/:roomId", BillController.addBillinRoom);
// Xác nhận thanh toán hóa đơn
BillRouter.put("/confirm/:billId", BillController.autoConfimBill);
BillRouter.post("/webhook/casso", BillController.handleWebHook);
BillRouter.get("/", BillController.getAllBill);
BillRouter.get("/roomBill/:roomId", BillController.getBillsByRoom);
BillRouter.get("/bill-detail/:billId", BillController.getOneBill);
BillRouter.get("/transactions", BillController.getTransactions);
BillRouter.patch(
  "/bill-update/:billId",
  BillController.updateBillPaymentStatus
);
BillRouter.post("/evidence/:billId", BillController.uploadBillEvidence);
BillRouter.delete("/evidence/:billId", BillController.deleteBillEvidence);
BillRouter.get("/evidence/:billId", BillController.getBillEvidence);
BillRouter.get("/sendBill/:billId", BillController.sendBillInformationAgain);

export default BillRouter;
