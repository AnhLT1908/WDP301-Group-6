import Bills from "../model/Bills.js";
import crypto from "crypto";
import Account from "../model/Account.js";
import Notification from "../model/Notification.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import config2 from "../utils/configPayment.js";
import DefaultPrice from "../model/DefaultPrice.js";
import mongoose from "mongoose";
import Contract from "../model/Contract.js";
import sendEmail from "../utils/mailer.js";
import axios from "axios";

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
    courseName
  )}&accountName=${encodeURIComponent(config2.bankInfo.accountName)}`;

  return { qrUrl, transactionId };
};

export const getTransactions = async (req, res, next) => {
  try {
    // Lấy API key từ biến môi trường hoặc config
    const apiKey = process.env.CASSO_API_KEY || config2.cassoApiKey;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Chưa cấu hình API key cho Casso",
        data: null,
      });
    }

    // Lấy các tham số từ query
    const {
      sort = "ASC",
      pageSize = 10,
      page = 1,
      fromDate,
      toDate,
    } = req.query;

    // Xây dựng URL với các query params
    let url = "https://oauth.casso.vn/v2/transactions";
    const params = new URLSearchParams();

    if (sort) params.append("sort", sort);
    if (pageSize) params.append("pageSize", pageSize);
    if (page) params.append("page", page);

    // Xử lý rõ ràng cho fromDate và toDate
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    // Thêm query params vào URL
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(`Calling Casso API with URL: ${url}`); // Debug log

    // Gọi API Casso
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Apikey ${apiKey}`,
      },
    });

    // Kiểm tra và xử lý phản hồi từ API
    const { data } = response;

    console.log("Data casso", data);

    if (data.error !== 0) {
      return res.status(400).json({
        success: false,
        message: data.message || "Lỗi khi lấy dữ liệu từ Casso API",
        data: null,
      });
    }

    // Thành công, trả về dữ liệu cho client
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      data: data.data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giao dịch:", error);

    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      // Lỗi từ API Casso
      const { status, data } = error.response;

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: "API key không hợp lệ hoặc đã hết hạn",
          data: null,
        });
      }

      return res.status(status).json({
        success: false,
        message: data.message || "Lỗi từ API Casso",
        data: null,
      });
    }

    // Lỗi kết nối hoặc lỗi khác
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi kết nối đến API Casso",
      data: null,
    });
  }
};

export const getAllBill = async (req, res, next) => {
  try {
    const allBill = await Bills.find().populate("roomId");
    res.status(200).json({
      success: true,
      count: allBill.length,
      data: allBill,
    });
  } catch (error) {
    next(error);
  }
};

