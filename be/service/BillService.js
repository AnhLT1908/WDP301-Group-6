import Bills from "../model/Bills.js";
import crypto from "crypto";
import Account from "../model/Account.js";
import Notification from "../model/Notification.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import config2 from "../utils/configPayment.js"
import DefaultPrice from "../model/DefaultPrice.js";
import mongoose from "mongoose";
import Contract from "../model/Contract.js";
import sendEmail from "../utils/mailer.js";

export const generateTransactionId = () => {
    return crypto.randomBytes(4).toString('hex').substring(0, 7);
};
  

// Hàm tạo URL QR code
export const generateVietQR = (amount, courseName) => {
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

export const autoCheckBillsAndContracts = async () => {
  try {

    console.log("Bắt đầu kiểm tra hóa đơn và hợp đồng...");
      const now = new Date();
      
      // Lấy tất cả hóa đơn chưa thanh toán
      const unpaidBills = await Bills.find({ isPaid: false }).populate("roomId");

      for (const bill of unpaidBills) {
          const roomId = bill.roomId._id;
          const createdAt = new Date(bill.createdAt);
          const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

          // 1. Sau 30 ngày: Cộng vào debt cho hóa đơn tiếp theo
          if (daysSinceCreation >= 2) {
              const nextBill = await Bills.findOne({
                  roomId,
                  createdAt: { $gt: bill.createdAt },
                  isPaid: false,
              });

              if (nextBill) {
                  if (!nextBill.transactionId) {
                      nextBill.transactionId = `AUTO-${Date.now()}`;
                  }
                  nextBill.debt = (nextBill.debt || 0) + bill.total;
                  nextBill.note = `${nextBill.note || ""} | Nợ từ hóa đơn ${bill.billCode}: ${bill.total}`;
                  await nextBill.save();
              } else if (!bill.logged) {  // Đảm bảo chỉ log một lần
                  console.log(`Hóa đơn ${bill.billCode} quá hạn 30 ngày nhưng chưa có hóa đơn mới để cộng nợ.`);
                  bill.logged = true;   
                  await bill.save();   
              }
          }

          // 2. Sau 60 ngày và > 2 hóa đơn chưa thanh toán: Vô hiệu hóa tài khoản
          if (daysSinceCreation >= 3) {
              const unpaidCount = await Bills.countDocuments({ roomId, isPaid: false });
              if (unpaidCount > 2) {
                  const contactAccount = await Account.findOne({ roomId, isContact: true });
                  if (contactAccount && contactAccount.status !== false) {
                      contactAccount.status = false;
                      await contactAccount.save({ validateBeforeSave: false });
                      await Notification.create({
                          sender: null,
                          recipients: [{ user: contactAccount._id, isRead: false }],
                          message: `Tài khoản của bạn đã bị vô hiệu hóa do có hơn 2 hóa đơn chưa thanh toán quá 60 ngày!`,
                          type: "account_status",
                      });
                  }
              }
          }
      }

      // 3. Kiểm tra tài khoản bị vô hiệu hóa quá 15 ngày: Hủy hợp đồng
      const disabledAccounts = await Account.find({ status: false, isContact: true }).populate("roomId");
      for (const account of disabledAccounts) {
          const roomId = account.roomId?._id;
          if (!roomId) continue;

          const unpaidCount = await Bills.countDocuments({ roomId, isPaid: false });
          if (unpaidCount > 2) {
              const lastUpdate = new Date(account.updatedAt);
              const daysSinceDisabled = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

              if (daysSinceDisabled >= 2) {
                  const contract = await Contract.findOne({ roomId, status: "valid" });
                  if (contract) {
                      contract.status = "expired";
                      await contract.save();
                      await Notification.create({
                          sender: null,
                          recipients: [{ user: account._id, isRead: false }],
                          message: `Hợp đồng của phòng ${account.roomId.name} đã bị hủy do không thanh toán hóa đơn sau 15 ngày bị vô hiệu hóa!`,
                          type: "contract",
                      });
                  }
              }
          }
      }

      console.log("Đã kiểm tra và xử lý hóa đơn/hợp đồng tự động.");
  } catch (error) {
      console.error("Lỗi trong autoCheckBillsAndContracts:", error);
  }
};

export const addBillinRoom = async (req, res, next) => {
  try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId).populate('house');

      if (!room) {
          return res.status(404).json({ message: "Không tìm thấy phòng." });
      }

      if (!room.house || !mongoose.Types.ObjectId.isValid(room.house)) {
          return res.status(400).json({ message: `Phòng ${room.name} không có houseId!` });
      }

      const existingBill = await Bills.findOne({ roomId, isPaid: false });
      if (existingBill) {
          return res.status(400).json({
              success: false,
              message: "Phòng này đã có hóa đơn chưa thanh toán. Vui lòng thanh toán trước khi tạo hóa đơn mới!",
              existingBill,
          });
      }

      const { note, debt = 0, paymentMethod, customPriceList } = req.body;

      // Kiểm tra hóa đơn cũ quá 30 ngày để cộng debt
      const now = new Date();
      const oldBills = await Bills.find({ roomId, isPaid: false });
      let accumulatedDebt = debt;
      for (const oldBill of oldBills) {
          const daysSinceCreation = Math.floor((now - new Date(oldBill.createdAt)) / (1000 * 60 * 60 * 24));
          if (daysSinceCreation >= 30) {
              accumulatedDebt += oldBill.total;
          }
      }

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
      } else {
          const electricityUsage = room.priceList.monthlyElectricityUsage.length > 0
              ? room.priceList.monthlyElectricityUsage[room.priceList.monthlyElectricityUsage.length - 1].value
              : 0;
          const waterUsage = room.priceList.monthlyWaterUsage.length > 0
              ? room.priceList.monthlyWaterUsage[room.priceList.monthlyWaterUsage.length - 1].value
              : 0;
          const serviceUsage = room.priceList.monthlyServiceUsage.length > 0
              ? room.priceList.monthlyServiceUsage[room.priceList.monthlyServiceUsage.length - 1].value
              : 0;
          const internetUsage = room.priceList.monthlyInternetUsage.length > 0
              ? room.priceList.monthlyInternetUsage[room.priceList.monthlyInternetUsage.length - 1].value
              : 0;
          priceList = [
              { name: "electricity", price: defaultPriceMap.electricity?.price || 0, usage: electricityUsage, total: (defaultPriceMap.electricity?.price || 0) * electricityUsage },
              { name: "water", price: defaultPriceMap.water?.price || 0, usage: waterUsage, total: (defaultPriceMap.water?.price || 0) * waterUsage },
              { name: "service", price: defaultPriceMap.service?.price || 0, usage: serviceUsage, total: (defaultPriceMap.service?.price || 0) * serviceUsage },
              { name: "internet", price: defaultPriceMap.internet?.price || 0, usage: internetUsage, total: (defaultPriceMap.internet?.price || 0) * internetUsage },
          ];
      }

      const utilitiesTotal = priceList.reduce((sum, item) => sum + item.total, 0);
      const totalAmount = room.priceList.roomPrice + utilitiesTotal + accumulatedDebt;

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
          debt: accumulatedDebt,
          total: totalAmount,
          note: accumulatedDebt > debt ? `${note || ""} | Có nợ từ hóa đơn cũ: ${accumulatedDebt - debt}` : note,
          paymentLink: qrUrl,
          transactionId: transactionId,
          isPaid: false,
          paymentMethod: paymentMethod || "Unknown",
      });
      await bill.save();

      // Tìm tài khoản người đại diện hoặc tất cả Lodger trong phòng
      const contactAccount = await Account.findOne({ roomId: roomId, isContact: true }) || await Account.findOne({ roomId: roomId });
      if (!contactAccount) {
          return res.status(404).json({
              message: "Không tìm thấy người đại diện cho phòng này!",
          });
      }

      // Gửi thông báo trong hệ thống
      await Notification.create({
          sender: getCurrentUser(req),
          recipients: [{ user: contactAccount._id, isRead: false }],
          message: `Một hóa đơn phòng ${room.name} đã được tạo (Tổng: ${totalAmount} VND)`,
          type: "bill",
      });
      // ${priceList.map(item => `- ${item.name}: ${item.total} VND (${item.usage} ${defaultPriceMap[item.name]?.unit || ''})`).join('\n')}

      // Chuẩn bị nội dung email
      const billDetails = `
          Hóa đơn phòng: ${room.name}
          Mã hóa đơn: ${billCode}
          Tiền phòng: ${room.priceList.roomPrice} VND
          Nợ cũ: ${accumulatedDebt} VND
          Tổng tiền: ${totalAmount} VND
          Link thanh toán: ${qrUrl}
          Ghi chú: ${bill.note || "Không có ghi chú"}
      `;
      const emailSubject = `Hóa đơn phòng ${room.name} - ${billCode}`;
      const emailText = `
          Kính gửi ${contactAccount.firstName} ${contactAccount.lastName},
          
          Một hóa đơn mới đã được tạo cho phòng ${room.name}. Dưới đây là chi tiết:
          
          ${billDetails}
          
          Vui lòng thanh toán trước khi hết hạn để tránh các khoản phí trễ hạn.
          Trân trọng,
          Đội ngũ quản lý nhà trọ
      `;

      // Gửi email đến người đại diện
      await sendEmail({
          from: "WDPGroup6@gmail.com",
          to: contactAccount.email,
          subject: emailSubject,
          text: emailText,
      });

      res.status(201).json({
          success: true,
          data: bill,
          qrUrl,
          transactionId,
          paymentDescription,
      });
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

