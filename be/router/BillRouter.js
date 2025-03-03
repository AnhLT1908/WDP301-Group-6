import express from 'express';
import BillController from '../controller/BillController.js';
import { protect } from '../middleware/verifyToken.js';
const BillRouter = express.Router();

// Tạo hóa đơn cho phòng 
BillRouter.post("/room/:roomId", protect, BillController.addBillinRoom);
// Xác nhận thanh toán hóa đơn
BillRouter.put('/confirm/:billId', protect, BillController.confimBill);


export default BillRouter;