import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import Header from "../components/layout/Header";

export default function LodgerInvoice() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState({
    note: "",
    debt: 0,
    paymentMethod: "",
    customPriceList: [],
    total: 0,
  });
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Trạng thái thanh toán thành công

  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId) {
        setError("Bill ID is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/v1/bill/bill-detail/${billId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const billData = res.data.data;

        setInvoice({
          note: billData.note || "",
          debt: billData.debt || 0,
          paymentMethod: billData.paymentMethod || "",
          customPriceList: billData.priceList || [],
          total: billData.total || 0,
        });
        setQrUrl(billData.paymentLink || "");
        setPaymentSuccess(billData.isPaid || false); // Giả sử API trả về trạng thái isPaid
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bill data:", error);
        setError("Failed to load bill details");
        setLoading(false);
      }
    };
    fetchBillData();
  }, [billId]);

  // Hàm xác nhận thanh toán
  const handlePaymentConfirmation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/v1/bill/confirm/${billId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError("Failed to confirm payment");
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  // Màn hình thông báo thanh toán thành công
  if (paymentSuccess) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Hóa đơn của bạn đã được thanh toán. Cảm ơn bạn!
          </p>
          <button
            onClick={() => navigate("/user-profile")} // Chuyển về trang profile hoặc trang khác
            className="bg-green-500 text-white px-6 py-3 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Màn hình xem hóa đơn với QR code
  return (
    <div>
        <Header/>
    <div className="h-screen bg-gray-100 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-yellow-500 ml-20">View Invoice</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-4 ml-40">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Note</label>
            <input
              type="text"
              name="note"
              value={invoice.note}
              className="border p-2 rounded mt-1 text-gray-700 bg-gray-100"
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Debt</label>
            <input
              type="number"
              name="debt"
              value={invoice.debt}
              className="border p-2 rounded mt-1 text-gray-700 bg-gray-100"
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Payment Method</label>
            <input
              type="text"
              name="paymentMethod"
              value={invoice.paymentMethod}
              className="border p-2 rounded mt-1 text-gray-700 bg-gray-100"
              disabled
            />
          </div>

          {invoice.customPriceList.map((item, index) => (
            <div key={item.name} className="flex flex-col col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold capitalize">{item.name}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Price</label>
                  <input
                    type="number"
                    value={item.price}
                    className="border p-2 rounded mt-1 text-gray-700 bg-gray-100 w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Usage</label>
                  <input
                    type="number"
                    value={item.usage}
                    className="border p-2 rounded mt-1 text-gray-700 bg-gray-100 w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Total</label>
                  <input
                    type="number"
                    value={item.total}
                    className="border p-2 rounded mt-1 text-gray-700 bg-gray-100 w-full"
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {qrUrl && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold">Payment QR Code</h3>
            <QRCodeCanvas value={qrUrl} size={200} />
            <p className="mt-2 text-sm text-gray-600">
              Total: {invoice.total} VND
            </p>
            <button
              onClick={handlePaymentConfirmation}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Xác nhận thanh toán
            </button>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}