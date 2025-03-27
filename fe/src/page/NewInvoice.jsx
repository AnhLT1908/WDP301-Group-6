import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function NewInvoice() {
  // =============== STATE DEFINITIONS ===============
  // Core invoice data and form state
  const [invoice, setInvoice] = useState({
    note: "",
    debt: 0,
    paymentMethod: "",
    customPriceList: [
      { name: "electricity", price: 0, currentUsage: 0 },
      { name: "water", price: 0, currentUsage: 0 },
      { name: "service", price: 0, currentUsage: 0 },
      { name: "internet", price: 0, currentUsage: 0 },
    ],
  });
  const navigate = useNavigate();
  const [roomPreviosMonthBill, setRoomPreviosMonthBill] = useState("");
  const [previosMonthBillList, setPreviosMonthBillList] = useState([]);
  const [currentMonthBillList, setCurrentMonthBillList] = useState([]);
  const { roomId } = useParams();
  const [room, setRoom] = useState("");
  const [house, setHouse] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Date information for invoice
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const formattedMonth = currentMonth.toString().padStart(2, "0");

  // Submission status tracking
  const [submissionStatus, setSubmissionStatus] = useState({
    isSuccess: false,
    isError: false,
    message: "",
    billCode: "",
    billId: "",
  });

  // =============== DATA FETCHING HOOKS ===============
  // Fetch house data when room info is available
  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/v1/house/${room.house}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.data) {
          setHouse(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching house data:", error);
      }
    };
    if (room.house) {
      fetchHouseData();
    }
  }, [room.house]);

  // Fetch room data using roomId from URL params
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/v1/room/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.data) {
          setRoom(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  // Fetch all bills for the room
  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/v1/bill/roomBill/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Lastest bill", response.data.data);
        if (response.data.success) {
          setRoomPreviosMonthBill(response.data.data[0]);
          setPreviosMonthBillList(response.data.data);
          console.log("Bill details fetched successfully:", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching bill details:", error);
      }
    };
    if (roomId) {
      fetchBillDetails();
    }
  }, [roomId]);

  // =============== UTILITY FUNCTIONS ===============
  // Extract month from ISO date string
  const extractMonthFromDate = (dateString) => {
    try {
      if (!dateString) return 0;
      const date = new Date(dateString);
      return date.getMonth() + 1;
    } catch (error) {
      console.error("Error parsing date:", error);
      return 0;
    }
  };

  // Format currency with commas (e.g., 1,000,000)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // =============== DATA PROCESSING HOOKS ===============
  // Filter bills for current month from all bills
  useEffect(() => {
    if (previosMonthBillList && previosMonthBillList.length > 0) {
      const billsForCurrentMonth = previosMonthBillList.filter((bill) => {
        const billMonth = extractMonthFromDate(bill.createdAt);
        return billMonth === currentMonth;
      });

      setCurrentMonthBillList(billsForCurrentMonth);

      console.log(
        `Found ${billsForCurrentMonth.length} bills for month ${currentMonth}:`,
        billsForCurrentMonth
      );
    }
  }, [previosMonthBillList, currentMonth]);

  // Calculate total debt from unpaid bills
  const unpaidBills = previosMonthBillList.filter(
    (prevBill) => prevBill.isPaid === false
  );

  const totalDebtAmount = unpaidBills.reduce((sum, bill) => {
    const billTotal = Number(bill.total) || 0;
    return sum + billTotal;
  }, 0);

  // Update invoice with calculated debt amount
  useEffect(() => {
    if (totalDebtAmount > 0) {
      setInvoice((prev) => ({
        ...prev,
        debt: totalDebtAmount,
      }));
    }
  }, [totalDebtAmount]);

  // Update invoice with default prices from house config
  useEffect(() => {
    if (house?.DefaultPrice?.length) {
      const updatedPriceList = invoice.customPriceList.map((item) => {
        const defaultPrice = house.DefaultPrice[0];
        if (item.name === "electricity")
          item.price = defaultPrice.electricPrice;
        if (item.name === "internet") item.price = defaultPrice.internetPrice;
        if (item.name === "service") item.price = defaultPrice.servicePrice;
        if (item.name === "water") item.price = defaultPrice.waterPrice;
        return item;
      });
      setInvoice((prev) => ({
        ...prev,
        customPriceList: updatedPriceList,
      }));
    }
  }, [house]);

  // =============== FORM VALIDATION AND HANDLING ===============
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (isNaN(invoice.debt) || invoice.debt === "") {
      errors.debt = "Debt must be a number";
    }

    invoice.customPriceList.forEach((item, index) => {
      if (isNaN(item.currentUsage) || item.currentUsage === "") {
        errors[`currentUsage_${index}`] = `${item.name} usage must be a number`;
      } else if (
        item.currentUsage <=
        roomPreviosMonthBill?.priceList?.find(
          (prevItem) => prevItem.name === item.name
        )?.usage
      ) {
        errors[
          `currentUsage_${index}`
        ] = `${item.name} usage must be greater than the previous month's usage`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes to utility usage values
  const handlePriceListChange = (index, field, value) => {
    const newPriceList = [...invoice.customPriceList];
    newPriceList[index] = {
      ...newPriceList[index],
      [field]: value,
    };
    setInvoice((prev) => ({ ...prev, customPriceList: newPriceList }));
  };

  // =============== UI STATE CONTROL FUNCTIONS ===============
  // Determine if Create button should be disabled
  const isCreateButtonDisabled = () => {
    return currentMonthBillList.length > 0 && !submissionStatus.isSuccess;
  };

  // Get appropriate error message for duplicate invoice
  const getInvoiceExistsErrorMessage = () => {
    if (currentMonthBillList.length > 0 && !submissionStatus.isSuccess) {
      return "Tháng này đã tồn tại hoá đơn";
    }
    return null;
  };

  // =============== FORM SUBMISSION HANDLER ===============
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Reset submission status before attempting submission
    setSubmissionStatus({
      isSuccess: false,
      isError: false,
      message: "",
      billCode: "",
      billId: "",
    });

    // Set loading state to true when submission starts
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare request data
      const previousMonthUsage = roomPreviosMonthBill?.priceList
        ? roomPreviosMonthBill.priceList.reduce((acc, item) => {
            acc[item.name] = item.usage || 0;
            return acc;
          }, {})
        : { electricity: 0, water: 0, service: 0, internet: 0 };

      const requestBody = {
        ...invoice,
        roomId,
        previousMonthUsage,
      };

      // Send API request to create invoice
      const response = await axios.post(
        `http://localhost:5000/api/v1/bill/room/${roomId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update UI with success state
        setSubmissionStatus({
          isSuccess: true,
          isError: false,
          message: "Hoá đơn được tạo thành công",
          billCode: response.data.data?.billCode || "",
          billId: response.data.data?._id || "", // Store the bill ID
        });

        // Update bill list to include new invoice
        if (response.data.data) {
          setCurrentMonthBillList((prev) => [...prev, response.data.data]);
        }
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setSubmissionStatus({
        isSuccess: false,
        isError: true,
        message: "Không thể tạo hoá đơn. Vui lòng thử lại sau.",
        billCode: "",
        billId: "",
      });
    } finally {
      // Set loading back to false when done, regardless of success or failure
      setLoading(false);
    }
  };

  const handleViewDetail = () => {
    if (submissionStatus.billId) {
      navigate(`/manager/invoice-detail/${submissionStatus.billId}`);
    }
  };

  // =============== COMPONENT RENDER ===============
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6">
      {/* Modified header with centered layout */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-yellow-500 mb-6">
          Tạo hóa đơn mới
        </h1>

        {/* Main form container - centered and wider */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          {/* Status notifications section */}
          {submissionStatus.isSuccess && (
            <div className="mb-6">
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Thành công:</strong>
                <span className="block sm:inline">
                  {" "}
                  {submissionStatus.message}
                </span>
                {submissionStatus.billCode && (
                  <div className="mt-2 text-sm">
                    <span>Mã hoá đơn: </span>
                    <span className="font-medium">
                      {submissionStatus.billCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {submissionStatus.isError && (
            <div className="mb-6">
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Lỗi:</strong>
                <span className="block sm:inline">
                  {" "}
                  {submissionStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Main form section - restructured layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic invoice information fields */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">
                Ghi chú
              </label>
              <input
                type="text"
                name="note"
                value={invoice.note}
                onChange={handleInputChange}
                className="border p-3 rounded mt-1 text-gray-700 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">Nợ</label>
              <input
                type="text"
                name="debt"
                value={formatCurrency(
                  totalDebtAmount > 0 ? totalDebtAmount : invoice.debt
                )}
                onChange={handleInputChange}
                readOnly
                className="border p-3 rounded mt-1 text-gray-700 bg-gray-200 w-full"
              />
              {formErrors.debt && (
                <span className="text-red-500 text-xs mt-1">
                  {formErrors.debt}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">
                Phòng
              </label>
              <input
                type="text"
                name="roomName"
                value={room.name}
                className="border p-3 rounded mt-1 text-gray-700 bg-gray-200 w-full"
                readOnly
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">
                Hóa đơn tháng
              </label>
              <input
                type="text"
                name="billMonth"
                value={`Hoá đơn tháng ${formattedMonth}`}
                className="border p-3 rounded mt-1 text-gray-700 bg-gray-200 w-full"
                readOnly
              />
            </div>
          </div>

          {/* Utility services section - improved layout */}
          <div className="mt-8">
            {invoice.customPriceList.map((item, index) => (
              <div
                key={item.name}
                className="mb-6 pb-6 border-b border-gray-200 last:border-b-0"
              >
                <h3 className="text-lg font-semibold capitalize mb-3">
                  {item.name === "electricity"
                    ? "Tiền điện"
                    : item.name === "water"
                    ? "Tiền nước"
                    : item.name === "service"
                    ? "Tiền dịch vụ"
                    : item.name === "internet"
                    ? "Tiền mạng"
                    : item.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600">
                      Giá tiền
                    </label>
                    <input
                      type="text" // Changed from number to text for formatted display
                      value={formatCurrency(item.price)}
                      readOnly
                      className="border p-3 rounded mt-1 text-gray-700 w-full bg-gray-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600">
                      Số sử dụng tháng trước
                    </label>
                    <input
                      type="text"
                      value={
                        roomPreviosMonthBill?.priceList?.find(
                          (prevItem) => prevItem.name === item.name
                        )?.usage || 0
                      }
                      readOnly
                      className="border p-3 rounded mt-1 text-gray-700 w-full bg-gray-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600">
                      Số sử dụng tháng hiện tại
                    </label>
                    <input
                      type="text"
                      value={item.currentUsage}
                      onChange={(e) =>
                        handlePriceListChange(
                          index,
                          "currentUsage",
                          e.target.value
                        )
                      }
                      className="border p-3 rounded mt-1 text-gray-700 w-full"
                    />
                    {formErrors[`currentUsage_${index}`] && (
                      <span className="text-red-500 text-xs mt-1">
                        {formErrors[`currentUsage_${index}`]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error message for duplicate invoice */}
          {getInvoiceExistsErrorMessage() && (
            <div className="mt-6">
              <div
                className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Thông báo:</strong>
                <span className="block sm:inline">
                  {" "}
                  {getInvoiceExistsErrorMessage()}
                </span>
                {currentMonthBillList.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span>Mã hoá đơn đã tồn tại: </span>
                    {currentMonthBillList.map((bill, index) => (
                      <span key={index} className="font-medium">
                        {bill.billCode}
                        {index < currentMonthBillList.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons section */}
          <div className="flex justify-between mt-8">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md w-[200px] transition duration-200">
              Quay trở lại
            </button>

            {submissionStatus.isSuccess ? (
              <button
                onClick={handleViewDetail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md w-[200px] transition duration-200"
              >
                Xem chi tiết
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreateButtonDisabled() || loading}
                className={`${
                  isCreateButtonDisabled() || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-6 py-3 rounded-md w-[200px] transition duration-200 flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tạo hoá đơn...
                  </>
                ) : (
                  "Tạo hóa đơn"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
