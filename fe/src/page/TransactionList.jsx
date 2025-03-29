import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransactionList = () => {
  // Lưu trữ các giao dịch được tải từ API
  const [transactions, setTransactions] = useState([]);
  // Quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Lưu trữ danh sách hóa đơn phòng
  const [roomBillList, setRoomBillList] = useState([]);
  // Lưu trữ các giao dịch có chứa mã phòng khớp với danh sách hóa đơn
  const [matchingTransactions, setMatchingTransactions] = useState([]);
  // Đếm ngược để tải lại trang
  const [countdown, setCountdown] = useState(60);
  // Theo dõi các ID phòng đang được tải để tránh gọi trùng lặp
  const fetchingRoomIds = useRef(new Set());
  // Theo dõi các ID hóa đơn đã tồn tại để tránh thêm trùng lặp
  const existingBillIds = useRef(new Set());
  const navigate = useNavigate();

  // Trích xuất mã ID phòng từ mô tả giao dịch
  // Format ID: chuỗi 24 ký tự alphanumeric (thường là ObjectId của MongoDB)
  const extractRoomId = (description) => {
    if (!description) {
      return null;
    }

    const matches = [...description.matchAll(/(\w{24})/gi)];

    if (matches.length === 0) {
      return null;
    }

    return matches[matches.length - 1][0].toLowerCase();
  };

  // Trích xuất mã ID phòng từ đối tượng hóa đơn
  // Xử lý cả các trường hợp: originalRoomId, roomId là object, roomId là string
  const extractBillRoomId = (bill) => {
    if (bill.originalRoomId) {
      return bill.originalRoomId;
    }

    if (typeof bill.roomId === "object" && bill.roomId !== null) {
      return bill.roomId._id;
    }

    if (typeof bill.roomId === "string") {
      return bill.roomId;
    }

    return null;
  };

  // Tích hợp thông tin giao dịch với thông tin hóa đơn phòng
  // Kết quả: danh sách giao dịch đã được bổ sung thêm thông tin từ hóa đơn liên quan
  const getIntegratedRecords = () => {
    if (!matchingTransactions.length) return [];

    // Tạo map giữa ID phòng và hóa đơn để tìm kiếm nhanh
    const roomIdToBillMap = new Map();

    roomBillList.forEach((bill) => {
      const billRoomId = extractBillRoomId(bill);
      if (billRoomId) {
        roomIdToBillMap.set(billRoomId.toLowerCase(), bill);
      }
    });

    // Ánh xạ từng giao dịch sang bản ghi tích hợp có đầy đủ thông tin
    return matchingTransactions.map((transaction) => {
      const transactionRoomId = extractRoomId(transaction.description);
      const relatedBill = transactionRoomId
        ? roomIdToBillMap.get(transactionRoomId.toLowerCase())
        : null;
      // Xác định ID phòng thực tế từ giao dịch hoặc hóa đơn liên quan
      let actualRoomId = null;
      if (relatedBill) {
        if (relatedBill.originalRoomId) {
          actualRoomId = relatedBill.originalRoomId;
        } else if (
          typeof relatedBill.roomId === "object" &&
          relatedBill.roomId !== null
        ) {
          actualRoomId = relatedBill.roomId._id;
        } else if (typeof relatedBill.roomId === "string") {
          actualRoomId = relatedBill.roomId;
        }
      } else if (transactionRoomId) {
        const originalCaseRoomId =
          transaction.description.match(/(\w{24})/i)?.[1];
        actualRoomId = originalCaseRoomId || transactionRoomId;
      }

      // Chuyển đổi timestamp thành định dạng ngày giờ Việt Nam
      const transactionDate = transaction.when
        ? new Date(transaction.when).toLocaleString("vi-VN")
        : transaction.tid
        ? new Date(
            parseInt(transaction.tid.split("-")[0]) * 1000
          ).toLocaleString("vi-VN")
        : "N/A";

      // Trả về đối tượng giao dịch đã tích hợp thêm thông tin hóa đơn
      return {
        ...transaction,
        transactionDate,
        relatedBill,
        billId: relatedBill?._id,
        // Tên phòng: lấy từ đối tượng roomId nếu có hoặc rút gọn từ ID phòng
        roomName: relatedBill
          ? typeof relatedBill.roomId === "object" &&
            relatedBill.roomId !== null
            ? relatedBill.roomId.name || "Unknown Room"
            : "Room " +
              (
                relatedBill.originalRoomId ||
                relatedBill.roomId ||
                ""
              ).substring(0, 6)
          : "Not Found",
        billCode: relatedBill?.billCode || "N/A",
        // Trạng thái hóa đơn: đã cập nhật / cần cập nhật
        billStatus:
          relatedBill?.isPaid === true
            ? "Đã cập nhật"
            : relatedBill?.isPaid === false
            ? "Cần cập nhật"
            : "N/A",
        // Class màu sắc cho trạng thái hóa đơn
        billStatusClass:
          relatedBill?.isPaid === true
            ? "bg-green-100 text-green-800"
            : relatedBill?.isPaid === false
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800",
      };
    });
  };

  // Lọc các giao dịch có chứa ID phòng trùng khớp với ID trong danh sách hóa đơn
  const extractTransactionsWithMatchingRoomIds = () => {
    if (!transactions.length || !roomBillList.length) {
      console.log("No transactions or room bills available for matching");
      return [];
    }

    // Tạo set chứa tất cả ID phòng từ danh sách hóa đơn
    const roomIdSet = new Set();

    roomBillList.forEach((bill) => {
      if (typeof bill.roomId === "object" && bill.roomId !== null) {
        roomIdSet.add(bill.roomId._id.toLowerCase());
      }

      if (typeof bill.roomId === "string") {
        roomIdSet.add(bill.roomId.toLowerCase());
      }

      if (bill.originalRoomId) {
        roomIdSet.add(bill.originalRoomId.toLowerCase());
      }
    });

    console.log(`Found ${roomIdSet.size} unique room IDs in roomBillList`);

    // Lọc giao dịch có chứa ID phòng thuộc roomIdSet
    const matchingTransactions = transactions.filter((transaction) => {
      if (!transaction.description) return false;

      const extractedRoomId = extractRoomId(transaction.description);
      return extractedRoomId && roomIdSet.has(extractedRoomId);
    });

    console.log(
      `Found ${matchingTransactions.length} transactions with matching room IDs`
    );

    return matchingTransactions;
  };

  // Cập nhật matchingTransactions khi transactions hoặc roomBillList thay đổi
  useEffect(() => {
    const matches = extractTransactionsWithMatchingRoomIds();
    setMatchingTransactions(matches);
  }, [transactions, roomBillList]);

  // Lấy thông tin hóa đơn cho một phòng cụ thể từ API
  const fetchRoomBill = async (roomId) => {
    try {
      // Kiểm tra nếu đang trong quá trình fetch dữ liệu phòng này thì bỏ qua
      if (fetchingRoomIds.current.has(roomId)) {
        console.log(`Fetch for room ${roomId} already in progress, skipping`);
        return;
      }

      // Đánh dấu đang fetch dữ liệu cho phòng này
      fetchingRoomIds.current.add(roomId);
      console.log(`Starting fetch for room ${roomId}`);

      // Gọi API lấy thông tin hóa đơn cho phòng
      const response = await axios.get(
        `http://localhost:5000/api/v1/bill/roomBill/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(`Room bill response for ${roomId}:`, response.data);
      const data = response.data;

      if (data && data.data.length > 0) {
        console.log("Sample populated bill:", data.data[0]);
        console.log("Room data in populated bill:", data.data[0].roomId);

        // Lọc các hóa đơn chưa tồn tại trong state
        const newBills = data.data.filter(
          (bill) => !existingBillIds.current.has(bill._id)
        );

        if (newBills.length > 0) {
          // Thêm originalRoomId để tham chiếu ngược về phòng
          const billsWithOriginalRoomId = newBills.map((bill) => ({
            ...bill,
            originalRoomId: roomId,
          }));

          // Cập nhật existingBillIds để tránh trùng lặp
          newBills.forEach((bill) => existingBillIds.current.add(bill._id));

          // Cập nhật state với các hóa đơn mới
          setRoomBillList((prevBills) => [
            ...prevBills,
            ...billsWithOriginalRoomId,
          ]);
          console.log(`Added ${newBills.length} new bills for room ${roomId}`);
        } else {
          console.log(`No new bills to add for room ${roomId}`);
        }
      }
    } catch (error) {
      console.error(`Error fetching room bill for ${roomId}:`, error);
    } finally {
      // Loại bỏ đánh dấu đang fetch cho phòng này
      fetchingRoomIds.current.delete(roomId);
      console.log(`Completed fetch for room ${roomId}`);
    }
  };

  // Ghi log khi roomBillList thay đổi
  useEffect(() => {
    console.log("roomBillList updated:", roomBillList);
    const uniqueBillIds = new Set(roomBillList.map((bill) => bill._id));
    console.log(
      `Total bills: ${roomBillList.length}, Unique bills: ${uniqueBillIds.size}`
    );
  }, [roomBillList]);

  // Thiết lập đếm ngược tự động reload
  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Lấy danh sách giao dịch từ API
  const fetchTransactions = async (page) => {
    try {
      console.log(`Fetching transactions for page ${page}`);
      const response = await axios.get(
        "http://localhost:5000/api/v1/bill/transactions",
        {
          params: {
            fromDate: "2025-03-01",
            toDate: "2025-03-31",
            pageSize: 40,
            page: page,
            sort: "DESC",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data;
      console.log("Transaction data received:", data);

      if (data && data.data.records) {
        // Cập nhật state với các giao dịch nhận được
        setTransactions(data.data.records);
        // setTotalPages(data.data.totalPages);

        // Tìm các ID phòng duy nhất từ mô tả giao dịch
        const uniqueRoomIds = new Set();
        data.data.records.forEach((transaction) => {
          const roomId = extractRoomId(transaction?.description);
          if (roomId) {
            const originalCaseId =
              transaction.description.match(/(\w{24})/i)?.[1];
            if (originalCaseId) {
              uniqueRoomIds.add(originalCaseId);
            }
          }
        });

        console.log(
          `Found ${uniqueRoomIds.size} unique room IDs on page ${page}`
        );

        // Gọi API lấy thông tin hóa đơn cho từng phòng
        uniqueRoomIds.forEach((roomId) => {
          fetchRoomBill(roomId);
        });
      } else {
        console.log("No transaction records found, setting empty array");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  // Khởi tạo và tải lại dữ liệu khi trang thay đổi
  useEffect(() => {
    // Reset dữ liệu khi chuyển trang
    setRoomBillList([]);
    existingBillIds.current.clear();
    fetchingRoomIds.current.clear();

    // Tải dữ liệu giao dịch mới
    fetchTransactions(currentPage);
  }, [currentPage]);

  const handleUpdateBill = (billId) => {
    navigate(`/manager/invoice-detail/${billId}`);
  };

  // Xử lý sự kiện chuyển trang
  const handleChangePages = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mb-8 flex flex-col">
      {/* Card chứa bảng danh sách giao dịch */}
      <div className="shadow overflow-hidden m-6">
        {/* Header của card */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">
            Danh Sách Giao Dịch Hóa Đơn
          </h6>
        </div>

        {/* Bảng danh sách giao dịch */}
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Mã giao dịch",
                  "Nội dung chuyển khoản",
                  "Số tiền nhận",
                  "Ngày giao dịch",
                  "Phòng",
                  "Mã hóa đơn",
                  "Trạng thái",
                  "Tính năng",
                ].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-6 text-left"
                  >
                    <span className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Render dữ liệu tích hợp giữa giao dịch và hóa đơn */}
              {getIntegratedRecords().map((record, index) => {
                const cellClass = `py-3 px-6 ${
                  index === getIntegratedRecords().length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-300 transition duration-100"
                  >
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.id}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.tid || "N/A"}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600 max-w-md truncate">
                        {record.description || "N/A"}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p
                        className={`text-xs font-semibold ${
                          record.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {record.amount?.toLocaleString("vi-VN") || "0"} VND
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.transactionDate}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-gray-700">
                            {record.roomName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.billCode}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${record.billStatusClass}`}
                      >
                        {record.billStatus}
                      </span>
                    </td>
                    <td className={cellClass}>
                      <button
                        className="flex items-center"
                        onClick={() => handleUpdateBill(record.billId)}
                      >
                        <Pencil
                          size={20}
                          className="text-blue-600 hover:text-blue-800"
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Hiển thị thông báo đếm ngược khi không có dữ liệu */}
          {getIntegratedRecords().length === 0 && (
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-500">
                Vui lòng tải lại trang sau {countdown} giây để lấy dữ liệu
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center mr-2 w-[110px] ${
            currentPage === 1
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-700"
          } p-2 rounded-lg text-base font-semibold text-white`}
        >
          Trang Trước
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleChangePages(pageNum)}
                className={`flex items-center justify-center px-3 py-1 text-lg font-semibold rounded-md ${
                  pageNum === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-green-500 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleChangePages(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex justify-center items-center ml-2 w-[110px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Trang Sau
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
