import Bills from "../model/Bills.js";
import crypto from 'crypto';
import Account from '../model/Account.js'
import Notification from "../model/Notification.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import config2 from "../utils/configPayment.js"

const generateTransactionId = () => {
    return crypto.randomBytes(4).toString('hex').substring(0, 7);
};
  
// Hàm tạo URL QR code
const generateVietQR = (amount, courseName) => {
    const transactionId = generateTransactionId();
    const qrUrl = `https://img.vietqr.io/image/${config2.bankInfo.bankId}-${config2.bankInfo.bankAccount}-${config2.bankInfo.template}.png?amount=${amount}&addInfo=${encodeURIComponent(courseName + ' Ma giao dich ' + transactionId)}&accountName=${encodeURIComponent(config2.bankInfo.accountName)}`;
    
    return { qrUrl, transactionId };
};



export const getAllBill = async(req, res, next) =>{
  try {
    const allBill = Bills.find();
    res.status(200).json({
      success: true,
      count: allBill.length,
      data: allBill
    })
  } catch (error) {
    next(error)
  }
}

export const addBillinRoom = async(req, res, next) => {
  try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId).populate({
          path: "houseId",
          populate: { path: "priceList", populate: "base" },
      });

      if (!room) {
          return res.status(404).json({ message: "Không tìm thấy phòng." });
      }

      if (!room.houseId) {
          return res.status(400).json({ message: `Phòng ${room.name} không có houseId!` });
      }

      if (room.members.length === 0) {
          return res.status(400).json({ message: `Phòng ${room.name} chưa có người ở, không thể tạo hóa đơn!` });
      }

      const { priceList, note, debt, paymentMethod } = req.body;

      if (!Array.isArray(priceList)) {
          throw new Error("priceList phải là một mảng!");
      }

      let priceListForBill = priceList.map(item => {
          if (item.startUnit > item.endUnit) {
              throw new Error("Chỉ số đầu không thể lớn hơn chỉ số cuối");
          }
          return {
              base: item.base?._id,
              unitPrice: item.unitPrice,
              startUnit: item.startUnit,
              endUnit: item.endUnit,
              totalUnit: item.base.unit === "đồng/tháng" 
                  ? item.unitPrice 
                  : (item.endUnit - item.startUnit) * item.unitPrice,
          };
      });

      const totalUnits = priceListForBill.reduce((total, item) => total + item.totalUnit, 0);
      const totalAmount = room.roomPrice + totalUnits;
      console.log("Tổng số tiền:", totalAmount);

      const { qrUrl, transactionId } = generateVietQR(totalAmount, "Thanh toán tiền phòng " + room.name);

      const bill = new Bills({
          roomId,
          roomPrice: room.roomPrice,
          priceList: priceListForBill,
          total: totalAmount,
          note,
          houseId: room.houseId._id,  // ✅ Đã kiểm tra trước đó
          paymentLink: qrUrl,
          transactionId,
          isPaid: false,
          debt,  
          paymentMethod,
      });

      await bill.save();

      const roomAccount = await Account.findOne({ roomId: roomId });
      await Notification.create({
          sender: getCurrentUser(req),
          recipients: [{ user: roomAccount?.id, isRead: false }],
          message: "Một hoá đơn phòng " + room.name + " đã được tạo",
          type: "bill",
      });

      res.status(201).json({ bill, qrUrl, transactionId });

  } catch (error) {
      next(error);
  }
};


export const addBillinRoom = async(req, res, next) =>{
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate({
          path: "houseId",
          populate: { path: "priceList", populate: "base" },
        });
        
        // if (!room) {
        //     throw new Error("Không tìm thấy phòng!");
        // }
        // if (room.members.length === 0) {
        //   throw new Error(
        //     "Phòng " + room.name + " chưa có người ở không thể tạo hoá đơn"
        //   );
        // }
  
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const existingBill = await Bills.findOne({
          roomId,
          createdAt: {
            $gte: new Date(thisYear, thisMonth, 1), 
            $lt: new Date(thisYear, thisMonth + 1, 1), 
          },
        });
  
        if (existingBill) {
          throw new Error("Hóa đơn cho phòng này trong tháng này đã tồn tại.");
        }
  
        const { priceList, note, debt, paymentMethod } = req.body;

        if (!Array.isArray(priceList)) {
            throw new Error("priceList phải là một mảng!");
        }
        let priceListForBill = [];
        for (const item of priceList) {
            if (item.startUnit > item.endUnit) {
                throw new Error("Chỉ số đầu không thể lớn hơn chỉ số cuối");
            }

            priceListForBill.push({
                base: item.base._id,
                unitPrice: item.unitPrice,
                startUnit: item.startUnit,
                endUnit: item.endUnit,
                totalUnit: item.base.unit === "đồng/tháng" 
                    ? item.unitPrice 
                    : (item.endUnit - item.startUnit) * item.unitPrice,
                });
            }

  
        const totalUnits = priceListForBill.reduce((total, item) => total + item.totalUnit, 0);
        const totalAmount = room.roomPrice + totalUnits;
  
        const { qrUrl, transactionId } = generateVietQR(totalAmount, "Thanh toán tiền phòng " + room.name);
  
        const bill = new Bills({
            roomId,
            roomPrice: room.roomPrice,
            priceList: priceListForBill,
            total: totalAmount,
            note,
            houseId: room.houseId._id,
            paymentLink: qrUrl,
            transactionId,
            isPaid: false,
            debt,  
            paymentMethod,
        });
        
  
        await bill.save();
  
        const roomAccount = await Account.findOne({ roomId: roomId });
        await Notification.create({
          sender: getCurrentUser(req),
          recipients: [{ user: roomAccount.id, isRead: false }],
          message: "Một hoá đơn phòng " + room.name + " đã được tạo",
          type: "bill",
        //   link: CLIENT_URL + "/bill/" + bill.id,
        });
  
        res.status(201).json({
            bill,
            qrUrl,
            transactionId,
        });
      } catch (error) {
        next(error)
      }
}


export const confirmBill = async(req, res, next) =>{
    try {
        const { billId } = req.params;
        const { paymentMethod } = req.body;
        const bill = await Bills.findById(billId);
        if (!bill) {
            return res.status(404).json({ message: "Không tìm thấy hóa đơn!" });
        }
        if (bill.isPaid) {
          return { message: "Bill đã thanh toán rồi !!" };
        }
  
        bill.isPaid = true;
        bill.paymentMethod = paymentMethod;
  
        await bill.save();
  

        const roomAccount = await Bills.findOne({ roomId: bill.roomId });
        
        if (!roomAccount) {
            throw new Error("Không tìm thấy tài khoản phòng!");
        }

        const room = await Room.findById(bill.roomId);
        if (!room) {
            throw new Error("Không tìm thấy thông tin phòng!");
        }

        await Notification.create({
                sender: getCurrentUser(req),
                recipients: [{ user: roomAccount.id, isRead: false }],
                message: `Hóa đơn của phòng ${room.name} đã được thanh toán bằng ${paymentMethod === "Cash" ? "Tiền mặt" : "Chuyển khoản"}.`,
                type: "bill",
            });
  
            res.json(bill);
      } catch (error) {
        next(error)
      }
    
}