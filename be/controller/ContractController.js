import * as ContractService from "../service/ContractService.js";
import catchAsyncErrors from "../middleware/asyncErrorCatch.js";

const ContractController = {
  createContract: catchAsyncErrors(async (req, res, next) => {
    await ContractService.createContract(req, res, next);
  }),
  getContractByRoom: catchAsyncErrors(async (req, res, next) => {
    await ContractService.getContractByRoom(req, res, next);
  }),
  getContractByManager: catchAsyncErrors(async (req, res, next) => {
    await ContractService.getContractByManager(req, res, next);
  }),
  getContractById: catchAsyncErrors(async (req, res, next) => {
    await ContractService.getContractById(req, res, next);
  }),
  updateContract: catchAsyncErrors(async (req, res, next) => {
    await ContractService.updateContract(req, res, next);
  }),
  deleteContract: catchAsyncErrors(async (req, res, next) => {
    await ContractService.deleteContract(req, res, next);
  }),
  getContractsByHouse: catchAsyncErrors(async (req, res, next) => {
    await ContractService.getContractsByHouse(req, res, next);
  }),
  updateContractLodgerSide: catchAsyncErrors(async (req, res, next) => {
    await ContractService.updateContractLodgerSide(req, res, next);
  }),
  addRelatedParty: catchAsyncErrors(async (req, res, next) => {
    await ContractService.addRelatedParty(req, res, next);
  }),
  removeRelatedParty: catchAsyncErrors(async (req, res, next) => {
    await ContractService.removeRelatedParty(req, res, next);
  }),
  getContractsByLodger: catchAsyncErrors(async (req, res, next) => {
    await ContractService.getContractsByLodger(req, res, next);
  }),
};

export default ContractController;