//get bill detail by id
export const getOneBill = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const oneBill = await Bills.findById(billId)
      .populate("roomId")
      .populate("houseId");
    res.status(200).json({
      success: true,
      data: oneBill,
    });
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
          if (daysSinceCreation >= 2) { // Để test, đang dùng 2 ngày thay vì 30
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

                  // Kiểm tra và bổ sung priceList nếu rỗng
                  if (!nextBill.priceList || nextBill.priceList.length === 0) {
                      nextBill.priceList = [{
                          name: "default", // Giá trị mặc định
                          price: 0,        // Giá trị mặc định
                          usage: 0,
                          total: 0         // Giá trị mặc định
                      }];
                  }

                  await nextBill.save();
              } else if (!bill.logged) {
                  console.log(`Hóa đơn ${bill.billCode} quá hạn 30 ngày nhưng chưa có hóa đơn mới để cộng nợ.`);
                  bill.logged = true;
                  await bill.save();
              }
          }

          // 2. Sau 60 ngày và > 2 hóa đơn chưa thanh toán: Vô hiệu hóa tài khoản
          if (daysSinceCreation >= 3) { // Để test, đang dùng 3 ngày thay vì 60
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

              if (daysSinceDisabled >= 2) { // Để test, đang dùng 2 ngày thay vì 15
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
      const roomId = req.params.roomId || req.body.roomId;
      const { note, debt = 0, paymentMethod, customPriceList } = req.body;

      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
          return res.status(400).json({
              success: false,
              message: "roomId không hợp lệ hoặc thiếu!",
          });
      }

      const now = new Date();
      const room = await Room.findById(roomId).populate("house");
      if (!room) {
          return res.status(404).json({ message: "Phòng không tồn tại!" });
      }

      const oldBills = await Bills.find({ roomId, isPaid: false });
      let accumulatedDebt = Number(debt); // Ép kiểu debt thành số
      oldBills.forEach((bill) => {
          const daysSinceCreation = Math.floor((now - new Date(bill.createdAt)) / (1000 * 60 * 60 * 24));
          if (daysSinceCreation >= 30) accumulatedDebt += Number(bill.total); // Ép kiểu total thành số
      });

      const defaultPrices = await DefaultPrice.find();
      const defaultPriceMap = defaultPrices.reduce((map, price) => {
          map[price.name] = { price: Number(price.price), unit: price.unit }; // Ép kiểu price thành số
          return map;
      }, {});

      let priceList = [];
      if (customPriceList && Array.isArray(customPriceList)) {
          priceList = customPriceList.map((item) => {
              const { price = 0, unit = "" } = defaultPriceMap[item.name] || {};
              const usage = Number(item.usage) || 0; // Ép kiểu usage thành số
              const finalPrice = item.price !== undefined ? Number(item.price) : price; // Ép kiểu price thành số
              const total = unit === "đồng/tháng" || usage === 0 ? finalPrice : finalPrice * usage;
              return { name: item.name, price: finalPrice, usage, total };
          });
      } else {
          const { monthlyElectricityUsage, monthlyWaterUsage, monthlyServiceUsage, monthlyInternetUsage } = room.priceList;
          priceList = [
              { name: "electricity", usage: Number(monthlyElectricityUsage.at(-1)?.value) || 0 },
              { name: "water", usage: Number(monthlyWaterUsage.at(-1)?.value) || 0 },
              { name: "service", usage: Number(monthlyServiceUsage.at(-1)?.value) || 0 },
              { name: "internet", usage: Number(monthlyInternetUsage.at(-1)?.value) || 0 },
          ].map((item) => {
              const { price = 0, unit = "" } = defaultPriceMap[item.name] || {};
              const total = unit === "đồng/tháng" || item.usage === 0 ? price : price * item.usage;
              return { ...item, price, total };
          });
      }

      const utilitiesTotal = priceList.reduce((sum, item) => sum + Number(item.total), 0); // Ép kiểu total thành số
      const totalAmount = Number(room.priceList.roomPrice) + utilitiesTotal + accumulatedDebt; // Ép kiểu roomPrice thành số

      const transactionId = generateTransactionId();
      const billCode = `BILL-${roomId}-${Date.now()}-${transactionId}`;
      const paymentDescription = `Thanh toán tiền phòng ${room.house.name} - ${room.name}`;
      const { qrUrl } = generateVietQR(totalAmount, paymentDescription);

      const bill = new Bills({
          roomId,
          houseId: room.house._id,
          billCode,
          roomPrice: Number(room.priceList.roomPrice), // Ép kiểu thành số
          priceList,
          debt: accumulatedDebt,
          total: totalAmount,
          note: accumulatedDebt > debt ? `${note || ""} | Nợ cũ: ${accumulatedDebt - debt}` : note,
          paymentLink: qrUrl,
          transactionId,
          isPaid: false,
          paymentMethod: paymentMethod || "Unknown",
      });

      await bill.save();

      const contactAccount = await Account.findOne({ roomId, isContact: true }) || await Account.findOne({ roomId });
      if (contactAccount) {
          await Notification.create({
              sender: getCurrentUser(req),
              recipients: [{ user: contactAccount._id, isRead: false }],
              message: `Hóa đơn phòng ${room.name} đã được tạo (Tổng: ${totalAmount} VND)`,
              type: "bill",
          });

          const emailText = `
              Kính gửi ${contactAccount.firstName} ${contactAccount.lastName},
              Một hóa đơn mới đã được tạo cho phòng ${room.name}.
              Mã hóa đơn: ${billCode}
              Tổng tiền: ${totalAmount} VND
              Link thanh toán: ${qrUrl}
          `;

          await sendEmail({
              from: "WDPGroup6@gmail.com",
              to: contactAccount.email,
              subject: `Hóa đơn phòng ${room.name} - ${billCode}`,
              text: emailText,
          });
      }

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

    const roomBills = await Bills.find({ roomId }).sort({ createdAt: -1 });

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
      return res
        .status(400)
        .json({ success: false, message: "Invalid billId" });
    }

    // tìm bill
    const bill = await Bills.findById(billId).populate("roomId");
    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hóa đơn" });
    }

    // Xác định trường nào được cập nahajt
    const allowedFields = [
      "priceList",
      "note",
      "debt",
      "paymentMethod",
      "isPaid",
    ];
    const updateData = {};
    const updateKeys = Object.keys(req.body);
    const isValidUpdate = updateKeys.every((key) =>
      allowedFields.includes(key)
    );
    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: `Invalid update fields. Allowed: ${allowedFields.join(", ")}`,
      });
    }

    // Kiểm tra Pricelisst
    if (priceList) {
      if (!Array.isArray(priceList)) {
        return res
          .status(400)
          .json({ success: false, message: "priceList phải là một mảng" });
      }
      updateData.priceList = priceList.map((item) => {
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
      const totalUnits = updateData.priceList.reduce(
        (sum, item) => sum + (item.totalUnit || 0),
        0
      );
      updateData.total =
        bill.roomPrice + totalUnits + (debt !== undefined ? debt : bill.debt);
    }

    // Cập nhật các trường kahcs
    if (note !== undefined) updateData.note = note;
    if (debt !== undefined) {
      updateData.debt = debt;
      if (!priceList)
        updateData.total =
          bill.roomPrice +
          bill.priceList.reduce((sum, item) => sum + (item.totalUnit || 0), 0) +
          debt;
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
        return res
          .status(400)
          .json({ success: false, message: "isPaid must be a boolean" });
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
          ? `Hóa đơn của phòng ${
              room.name
            } đã được cập nhật trạng thái thanh toán thành ${
              isPaid ? "đã thanh toán" : "chưa thanh toán"
            }`
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

export const updateBillPaymentStatus = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { isPaid, note } = req.body;

    // Input validation
    if (isPaid === undefined) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    // Verify bill exists before updating
    const billExists = await Bills.findById(billId);
    if (!billExists) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Perform targeted update with field validation
    const updatedBill = await Bills.findByIdAndUpdate(
      billId,
      {
        isPaid: Boolean(isPaid),
        note: note !== undefined ? note : billExists.note,
      },
      {
        new: true,
        runValidators: true,
      }
    );


    // Return updated bill data
    res.status(200).json({
      success: true,
      data: updatedBill,
      message: "Bill payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating bill payment status:", error);
    next(error);
  }
};