export const autoConfirmBill = async(billId, paymentMethod = "Banking") =>{
    try {
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
                sender: null,
                recipients: [{ user: roomAccount.id, isRead: false }],
                message: `Hóa đơn của phòng ${room.name} đã được thanh toán bằng ${paymentMethod === "Cash" ? "Tiền mặt" : "Chuyển khoản"}.`,
                type: "bill",
            });
  
            res.json(bill);
      } catch (error) {
        next(error)
      }
}

//Webhook EndPoint
export const handleWebHook = async(req, res, next) =>{
  try {
    const {data} = req.body;
    console.log("Webhook từ Casso:", data);
    //Kiểm tra tính hợp lệ của ApiKey và Webhook
    const apiKey = process.env.CASSO_API_KEY;
    const signature = req.header["x-api-key"]
    if(signature !== apiKey){
      return res.status(401).json({ message: "Xác thực webhook thất bại!" });
    }
    const {description, amount} = data;
    const transactionMatch = description.match(/Mã giao dịch (\w+)/);
    if(!transactionMatch){
      return res.status(400).json({
        message: "Không tìm thấy transactionId trong mô tả"
      })
    }

    const transactionId = transactionMatch[1];
    const bill = await Bills.findOne({transactionId});

    if(!bill){
      res.status(404).json({
        message: "Không tìm thấy hóa đơn khớp với transactionId"
      })
    }

    if(bill.total !== amount){
      res.status(404).json({
        message: "Số tiền chuyển khoản không khớp với hóa đơn"
      })
    }

    const updateBill = await autoConfirmBill(bill._id, "Banking");

    return res.status(200).json({
      success: true,
      message:"Hóa đơn đã gửi thành công",
      data: updateBill
    })
  } catch (error) {
    console.error("Lỗi trong webhook:", error);
    return res.status(500).json({ message: "Lỗi xử lý webhook!" });
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
