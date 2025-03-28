import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BillEvidenceUpload from "../components/BillEvidenceUpload";

export default function LodgerInvoiceDetail() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  // Fetch bill data
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/v1/bill/bill-detail/${billId}`
        );
        const billData = res.data.data;
        console.log("billData", billData);
        setBill(billData);
      } catch (error) {
        console.error("Error fetching bill data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  const handleTurnBack = () => {
    navigate(`/lodger-invoice-list/${bill.roomId._id}`);
  };

  const handleEvidenceUploadSuccess = (data) => {
    // Update the bill state with the new evidence
    setBill((prevBill) => ({
      ...prevBill,
      billEvidence: data.billEvidence,
    }));
  };

  if (!bill || isLoading) {
    return (
      <p className="text-center text-gray-500">Loading invoice details...</p>
    );
  }

  return (
    <div className="p-8 ">
      <div className="flex justify-between">
        <button
          onClick={handleTurnBack}
          className="bg-green-500 hover:bg-green-700 transition duration-200 text-white px-4 py-2 rounded-md mb-8"
        >
          Quay về
        </button>
        <p className="text-yellow-500 font-bold text-3xl">Chi tiết hóa đơn</p>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col w-1/2">
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
            <h2 className="text-xl font-bold mb-4">Thông tin liên quan</h2>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <p>
                <strong>Tổng tiền hóa đơn:</strong>{" "}
                {bill.total?.toLocaleString("vn-VN")} VND
              </p>
              <p>
                <strong>Trạng thái thanh toán:</strong>{" "}
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
            <div className="grid grid-cols-1 mt-5">
              <p>
                <strong>Ghi chú:</strong>{" "}
                {bill.note === "" ? "Không có ghi chú nào" : bill.note}
              </p>
            </div>
          </div>
          <BillEvidenceUpload
            billId={billId}
            isPaid={bill.isPaid}
            onUploadSuccess={handleEvidenceUploadSuccess}
          />
        </div>
        {/* <div className="flex flex-col items-center justify-center">
          <img
            src={bill.paymentLink}
            className="object-cover w-fit rounded-md shadow-md"
            alt="billQr"
          />
        </div> */}
      </div>
    </div>
  );
}
