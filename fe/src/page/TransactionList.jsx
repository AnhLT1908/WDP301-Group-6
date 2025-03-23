import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roomBillList, setRoomBillList] = useState([]);

  const fetchingRoomIds = useRef(new Set());
  const existingBillIds = useRef(new Set());

  /**
   * Fetches bill data for a specific room ID
   * Preserves the populated roomId object while also storing the original roomId string
   * Uses a tracking mechanism to prevent duplicate fetches and track processed bills
   * @param {string} roomId - The ID of the room to fetch bills for
   */
  const fetchRoomBill = async (roomId) => {
    try {
      // Prevent duplicate fetches for the same room
      if (fetchingRoomIds.current.has(roomId)) {
        console.log(`Fetch for room ${roomId} already in progress, skipping`);
        return;
      }

      // Mark this room as being fetched
      fetchingRoomIds.current.add(roomId);
      console.log(`Starting fetch for room ${roomId}`);

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

      // Log raw data to verify population worked correctly on the backend
      if (data && data.data.length > 0) {
        console.log("Sample populated bill:", data.data[0]);
        console.log("Room data in populated bill:", data.data[0].roomId);

        // Filter out bills we've already processed
        const newBills = data.data.filter(
          (bill) => !existingBillIds.current.has(bill._id)
        );

        if (newBills.length > 0) {
          // Store the original roomId string separately without overwriting the populated object
          const billsWithOriginalRoomId = newBills.map((bill) => ({
            ...bill,
            originalRoomId: roomId, // Store the string ID under a different property
          }));

          // Mark these bills as processed
          newBills.forEach((bill) => existingBillIds.current.add(bill._id));

          // Update the bill list with the new bills
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
      // Clean up the tracking set regardless of success/failure
      fetchingRoomIds.current.delete(roomId);
      console.log(`Completed fetch for room ${roomId}`);
    }
  };

  /**
   * Monitor updates to the roomBillList for debugging purposes
   */
  useEffect(() => {
    console.log("roomBillList updated:", roomBillList);
    const uniqueBillIds = new Set(roomBillList.map((bill) => bill._id));
    console.log(
      `Total bills: ${roomBillList.length}, Unique bills: ${uniqueBillIds.size}`
    );
  }, [roomBillList]);

  /**
   * Fetches transaction data for a specific page
   * Extracts room IDs from transaction descriptions and triggers room bill fetches
   * @param {number} page - The page number to fetch
   */
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
        setTransactions(data.data.records);
        setTotalPages(data.data.totalPages);

        // Extract unique room IDs from transaction descriptions
        const uniqueRoomIds = new Set();
        data.data.records.forEach((transaction) => {
          const roomId = extractRoomId(transaction?.description);
          if (roomId) {
            uniqueRoomIds.add(roomId);
          }
        });

        console.log(
          `Found ${uniqueRoomIds.size} unique room IDs on page ${page}`
        );

        // Fetch bills for each unique room ID
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

  /**
   * Extracts a room ID from a transaction description
   * Looks for a 24-character hexadecimal string (MongoDB ObjectId format)
   * @param {string} description - The description text to parse
   * @returns {string|null} - The extracted room ID or null if not found
   */
  const extractRoomId = (description) => {
    if (!description) {
      return null;
    }

    const roomIdMatch = description.match(/(\w{24})/);
    return roomIdMatch ? roomIdMatch[1] : null;
  };

  /**
   * Reset bill data and fetch transactions when page changes
   */
  useEffect(() => {
    setRoomBillList([]);
    existingBillIds.current.clear();
    fetchingRoomIds.current.clear();

    fetchTransactions(currentPage);
  }, [currentPage]);

  /**
   * Gets all bills associated with a specific room ID
   * Handles both the original roomId string and populated roomId object
   * @param {string} roomId - The room ID to filter by
   * @returns {Array} - Array of bills for the specified room
   */
  const getBillsForRoom = (roomId) => {
    return roomBillList.filter((bill) => {
      // Check against the original string ID we stored
      if (bill.originalRoomId) {
        return bill.originalRoomId === roomId;
      }

      // Check against the populated roomId object if available
      if (typeof bill.roomId === "object" && bill.roomId !== null) {
        return bill.roomId._id === roomId;
      }

      // Check against string roomId if that's what we have
      if (typeof bill.roomId === "string") {
        return bill.roomId === roomId;
      }

      return false;
    });
  };

  /**
   * Handles pagination navigation
   * @param {number} page - The page number to navigate to
   */
  const handleChangePages = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mb-8 flex flex-col">
      {/* Card Container */}
      <div className="shadow overflow-hidden m-6">
        {/* Card Header */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">Transaction List</h6>
        </div>
        {/* Card Body */}
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Phòng",
                  "Mã hóa đơn",
                  "Số tiền",
                  "Trạng thái",
                  "Ngày tạo",
                  "Ngày cập nhật",
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
              {roomBillList.map((bill, index) => {
                // Define the cell class for styling
                const cellClass = `py-3 px-6 ${
                  index === roomBillList.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                // Extract room information from populated data
                const roomName =
                  typeof bill.roomId === "object" && bill.roomId !== null
                    ? bill.roomId.name || "Unknown Room" // Use populated room name if available
                    : "Room " +
                      (bill.originalRoomId || bill.roomId || "").substring(
                        0,
                        6
                      ); // Fallback

                // Format dates for display
                const createdDate = new Date(bill.createdAt).toLocaleString(
                  "vi-VN"
                );
                const updatedDate = new Date(bill.updatedAt).toLocaleString(
                  "vi-VN"
                );

                return (
                  <tr
                    key={bill._id}
                    className="hover:bg-gray-300 transition duration-100"
                  >
                    {/* Room Name */}
                    <td className={cellClass}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-gray-700">
                            {roomName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Bill Code */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {bill.billCode || "N/A"}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {bill.total?.toLocaleString("vi-VN") || "0"} VND
                      </p>
                    </td>

                    {/* Status */}
                    <td className={cellClass}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "unpaid"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {bill.status === "paid"
                          ? "Đã thanh toán"
                          : bill.status === "unpaid"
                          ? "Chưa thanh toán"
                          : bill.status || "N/A"}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {createdDate}
                      </p>
                    </td>

                    {/* Updated Date */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {updatedDate}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center mr-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Previous
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
          className="flex justify-center items-center ml-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
