import * as BillService from '../service/BillService.js'
import catchAsyncErrors from '../middleware/asyncErrorCatch.js'

const BillController = {
    addBillinRoom: catchAsyncErrors(async(req, res, next)=>{
        await BillService.addBillinRoom(req, res, next)
    }),
    autoConfimBill: catchAsyncErrors(async(req, res, next) =>{
        await BillService.confirmBill(req, res, next)
    }),
    getAllBill: catchAsyncErrors(async(req, res, next)=>{
        await BillService.getAllBill(req, res, next)
    }),
    getOneBill: catchAsyncErrors(async(req, res, next)=>{
        await BillService.getOneBill(req, res, next)
    }),
    handleWebHook: catchAsyncErrors(async(req, res, next) =>{
        await BillService.handleWebHook(req, res, next)
    })
}

export default BillController;
