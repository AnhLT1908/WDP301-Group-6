import * as BillService from "../service/BillService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const BillController = {
  addBillinRoom: catchAsyncErrors(async (req, res, next) => {
    await BillService.addBillinRoom(req, res, next);
  }),
  autoConfimBill: catchAsyncErrors(async (req, res, next) => {
    await BillService.confirmBill(req, res, next);
  }),
  getAllBill: catchAsyncErrors(async (req, res, next) => {
    await BillService.getAllBill(req, res, next);
  }),
  getOneBill: catchAsyncErrors(async (req, res, next) => {
    await BillService.getOneBill(req, res, next);
  }),
  handleWebHook: catchAsyncErrors(async (req, res, next) => {
    await BillService.handleWebHook(req, res, next);
  }),
  getBillsByRoom: catchAsyncErrors(async (req, res, next) => {
    await BillService.getBillsByRoom(req, res, next);
  }),
  getTransactions: catchAsyncErrors(async (req, res, next) => {
    await BillService.getTransactions(req, res, next);
  }),
  updateBillPaymentStatus: catchAsyncErrors(async (req, res, next) => {
    await BillService.updateBillPaymentStatus(req, res, next);
  }),
  uploadBillEvidence: catchAsyncErrors(async (req, res, next) => {
    await BillService.uploadBillEvidence(req, res, next);
  }),
  deleteBillEvidence: catchAsyncErrors(async (req, res, next) => {
    await BillService.deleteBillEvidence(req, res, next);
  }),
  getBillEvidence: catchAsyncErrors(async (req, res, next) => {
    await BillService.getBillEvidence(req, res, next);
  }),
  sendBillInformationAgain: catchAsyncErrors(async (req, res, next) => {
    await BillService.sendBillInformationAgain(req, res, next);
  }),
};

export default BillController;
