import Bills from "../model/Bills.js";
import crypto from "crypto";
import Account from "../model/Account.js";
import Notification from "../model/Notification.js";
import Room from "../model/Room.js";
import getCurrentUser from "../utils/getCurrentUser.js";
import config2 from "../utils/configPayment.js";
import DefaultPrice from "../model/DefaultPrice.js";
import mongoose from "mongoose";
import axios from "axios";
import sendEmail from "../utils/mailer.js";

export const generateTransactionId = () => {
  return crypto.randomBytes(4).toString("hex").substring(0, 7);
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
    next(error);
  }
};

export const getBillsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    console.log("roomBills roomId", roomId);

    const roomBills = await Bills.find({ roomId })
      .populate("roomId")
      .populate("houseId")
      .sort({ createdAt: -1 });

    console.log("roomBills", roomBills);

    res.status(200).json({
      success: true,
      count: roomBills.length,
      data: roomBills,
    });
  } catch (error) {
    console.error("Lỗi trong getBillsByRoom:", error);
  }
};

export const autoCheckBillsAndContracts = async () => {
  try {
    console.log("Bắt đầu kiểm tra hóa đơn và hợp đồng...");
    const now = new Date();

    // Lấy tất cả hóa đơn chưa thanh toán
    const unpaidBills = await Bills.find({ isPaid: false }).populate("roomId");

    for (const bill of unpaidBills) {
      const roomId = bill.roomId._id;
      const createdAt = new Date(bill.createdAt);
      const daysSinceCreation = Math.floor(
        (now - createdAt) / (1000 * 60 * 60 * 24)
      );

      // 1. Sau 30 ngày: Cộng vào debt cho hóa đơn tiếp theo
      if (daysSinceCreation >= 2) {
        // Để test, đang dùng 2 ngày thay vì 30
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
          nextBill.note = `${nextBill.note || ""} | Nợ từ hóa đơn ${
            bill.billCode
          }: ${bill.total}`;

          // Kiểm tra và bổ sung priceList nếu rỗng
          if (!nextBill.priceList || nextBill.priceList.length === 0) {
            nextBill.priceList = [
              {
                name: "default", // Giá trị mặc định
                price: 0, // Giá trị mặc định
                usage: 0,
                total: 0, // Giá trị mặc định
              },
            ];
          }

          await nextBill.save();
        } else if (!bill.logged) {
          console.log(
            `Hóa đơn ${bill.billCode} quá hạn 30 ngày nhưng chưa có hóa đơn mới để cộng nợ.`
          );
          bill.logged = true;
          await bill.save();
        }
      }

      // 2. Sau 60 ngày và > 2 hóa đơn chưa thanh toán: Vô hiệu hóa tài khoản
      if (daysSinceCreation >= 3) {
        // Để test, đang dùng 3 ngày thay vì 60
        const unpaidCount = await Bills.countDocuments({
          roomId,
          isPaid: false,
        });
        if (unpaidCount > 2) {
          const contactAccount = await Account.findOne({
            roomId,
            isContact: true,
          });
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
    const disabledAccounts = await Account.find({
      status: false,
      isContact: true,
    }).populate("roomId");
    for (const account of disabledAccounts) {
      const roomId = account.roomId?._id;
      if (!roomId) continue;

      const unpaidCount = await Bills.countDocuments({ roomId, isPaid: false });
      if (unpaidCount > 2) {
        const lastUpdate = new Date(account.updatedAt);
        const daysSinceDisabled = Math.floor(
          (now - lastUpdate) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceDisabled >= 2) {
          // Để test, đang dùng 2 ngày thay vì 15
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
    // Destructuring các thông tin từ request body
    const {
      note,
      debt,
      paymentMethod,
      customPriceList,
      previousMonthUsage,
      roomId,
    } = req.body;
    console.log("CustomPriceList", req.body);

    // Tìm phòng theo ID và populate thông tin nhà (house) liên quan
    const room = await Room.findById(roomId).populate("house");
    console.log("Room bill ", room);
    // Kiểm tra xem phòng có tồn tại không
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }

    // Kiểm tra tính hợp lệ của house ID
    if (!room.house || !mongoose.Types.ObjectId.isValid(room.house)) {
      return res
        .status(400)
        .json({ message: `Phòng ${room.name} không có houseId!` });
    }

    // Lấy danh sách giá mặc định từ cơ sở dữ liệu
    const defaultPrices = await DefaultPrice.find();

    console.log("defaultPrices", defaultPrices);

    // Chuyển đổi danh sách giá mặc định thành một map để tra cứu nhanh
    const defaultPriceMap = defaultPrices.reduce((map, price) => {
      map[price.name] = { price: price.price, unit: price.unit };
      return map;
    }, {});
    console.log("defaultPriceMap", defaultPriceMap);

    // Khởi tạo mảng danh sách giá
    let priceList = [];

    // Xử lý danh sách giá tùy chỉnh nếu được cung cấp
    if (customPriceList && Array.isArray(customPriceList)) {
      // Ánh xạ danh sách giá tùy chỉnh
      priceList = customPriceList.map((item) => {
        // Lấy giá mặc định hoặc sử dụng giá được cung cấp
        const defaultPrice = defaultPriceMap[item.name] || {
          price: item.price || 0,
          unit: "",
        };

        // Tính usage = previousMonthUsage[name] - currentUsage
        const previousUsage = previousMonthUsage[item.name] || 0;
        console.log("previousUsage", previousMonthUsage[item.name]);
        const strUsage = item.currentUsage || "0"; // usage is now a string (strUsage)

        const usage = parseInt(strUsage); // Create a separate variable for usage
        const differentUsage = usage - previousUsage; // Calculate the difference in usage
        console.log("previousUsage", previousUsage);
        console.log("usage", usage); // log usage for debugging
        console.log("differentUsage", differentUsage); // log differentUsage for debugging

        const price =
          item.price !== undefined ? item.price : defaultPrice.price;
        let total;

        // Log thông tin để debug
        console.log(`Processing ${item.name}:`, {
          defaultPrice,
          price,
          differentUsage,
        });

        // Tính toán tổng tiền dựa trên đơn vị
        switch (defaultPrice.unit) {
          case "đồng/kWh": {
            total = price * differentUsage;
            break;
          }
          case "đồng/khối": {
            total = price * differentUsage;
            break;
          }
          case "đồng/người": {
            total = price * differentUsage;
            break;
          }
          case "đồng/tháng": {
            total = price * differentUsage;
            break;
          }
          default: {
            if (differentUsage > 0) {
              total = price * differentUsage;
            } else {
              total = price;
            }
            break;
          }
        }

        console.log("Total", total);
        return { name: item.name, price, usage, total };
      });
    } else {
      // Nếu không có danh sách giá tùy chỉnh, sử dụng giá trị từ thông tin phòng
      const electricityUsage =
        room.priceList.monthlyElectricityUsage.length > 0
          ? room.priceList.monthlyElectricityUsage[
              room.priceList.monthlyElectricityUsage.length - 1
            ].value
          : 0;
      const waterUsage =
        room.priceList.monthlyWaterUsage.length > 0
          ? room.priceList.monthlyWaterUsage[
              room.priceList.monthlyWaterUsage.length - 1
            ].value
          : 0;
      const serviceUsage =
        room.priceList.monthlyServiceUsage.length > 0
          ? room.priceList.monthlyServiceUsage[
              room.priceList.monthlyServiceUsage.length - 1
            ].value
          : 0;
      const InternetUsage =
        room.priceList.monthlyInternetUsage.length > 0
          ? room.priceList.monthlyInternetUsage[
              room.priceList.monthlyInternetUsage.length - 1
            ].value
          : 0;

      priceList = [
        {
          name: "electricity",
          price: defaultPriceMap.electricity?.price || 0,
          usage: electricityUsage,
          total: (defaultPriceMap.electricity?.price || 0) * electricityUsage,
        },
        {
          name: "water",
          price: defaultPriceMap.water?.price || 0,
          usage: waterUsage,
          total: (defaultPriceMap.water?.price || 0) * waterUsage,
        },
        {
          name: "service",
          price: defaultPriceMap.service?.price || 0,
          usage: serviceUsage,
          total: (defaultPriceMap.service?.price || 0) * serviceUsage,
        },
        {
          name: "internet",
          price: defaultPriceMap.internet?.price || 0,
          usage: InternetUsage,
          total: (defaultPriceMap.internet?.price || 0) * InternetUsage,
        },
      ];
    }

    console.log("Default price list", priceList);

    // Tính tổng tiền tiện ích
    const utilitiesTotal = priceList.reduce((sum, item) => sum + item.total, 0);
    // Tính tổng số tiền (tiền phòng + tiện ích + nợ)
    const intDebt = parseInt(debt);
    console.log("Room price:", room.priceList.roomPrice);
    console.log("Utlities total:", utilitiesTotal);
    console.log("Debt", typeof intDebt);
    console.log("========================================");
    const totalAmount = room.priceList.roomPrice + utilitiesTotal + intDebt;
    console.log("========================================");
    console.log("totalAmount", totalAmount);
    // Sinh mã giao dịch và mã hóa đơn

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const formattedMonth = currentMonth.toString().padStart(2, "0");
    console.log("date", currentMonth);

    const transactionId = generateTransactionId();
    console.log("transactionId", transactionId);
    const billCode = `BILL-${roomId}-${Date.now()}-${transactionId}`;


    // Tạo mô tả thanh toán
    const paymentDescription = `${room._id}.${transactionId}`;

    // Sinh URL QR thanh toán
    const { qrUrl } = generateVietQR(totalAmount, paymentDescription);

    // Tạo mới hóa đơn
    const bill = new Bills({
      roomId,
      houseId: room.house._id,
      billCode,
      roomPrice: room.priceList.roomPrice,
      priceList,
      debt,
      total: totalAmount,
      note,
      transactionId,
      paymentLink: qrUrl,
      isPaid: false,
      paymentMethod: paymentMethod || "Unknown",
    });
    // Lưu hóa đơn vào cơ sở dữ liệu
    console.log("Bill", bill);
    await bill.save();

    // Tìm tài khoản của phòng
    const contactAccount =
      (await Account.findOne({ roomId, isContact: true })) ||
      (await Account.findOne({ roomId }));
    console.log("Find contact account", contactAccount);
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

export const confirmBill = async (req, res, next) => {
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
      message: `Hóa đơn của phòng ${room.name} đã được thanh toán bằng ${
        paymentMethod === "Cash" ? "Tiền mặt" : "Chuyển khoản"
      }.`,
      type: "bill",
    });

    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const autoConfirmBill = async (billId, paymentMethod = "Banking") => {
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
      message: `Hóa đơn của phòng ${room.name} đã được thanh toán bằng ${
        paymentMethod === "Cash" ? "Tiền mặt" : "Chuyển khoản"
      }.`,
      type: "bill",
    });

    res.json(bill);
  } catch (error) {
    next(error);
  }
};

//Webhook EndPoint
export const handleWebHook = async (req, res, next) => {
  try {
    const { data } = req.body;
    console.log("Webhook từ Casso:", data);
    //Kiểm tra tính hợp lệ của ApiKey và Webhook
    const apiKey = process.env.CASSO_API_KEY;
    const signature = req.header["x-api-key"];
    if (signature !== apiKey) {
      return res.status(401).json({ message: "Xác thực webhook thất bại!" });
    }
    const { description, amount } = data;
    const transactionMatch = description.match(/Mã giao dịch (\w+)/);
    if (!transactionMatch) {
      return res.status(400).json({
        message: "Không tìm thấy transactionId trong mô tả",
      });
    }

    const transactionId = transactionMatch[1];
    const bill = await Bills.findOne({ transactionId });

    if (!bill) {
      res.status(404).json({
        message: "Không tìm thấy hóa đơn khớp với transactionId",
      });
    }

    if (bill.total !== amount) {
      res.status(404).json({
        message: "Số tiền chuyển khoản không khớp với hóa đơn",
      });
    }

    const updateBill = await autoConfirmBill(bill._id, "Banking");

    return res.status(200).json({
      success: true,
      message: "Hóa đơn đã gửi thành công",
      data: updateBill,
    });
  } catch (error) {
    console.error("Lỗi trong webhook:", error);
    return res.status(500).json({ message: "Lỗi xử lý webhook!" });
  }
};

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
