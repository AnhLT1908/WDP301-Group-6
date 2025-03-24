import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roomBillList, setRoomBillList] = useState([]);
  const [matchingTransactions, setMatchingTransactions] = useState([]);

  const fetchingRoomIds = useRef(new Set());
  const existingBillIds = useRef(new Set());

  /**
   * Extracts a room ID from a transaction description
   * Looks for a 24-character hexadecimal string (MongoDB ObjectId format)
   * Returns the ID in lowercase for consistent comparison
   * @param {string} description - The description text to parse
   * @returns {string|null} - The extracted room ID (lowercase) or null if not found
   */
  const extractRoomId = (description) => {
    if (!description) {
      return null;
    }

    // Find all 24-character hexadecimal strings in the description (case insensitive)
    const matches = [...description.matchAll(/(\w{24})/gi)];

    if (matches.length === 0) {
      return null;
    }

    // Return the last match (which is typically the room ID in your data structure)
    // Convert to lowercase for case-insensitive comparison
    return matches[matches.length - 1][0].toLowerCase();
  };

  /**
   * Helper function to extract roomId from a bill object
   * Handles different representations of roomId
   * @param {Object} bill - The bill object
   * @returns {string|null} - The extracted room ID or null if not found
   */
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

  /**
   * Integrates information from roomBillList with matchingTransactions
   * Creates combined records for unified display
   * Ensures roomId is properly extracted for invoice detail links
   * @returns {Array} Array of integrated records with bill and transaction data
   */
  const getIntegratedRecords = () => {
    if (!matchingTransactions.length) return [];

    // Map to store relationships between room IDs and bills
    const roomIdToBillMap = new Map();

    // Index bills by roomId (normalized to lowercase for case insensitive matching)
    roomBillList.forEach((bill) => {
      const billRoomId = extractBillRoomId(bill);
      if (billRoomId) {
        roomIdToBillMap.set(billRoomId.toLowerCase(), bill);
      }
    });

    // Create integrated records by combining transaction data with related bill data
    return matchingTransactions.map((transaction) => {
      // Extract roomId from transaction description
      const transactionRoomId = extractRoomId(transaction.description);
      // Look up corresponding bill
      const relatedBill = transactionRoomId
        ? roomIdToBillMap.get(transactionRoomId.toLowerCase())
        : null;

      // Extract the actual roomId (not normalized) for the detail link
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
        // If we have a roomId from transaction but no matching bill,
        // use the extracted roomId from the transaction description
        const originalCaseRoomId =
          transaction.description.match(/(\w{24})/i)?.[1];
        actualRoomId = originalCaseRoomId || transactionRoomId;
      }

      // Format transaction date
      const transactionDate = transaction.tid
        ? new Date(
            parseInt(transaction.tid.split("-")[0]) * 1000
          ).toLocaleString("vi-VN")
        : "N/A";

      // Create integrated record with combined data
      return {
        ...transaction,
        transactionDate,
        relatedBill,
        // Store the actual roomId for the invoice detail link
        roomId: actualRoomId,
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
        billStatus:
          relatedBill?.isPaid === true
            ? "Đã cập nhật"
            : relatedBill?.isPaid === false
            ? "Cần cập nhật"
            : "N/A",
        billStatusClass:
          relatedBill?.isPaid === true
            ? "bg-green-100 text-green-800"
            : relatedBill?.isPaid === false
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800",
      };
    });
  };

  /**
   * Extracts and stores records that contain roomIds matching those in roomBillList
   * Uses case-insensitive comparison for more reliable matching
   * @returns {Array} Array of transaction records with matching roomIds
   */
  const extractTransactionsWithMatchingRoomIds = () => {
    // Early exit if no transactions or roomBills
    if (!transactions.length || !roomBillList.length) {
      console.log("No transactions or room bills available for matching");
      return [];
    }

    // Create a Set of all roomIds in roomBillList (normalized to lowercase)
    const roomIdSet = new Set();

    roomBillList.forEach((bill) => {
      // Handle populated roomId objects
      if (typeof bill.roomId === "object" && bill.roomId !== null) {
        roomIdSet.add(bill.roomId._id.toLowerCase());
      }

      // Handle string roomIds
      if (typeof bill.roomId === "string") {
        roomIdSet.add(bill.roomId.toLowerCase());
      }

      // Handle the originalRoomId property if it exists
      if (bill.originalRoomId) {
        roomIdSet.add(bill.originalRoomId.toLowerCase());
      }
    });

    console.log(`Found ${roomIdSet.size} unique room IDs in roomBillList`);

    // Filter transactions that contain matching roomIds in their description
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

  /**
   * Update matching transactions when either transactions or roomBillList changes
   */
  useEffect(() => {
    const matches = extractTransactionsWithMatchingRoomIds();
    setMatchingTransactions(matches);
  }, [transactions, roomBillList]);

  console.log("matchingTransactions", matchingTransactions);

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
   * Modified to handle case-insensitive room ID extraction
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

        // Extract unique room IDs from transaction descriptions (normalized to lowercase)
        const uniqueRoomIds = new Set();
        data.data.records.forEach((transaction) => {
          const roomId = extractRoomId(transaction?.description);
          if (roomId) {
            // Store the original case in the uniqueRoomIds Set for API calls
            // The original ID is needed for the API, even though we normalize for comparison
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
   * Gets all bills associated with a specific room ID
   * Uses case-insensitive comparison for more reliable matching
   * @param {string} roomId - The room ID to filter by
   * @returns {Array} - Array of bills for the specified room
   */
  const getBillsForRoom = (roomId) => {
    // Convert input roomId to lowercase for case-insensitive comparison
    const normalizedRoomId = roomId.toLowerCase();

    return roomBillList.filter((bill) => {
      // Check against the original string ID we stored
      if (bill.originalRoomId) {
        return bill.originalRoomId.toLowerCase() === normalizedRoomId;
      }

      // Check against the populated roomId object if available
      if (typeof bill.roomId === "object" && bill.roomId !== null) {
        return bill.roomId._id.toLowerCase() === normalizedRoomId;
      }

      // Check against string roomId if that's what we have
      if (typeof bill.roomId === "string") {
        return bill.roomId.toLowerCase() === normalizedRoomId;
      }

      return false;
    });
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
      {/* Integrated Transaction and Bill Display */}
      <div className="shadow overflow-hidden m-6">
        {/* Card Header */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">
            Transaction and Bill Information
          </h6>
        </div>

        {/* Card Body */}
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
                  "Hoạt động",
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
              {getIntegratedRecords().map((record, index) => {
                // Define the cell class for styling
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
                    {/* ID */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.id}
                      </p>
                    </td>

                    {/* Transaction ID */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.tid || "N/A"}
                      </p>
                    </td>

                    {/* Description */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600 max-w-md truncate">
                        {record.description || "N/A"}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className={cellClass}>
                      <p
                        className={`text-xs font-semibold ${
                          record.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {record.amount?.toLocaleString("vi-VN") || "0"} VND
                      </p>
                    </td>

                    {/* Transaction Date */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.transactionDate}
                      </p>
                    </td>

                    {/* Room Name */}
                    <td className={cellClass}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-gray-700">
                            {record.roomName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Bill Code */}
                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {record.billCode}
                      </p>
                    </td>

                    {/* Status */}
                    <td className={cellClass}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${record.billStatusClass}`}
                      >
                        {record.billStatus}
                      </span>
                    </td>
                    <td className={cellClass}>
                      <a
                        href={`/manager/invoice-detail/${record.roomId}`}
                        className="text-xs font-semibold text-blue-600 underline hover:underline"
                      >
                        Cập nhật hoá đơn
                      </a>
                    </td>
                  </tr>
                );
              })}
              {getIntegratedRecords().length === 0 && (
                <tr>
                  <td colSpan="8" className="py-4 px-6 text-center">
                    <p className="text-sm text-gray-500">
                      No matching transactions found
                    </p>
                  </td>
                </tr>
              )}
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
