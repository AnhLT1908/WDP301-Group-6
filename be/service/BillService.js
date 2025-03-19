import Bills from "../model/Bills.js";
import crypto from "crypto";
import Account from "../model/Account.js";
import Notification from "../model/Notification.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import config2 from "../utils/configPayment.js"
import DefaultPrice from "../model/DefaultPrice.js";
import mongoose from "mongoose";

const generateTransactionId = () => {
    return crypto.randomBytes(4).toString('hex').substring(0, 7);
};
  

// Hàm tạo URL QR code
const generateVietQR = (amount, courseName) => {
  const transactionId = generateTransactionId();
  const qrUrl = `https://img.vietqr.io/image/${config2.bankInfo.bankId}-${
    config2.bankInfo.bankAccount
  }-${
    config2.bankInfo.template
  }.png?amount=${amount}&addInfo=${encodeURIComponent(
    courseName + " Ma giao dich " + transactionId
  )}&accountName=${encodeURIComponent(config2.bankInfo.accountName)}`;

  return { qrUrl, transactionId };
};


export const getAllBill = async(req, res, next) =>{
  try {
    const allBill = await Bills.find();
    res.status(200).json({
      success: true,
      count: allBill.length,
      data: allBill
    })
  } catch (error) {
    next(error)
  }
}


//get bill detail by id
export const getOneBill = async(req, res, next) => {
  try {
    const { billId } = req.params;
    const oneBill = await Bills.findById(billId);
    res.status(200).json({
      success: true,
      data: oneBill
    })
  } catch (error) {
    next(error)
  }
}

export const addBillinRoom = async(req, res, next) => {
  try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId).populate('house')

      if (!room) {
          return res.status(404).json({ message: "Không tìm thấy phòng." });
      }

      if (!room.house || !mongoose.Types.ObjectId.isValid(room.house)) {
          return res.status(400).json({ message: `Phòng ${room.name} không có houseId!` });
      }

      // if (room.members.length === 0) {
      //     return res.status(400).json({ message: `Phòng ${room.name} chưa có người ở, không thể tạo hóa đơn!` });
      // }

      const { note, debt = 0, paymentMethod, customPriceList } = req.body;

      const defaultPrices = await DefaultPrice.find();
        const defaultPriceMap = defaultPrices.reduce((map, price) => {
            map[price.name] = { price: price.price, unit: price.unit };
            return map;
        }, {});
      let priceList = [];

      if (customPriceList && Array.isArray(customPriceList)) {
        priceList = customPriceList.map(item => {
          const defaultPrice = defaultPriceMap[item.name] || { price: item.price || 0, unit: "" };
          const usage = item.usage || 0;
          const price = item.price !== undefined ? item.price : defaultPrice.price;
          let total;
      
          console.log(`Processing ${item.name}:`, { defaultPrice, price, usage }); 
      
          switch (defaultPrice.unit) {
              case "đồng/kWh":
              case "đồng/khối":
              case "đồng/người":
                  total = price * usage;
                  break;
              case "đồng/tháng":
              default:
                  total = usage > 0 ? price * usage : price;
                  break;
          }
          return { name: item.name, price, usage, total };
      });
    }else {
        const electricityUsage = room.priceList.monthlyElectricityUsage.length > 0
                ? room.priceList.monthlyElectricityUsage[room.priceList.monthlyElectricityUsage.length - 1].value
                : 0;
        const waterUsage = room.priceList.monthlyWaterUsage.length > 0
                ? room.priceList.monthlyWaterUsage[room.priceList.monthlyWaterUsage.length - 1].value
                : 0;
        const serviceUsage = room.priceList.monthlyServiceUsage.length > 0
                ? room.priceList.monthlyServiceUsage[room.priceList.monthlyServiceUsage.length - 1].value
                : 0;
        const InternetUsage = room.priceList.monthlyInternetUsage.length > 0
                ? room.priceList.monthlyInternetUsage[room.priceList.monthlyInternetUsage.length - 1].value
                : 0;
            priceList = [
                {
                    name: "electricity",
                    price: defaultPriceMap.electricity?.price || 0,
                    usage: electricityUsage,
                    total: (defaultPriceMap.electricity?.price || 0) * electricityUsage
                },
                {
                    name: "water",
                    price: defaultPriceMap.water?.price || 0,
                    usage: waterUsage,
                    total: (defaultPriceMap.water?.price || 0) * waterUsage
                },
                {
                    name: "service",
                    price: defaultPriceMap.service?.price || 0,
                    usage: serviceUsage,
                    total: (defaultPriceMap.service?.price || 0) * serviceUsage
                },
                {
                    name: "internet",
                    price: defaultPriceMap.internet?.price || 0,
                    usage: InternetUsage,
                    total: (defaultPriceMap.internet?.price || 0) * InternetUsage
                }
            ];
        }

      const utilitiesTotal = priceList.reduce((sum, item) => sum + item.total, 0);
      const totalAmount = room.priceList.roomPrice + utilitiesTotal + debt;

      const transactionId = generateTransactionId();
      const billCode = `BILL-${roomId}-${Date.now()}-${transactionId}`;
      const paymentDescription = `Thanh toán tiền phòng ${room.house.name} - ${room.name}`;      
      const { qrUrl } = generateVietQR(totalAmount, paymentDescription);

      const bill = new Bills({
          roomId,
          houseId: room.house._id,
          billCode,
          roomPrice: room.priceList.roomPrice,
          priceList,
          debt,
          total: totalAmount,
          note,
          paymentLink: qrUrl,
          isPaid: false,
          paymentMethod: paymentMethod || "Unknown"
      });
      await bill.save();

      const roomAccount = await Account.findOne({ roomId: roomId });
      await Notification.create({
          sender: getCurrentUser(req),
          recipients: [{ user: roomAccount?._id, isRead: false }],
          message: `Một hoá đơn phòng ${room.name} đã được tạo (Tổng: ${totalAmount})`,
          type: "bill"
      });

      res.status(201).json(
        {
          success: true,
           data: bill, 
           qrUrl, 
           transactionId,
           paymentDescription,
          }
        );

  } catch (error) {
      next(error);
  }
};

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
  
        const roomAccount = await Account.findOne({ roomId: bill.roomId });
        
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

