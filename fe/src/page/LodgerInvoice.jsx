import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function LodgerInvoice(){
    const { billId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState({})

    useEffect(() => {
        const fetchBillData = async () => {
            try{
                const token = localStorage.getItem("token")
                const res = await axios.get(`http://localhost:5000/api/v1/bill/bill-detail/${billId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoice(res.data.data);
            }catch(err){
                console.log("Error fetching bill data:", err);
            }
        }
        fetchBillData();
    }, [billId]);

    return(
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

          {/* Price List Display */}
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

        {/* QR Code Display */}
        {invoice.paymentLink && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold">Payment QR Code</h3>
            <QRCodeCanvas value={invoice.paymentLink} size={200} />
            <p className="mt-2 text-sm text-gray-600">
              Total: {invoice.total} VND
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

}