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

  return (
    <div className="mb-8 flex flex-col">
      {/* Card Container */}
      {/* <div className="m-6">
        <button className="flex justify-center items-center rounded-md font-medium text-white bg-green-600 p-6 w-[100px] h-[50px]">
          Back
        </button>
      </div> */}
      <div className="shadow overflow-hidden m-6">
        {/* Card Header */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">Invoice List</h6>
          {/* <button
            onClick={handleCreateAccount}
            className="bg-white text-green-500 hover:bg-green-900  transition duration-300 font-bold px-6 py-2 rounded-xl shadow-md"
          >
            Create new account
          </button> */}
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
                  index === bill.length - 1
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
                      <a
                        href={`/manager/invoice-detail/${bill._id}`}
                        className="text-xs font-semibold text-blue-gray-600 hover:underline"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center mr-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Previous
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleChangePages(pageNum)}
                className={`flex items-center justify-center px-3 py-1 text-lg font-semibold rounded-md ${
                  pageNum === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-green-500 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleChangePages(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex justify-center items-center ml-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Next
        </button>
      </div> */}
    </div>
  );
}