export const UpdateBillDetail = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { priceList, note, debt, paymentMethod, isPaid } = req.body;

    // xác nhận billId
    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ success: false, message: "Invalid billId" });
    }

    // tìm bill
    const bill = await Bills.findById(billId).populate("roomId");
    if (!bill) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
    }

    // Xác định trường nào được cập nahajt
    const allowedFields = ["priceList", "note", "debt", "paymentMethod", "isPaid"];
    const updateData = {};
    const updateKeys = Object.keys(req.body);
    const isValidUpdate = updateKeys.every(key => allowedFields.includes(key));
    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: `Invalid update fields. Allowed: ${allowedFields.join(", ")}`,
      });
    }

    // Kiểm tra Pricelisst
    if (priceList) {
      if (!Array.isArray(priceList)) {
        return res.status(400).json({ success: false, message: "priceList phải là một mảng" });
      }
      updateData.priceList = priceList.map(item => {
        if (item.startUnit > item.endUnit) {
          throw new Error("Chỉ số đầu không thể lớn hơn chỉ số cuối");
        }
        let baseId = undefined;
        if (item.base) {
          if (!mongoose.Types.ObjectId.isValid(item.base)) {
            throw new Error(`Invalid base ObjectId: ${item.base}`);
          }
          baseId = new mongoose.Types.ObjectId(item.base); 
        }
        return {
          base: baseId,
          unitPrice: item.unitPrice,
          startUnit: item.startUnit,
          endUnit: item.endUnit,
          totalUnit: (item.endUnit - item.startUnit) * item.unitPrice, 
        };
      });

      // Tính lại nếu PriceList đổi 
      const totalUnits = updateData.priceList.reduce((sum, item) => sum + (item.totalUnit || 0), 0);
      updateData.total = bill.roomPrice + totalUnits + (debt !== undefined ? debt : bill.debt);
    }

    // Cập nhật các trường kahcs 
    if (note !== undefined) updateData.note = note;
    if (debt !== undefined) {
      updateData.debt = debt;
      if (!priceList) updateData.total = bill.roomPrice + bill.priceList.reduce((sum, item) => sum + (item.totalUnit || 0), 0) + debt;
    }
    if (paymentMethod !== undefined) {
      if (!["Banking", "Cash", "Unknown"].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid paymentMethod. Allowed: Banking, Cash, Unknown",
        });
      }
      updateData.paymentMethod = paymentMethod;
    }
    if (isPaid !== undefined) {
      if (typeof isPaid !== "boolean") {
        return res.status(400).json({ success: false, message: "isPaid must be a boolean" });
      }
      updateData.isPaid = isPaid;
    }

    // Xác nhận cập nhật
    const updatedBill = await Bills.findByIdAndUpdate(
      billId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Thông báo phòng 
    if (isPaid !== undefined || priceList || debt !== undefined) {
      const room = bill.roomId; 
      const roomAccount = await Account.findOne({ roomId: room._id });
      if (roomAccount) {
        const message = isPaid
          ? `Hóa đơn của phòng ${room.name} đã được cập nhật trạng thái thanh toán thành ${isPaid ? "đã thanh toán" : "chưa thanh toán"}`
          : `Hóa đơn của phòng ${room.name} đã được cập nhật chi tiết (tổng tiền: ${updatedBill.total})`;

        await Notification.create({
          sender: getCurrentUser(req),
          recipients: [{ user: roomAccount._id, isRead: false }],
          message,
          type: "bill",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật hóa đơn thành công!",
      data: updatedBill,
    });
  } catch (error) {
    console.error("Error in UpdateBillDetail:", error);
    next(error);
  }
};
