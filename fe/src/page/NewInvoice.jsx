import { useState, useEffect } from "react";

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
    fetch(`http://localhost:5000/api/v1/bill/room/${roomId}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data))
      .catch((err) => console.error("Error fetching invoice:", err));
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-yellow-500">New Invoice</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-4">
        <h2 className="text-lg font-semibold border-b pb-2">New Invoice</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField label="House" value={invoice.house} />
          <InputField label="Room Number" value={invoice.roomNumber} />
          <InputField label="Invoice Month" value={invoice.invoiceMonth} />
          <InputField label="Room Price" value={invoice.roomPrice} />
          <InputField label="Start Unit" value={invoice.startUnit} />
          <InputField label="End Unit" value={invoice.endUnit} />
          <InputField label="Unit Price" value={invoice.unitPrice} />
          <InputField label="Total Unit Price" value={invoice.totalUnitPrice} />
          <InputField label="Total Price" value={invoice.totalPrice} />
          <InputField label="Payment Method" value={invoice.paymentMethod} />
        </div>
        <div className="flex justify-center my-4">
          <img src="/qr-code-placeholder.png" alt="QR Code" className="w-32 h-32" />
        </div>
        <div className="flex justify-between">
          <button className="bg-green-500 text-white px-4 py-2 rounded">Back</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <input
        type="text"
        value={value || "Loading..."}
        className="border p-2 rounded mt-1 text-gray-700"
        readOnly
      />
    </div>
  );
}
