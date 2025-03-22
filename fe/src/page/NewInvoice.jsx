import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";

export default function NewInvoice() {
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
  const [qrUrl, setQrUrl] = useState("");
  const [billData, setBillData] = useState(null);
  const [roomPreviosMonthBill, setRoomPreviosMonthBill] = useState("");
  const [previosMonthBillList, setPreviosMonthBillList] = useState([]);
  const { roomId } = useParams();
  const [room, setRoom] = useState("");
  const [house, setHouse] = useState("");
  const [formErrors, setFormErrors] = useState({});
  console.log("Room Id", roomId);

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

  console.log("House fetching: ", house);

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

  console.log("Room", room);

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
    // Only fetch if roomId exists
    if (roomId) {
      fetchBillDetails();
    }

    // Add roomId as a dependency so the effect runs whenever roomId changes
  }, [roomId]);

  console.log("roomPreviosMonthBill ", roomPreviosMonthBill);

  console.log("previosMonthBillList", previosMonthBillList);

  const unpaidBills = previosMonthBillList.filter(
    (prevBill) => prevBill.isPaid === false
  );

  const totalDebtAmount = unpaidBills.reduce((sum, bill) => {
    const billTotal = Number(bill.total) || 0;
    return sum + billTotal;
  }, 0);

  console.log("Unpaid bill", unpaidBills);
  console.log("Total Debt Amount:", totalDebtAmount);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceListChange = (index, field, value) => {
    const newPriceList = [...invoice.customPriceList];
    newPriceList[index] = {
      ...newPriceList[index],
      [field]: value,
    };
    setInvoice((prev) => ({ ...prev, customPriceList: newPriceList }));
  };

  console.log("Invoice", invoice.customPriceList);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem("token");

      // Lấy giá trị "Previous month's usage" từ roomPreviosMonthBill
      const previousMonthUsage = roomPreviosMonthBill?.priceList
        ? roomPreviosMonthBill.priceList.reduce((acc, item) => {
            acc[item.name] = item.usage || 0;
            return acc;
          }, {})
        : { electricity: 0, water: 0, service: 0, internet: 0 };

      console.log("previousMonthUsage", previousMonthUsage);

      console.log("previousMonthUsage", previousMonthUsage);

      const requestBody = {
        ...invoice,
        roomId,
        previousMonthUsage,
      };

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
        setQrUrl(response.data.qrUrl);
        setBillData(response.data.data);
        alert("Invoice created successfully!");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
    }
  };

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
              type="text"
              name="debt"
              value={totalDebtAmount > 0 ? totalDebtAmount : invoice.debt}
              onChange={handleInputChange}
              readOnly
              className="border p-2 rounded mt-1 text-gray-700"
            />
            {formErrors.debt && (
              <span className="text-red-500 text-xs">{formErrors.debt}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Room</label>
            <input
              type="text"
              name="roomName"
              value={room.name}
              className="border p-2 rounded mt-1 text-gray-700"
              readOnly
            />
          </div>

          {/* Price List Inputs */}
          {invoice.customPriceList.map((item, index) => (
            <div
              key={item.name}
              className="flex flex-col col-span-3 border-t pt-4"
            >
              <h3 className="text-md font-semibold capitalize">{item.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Price
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    readOnly
                    className="border p-2 rounded mt-1 text-gray-700 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">
                    Current month's usage
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
                    className="border p-2 rounded mt-1 text-gray-700 w-full"
                  />
                  {formErrors[`currentUsage_${index}`] && (
                    <span className="text-red-500 text-xs">
                      {formErrors[`currentUsage_${index}`]}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Previous month's usage
                  </label>
                  <input
                    type="text"
                    value={
                      roomPreviosMonthBill?.priceList?.find(
                        (prevItem) => prevItem.name === item.name
                      )?.usage || 0
                    }
                    readOnly
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
