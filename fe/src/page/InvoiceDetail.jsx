import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function InvoiceDetail() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [isPaid, setIsPaid] = useState(false); // Changed from isActive to isPaid for clarity
  const [initialIsPaid, setInitialIsPaid] = useState(false); // Track initial state
  const [note, setNote] = useState("");
  const [initialNote, setInitialNote] = useState(""); // Track initial note
  const [isChanged, setIsChanged] = useState(false);
  const [house, setHouse] = useState([]);
  const [room, setRoom] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  // Determine if changes are present by comparing current vs initial values
  const checkForChanges = useCallback(() => {
    // Check if toggle state changed OR if note content changed and is not empty
    const toggleChanged = isPaid !== initialIsPaid;
    const noteChanged = note !== initialNote;
    const noteHasContent = note.trim() !== "";

    // Button is enabled if toggle changed OR (note changed AND note has content)
    const hasValidChanges = toggleChanged || (noteChanged && noteHasContent);
    setIsChanged(hasValidChanges);
  }, [isPaid, initialIsPaid, note, initialNote]);

  // Fetch bill data
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/v1/bill/bill-detail/${billId}`
        );
        const billData = res.data.data;
        setBill(billData);

        // Initialize states with bill data - using the actual isPaid value
        const paidStatus = billData.isPaid || false;
        const noteContent = billData.note || "";

        // Set both current and initial states
        setIsPaid(paidStatus);
        setInitialIsPaid(paidStatus);
        setNote(noteContent);
        setInitialNote(noteContent);
      } catch (error) {
        console.error("Error fetching bill data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  const handleUpdateBill = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/v1/bill/bill-update/${billId}`,
        {
          isPaid: isPaid,
          note: note,
        }
      );

      if (response.data.success) {
        // Update local state to match the saved values
        setInitialIsPaid(isPaid);
        setInitialNote(note);
        setIsChanged(false);

        // Update bill data in state
        setBill((prevBill) => ({
          ...prevBill,
          isPaid: isPaid,
          note: note,
        }));

        // Provide feedback to the user
        alert("Bill updated successfully");
      }
    } catch (error) {
      console.error("Error updating bill:", error);
      alert("Failed to update bill. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for changes whenever relevant state changes
  useEffect(() => {
    checkForChanges();
  }, [isPaid, note, checkForChanges]);

  // Handle checkbox change
  const handleCheckboxChange = () => {
    setIsPaid(!isPaid);
  };

  // Handle note change
  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleTurnBack = () => {
    navigate("/manager/invoice-list");
  };

  if (!bill || isLoading) {
    return (
      <p className="text-center text-gray-500">Loading invoice details...</p>
    );
  }

  return (
    <div className="p-8 ">
      <div>
        <p className="text-yellow-500 font-bold text-3xl">Chi tiết hóa đơn</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          {/* Room Information */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin phòng trọ</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Nhà trọ:</strong> {bill.houseId?.name || "N/A"}
              </p>
              <p>
                <strong>Phòng:</strong> {bill.roomId?.name || "N/A"}
              </p>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Mã hóa đơn:</strong> {bill.billCode || "N/A"}
              </p>
              <p>
                <strong>Hóa đơn tháng:</strong>{" "}
                {formatDate(bill.createdAt) || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <h2 className="text-xl font-bold mb-4">Thông tin chi tiết</h2>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Giá phòng:</strong>{" "}
                {bill.roomPrice?.toLocaleString("vn-VN") + " VND" || "N/A"}
              </p>
              <p>
                <strong>Tiền nợ:</strong>{" "}
                {bill.debt?.toLocaleString("vn-VN") + " VND" || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Tiền điện:</strong>{" "}
                {bill.priceList[0]?.price?.toLocaleString("vn-VN") + " VND" ||
                  "N/A"}
              </p>
              <p>
                <strong>Số sử dụng:</strong> {bill.priceList[0]?.usage || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Tiền nước:</strong>{" "}
                {bill.priceList[1]?.price?.toLocaleString("vn-VN") + " VND" ||
                  "N/A"}
              </p>
              <p>
                <strong>Số sử dụng:</strong> {bill.priceList[1]?.usage || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Tiền dịch vụ:</strong>{" "}
                {bill.priceList[2]?.price?.toLocaleString("vn-VN") + " VND" ||
                  "N/A"}
              </p>
              <p>
                <strong>Số sử dụng:</strong>{" "}
                {bill.priceList[2]?.usage === 0
                  ? "Đây là phí cố định theo tháng"
                  : bill.priceList[2]?.usage}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Tiền Internet:</strong>{" "}
                {bill.priceList[3]?.price?.toLocaleString("vn-VN") + " VND" ||
                  "N/A"}
              </p>
              <p>
                <strong>Số sử dụng:</strong>{" "}
                {bill.priceList[3]?.usage === 0
                  ? "Đây là phí cố định theo tháng"
                  : bill.priceList[3]?.usage}
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <h2 className="text-xl font-bold mb-4">Thông tin liên quan</h2>
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <strong>Tổng tiền hóa đơn:</strong>{" "}
                  {bill.total?.toLocaleString("vn-VN")} VND
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      bill.isPaid
                        ? "text-green-500 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {bill.isPaid ? "Đã trả" : "Chưa trả"}
                  </span>
                </p>
              </div>

              {/* Form controls with enhanced validation */}
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <div className="w-56 font-semibold">
                    Cập nhật trạng thái hóa đơn:
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isPaid}
                      onChange={handleCheckboxChange}
                    />
                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-24 font-semibold">Ghi chú:</div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Không có ghi chú nào"
                      value={note}
                      onChange={handleNoteChange}
                    />
                  </div>
                </div>
                {/* Display validation message if needed */}
                {note.trim() === "" && initialNote !== "" && (
                  <div className="text-red-500 text-sm ml-24 mb-2">
                    Ghi chú không được để trống nếu đã thay đổi
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  className="bg-blue-500 p-2 px-4 rounded-md text-white hover:bg-blue-600"
                  onClick={handleTurnBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`p-2 px-4 rounded-md text-white ${
                    isChanged
                      ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isChanged || isLoading}
                  onClick={handleUpdateBill}
                >
                  {isLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <img
            src={bill.paymentLink}
            className="object-cover w-fit rounded-md shadow-md"
            alt="billQr"
          />
        </div>
      </div>
    </div>
  );
}
