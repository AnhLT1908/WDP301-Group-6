import express from 'express';
import BillController from '../controller/BillController.js';
import { protect } from '../middleware/verifyToken.js';
const BillRouter = express.Router();

// Tạo hóa đơn cho phòng 
BillRouter.post("/room/:roomId", BillController.addBillinRoom);
// Xác nhận thanh toán hóa đơn
BillRouter.put('/confirm/:billId', BillController.confimBill);
BillRouter.get('/', BillController.getAllBill);

BillRouter.get('/bill-detail/:billId', BillController.getOneBill);


export default BillRouter;
