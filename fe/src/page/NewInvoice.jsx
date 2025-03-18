import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function NewInvoice({ roomId }) {
  const [invoice, setInvoice] = useState({
    note: "",
    debt: 0,
    paymentMethod: "",
    customPriceList: [
      { name: "electricity", price: 0, usage: 0 },
      { name: "water", price: 0, usage: 0 },
      { name: "service", price: 0, usage: 0 },
      { name: "internet", price: 0, usage: 0 },
    ],
  });
  const [qrUrl, setQrUrl] = useState("");
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/v1/bill/room/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Giả sử API trả về dữ liệu phòng để khởi tạo
        if (res.data.data) {
          setBillData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoomData();
  }, [roomId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceListChange = (index, field, value) => {
    const newPriceList = [...invoice.customPriceList];
    newPriceList[index] = {
      ...newPriceList[index],
      [field]: field === "price" || field === "usage" ? Number(value) : value,
    };
    setInvoice((prev) => ({ ...prev, customPriceList: newPriceList }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/v1/bill/room/${roomId}`,
        invoice,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data.success) {
        setQrUrl(response.data.paymentLink);
        setBillData(response.data.data);
        alert("Invoice created successfully!");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-yellow-500 ml-20">New Invoice</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-4 ml-40">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Note</label>
            <input
              type="text"
              name="note"
              value={invoice.note}
              onChange={handleInputChange}
              className="border p-2 rounded mt-1 text-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Debt</label>
            <input
              type="number"
              name="debt"
              value={invoice.debt}
              onChange={handleInputChange}
              className="border p-2 rounded mt-1 text-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Payment Method</label>
            <select
              name="paymentMethod"
              value={invoice.paymentMethod}
              onChange={handleInputChange}
              className="border p-2 rounded mt-1 text-gray-700"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
          
          {/* Price List Inputs */}
          {invoice.customPriceList.map((item, index) => (
            <div key={item.name} className="flex flex-col col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold capitalize">{item.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Price</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handlePriceListChange(index, "price", e.target.value)
                    }
                    className="border p-2 rounded mt-1 text-gray-700 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Usage</label>
                  <input
                    type="number"
                    value={item.usage}
                    onChange={(e) =>
                      handlePriceListChange(index, "usage", e.target.value)
                    }
                    className="border p-2 rounded mt-1 text-gray-700 w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QR Code Display */}
        {qrUrl && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold">Payment QR Code</h3>
            <QRCodeCanvas value={qrUrl} size={200} />
            <p className="mt-2 text-sm text-gray-600">
              Total: {billData?.total} VND
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}