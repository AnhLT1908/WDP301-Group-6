import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function InvoiceList() {
  const [bills, setBills] = useState([]);
  const [houses, setHouses] = useState({});
  const [rooms, setRooms] = useState({});
  const navigate = useNavigate();

  const hostId = JSON.parse(localStorage.getItem("user"))._id;
  console.log("Host id", hostId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/house/houseByHost",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "host-Id": hostId,
            },
          }
        );
        console.log("Response", response.data);
        console.log("Response data detail", response.data.data[0]);
        if (response.data.data && response.data.data.length > 0) {
          setHouses(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetchHouseData: ", error);
      }
    };
    fetchHouseData();
  }, [hostId, token]);

  console.log("House by host id: ", houses);

  useEffect(() => {
    const fetchAllBill = async () => {
      try {
        if (houses && houses._id) {
          const response = await axios.get(
            `http://localhost:5000/api/v1/bill/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const billByHouse = response.data.data.filter(
            (billHouseId) => billHouseId?.houseId === houses._id
          );

          if (billByHouse && billByHouse.length > 0) {
            setBills(billByHouse);
          }
        }
      } catch (error) {
        console.error("Error fetching bills: ", error);
      }
    };

    fetchAllBill();
  }, [houses, token]);

  console.log("Bill by house", bills);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${date.getHours().toString().padStart(2, "0")}:` +
      `${date.getMinutes().toString().padStart(2, "0")}:` +
      `${date.getSeconds().toString().padStart(2, "0")} ` +
      `${date.getDate().toString().padStart(2, "0")}/` +
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  const handleViewDetail = (billId) => {
    navigate(`/manager/invoice-detail/${billId}`);
  };

  const handleCreateInvoice = () => {
    navigate("/manager/invoice/new-invoice");
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/v1/bill/delete/${billId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Remove the deleted bill from the state
        setBills((prevBills) => prevBills.filter((bill) => bill._id !== billId));
        alert(response.data.message || "Bill deleted successfully");
      } catch (error) {
        console.error("Error deleting bill:", error);
        alert(
          error.response?.data?.message || "Failed to delete bill"
        );
      }
    }
  };

  return (
    <div className="mb-8 flex flex-col">
      <div className="shadow overflow-hidden m-6">
        {/* Card Header */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">Invoice List</h6>
        </div>
        {/* Card Body */}
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Phòng",
                  "Mã hóa đơn",
                  "Tổng hóa đơn",
                  "Ngày tạo",
                  "Trạng thái",
                  "Actions",
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
              {bills.map((bill, index) => {
                const cellClass = `py-3 px-6 ${
                  index === bills.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;
                return (
                  <tr
                    key={bill._id}
                    className="hover:bg-gray-300 transition duration-100"
                  >
                    <td className={cellClass}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-gray-700">
                            {bill.roomId?.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {bill.billCode}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {bill.total?.toLocaleString("vi-VN") || "0"} VND
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {formatDate(bill.createdAt)}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <span
                        className={`py-0.5 px-2 text-[11px] font-medium inline-block rounded ${
                          bill.isPaid === true
                            ? "bg-green-600 text-white"
                            : "bg-yellow-600 text-white"
                        }`}
                      >
                        {bill.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <a
                          href={`/manager/invoice-detail/${bill._id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDeleteBill(bill._id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}