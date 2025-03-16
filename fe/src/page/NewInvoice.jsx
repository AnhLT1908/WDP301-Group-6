import { useState, useEffect } from "react";
import axios from "axios";

export default function NewInvoice({ roomId }) {
  const [invoice, setInvoice] = useState({
    house: "",
    roomNumber: "",
    invoiceMonth: "",
    roomPrice: "",
    startUnit: "",
    endUnit: "",
    unitPrice: "",
    totalUnitPrice: "",
    totalPrice: "",
    paymentMethod: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:5000/api/v1/bill/room/${roomId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setInvoice(res.data.data);
      } catch (error) {
        console.error("Error fetching house data:", error);
      }
    };

    fetchData();
  }, [roomId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/v1/bill", invoice, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Invoice created successfully!");
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
            <label className="text-sm font-semibold text-gray-600">House</label>
            <input type="text" name="house" value={invoice.house} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Room Number</label>
            <input type="text" name="roomNumber" value={invoice.roomNumber} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Invoice Month</label>
            <input type="text" name="invoiceMonth" value={invoice.invoiceMonth} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Room Price</label>
            <input type="text" name="roomPrice" value={invoice.roomPrice} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Start Unit</label>
            <input type="text" name="startUnit" value={invoice.startUnit} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">End Unit</label>
            <input type="text" name="endUnit" value={invoice.endUnit} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Unit Price</label>
            <input type="text" name="unitPrice" value={invoice.unitPrice} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Total Unit Price</label>
            <input type="text" name="totalUnitPrice" value={invoice.totalUnitPrice} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Total Price</label>
            <input type="text" name="totalPrice" value={invoice.totalPrice} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Payment Method</label>
            <input type="text" name="paymentMethod" value={invoice.paymentMethod} onChange={handleInputChange} className="border p-2 rounded mt-1 text-gray-700" />
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded">Back</button>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      </div>
    </div>
  );
}
