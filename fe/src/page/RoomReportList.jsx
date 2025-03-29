import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function RoomReportList() {
  const [reports, setReports] = useState([]);
  const [creators, setCreators] = useState({});
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${date.getDate().toString().padStart(2, "0")}/` +
      `${date.getMonth().toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  const handleChangePages = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          console.error("No user data found");
          setLoading(false);
          return;
        }

        const { _id: managerId } = JSON.parse(userData);
        if (!managerId) {
          console.error("No manager ID found");
          setLoading(false);
          return;
        }

        const houseResponse = await axiosInstance.get("/house");
        console.log("Report houseResponse", houseResponse);
        const roomResponse = await axiosInstance.get("/room");
        console.log("Report roomResponse", roomResponse);

        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        const managerHouse = houseResponse.data.houses.find(
          (house) => house.hostId === managerId
        );
        console.log("managerHouse", managerHouse);
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        const reportResponse = await axiosInstance.get("/problem");
        console.log("reportResponse", reportResponse.data.data);
        if (Array.isArray(reportResponse.data.data)) {
          const filteredReports = reportResponse.data.data.filter(
            (report) => report.houseId === managerHouse._id
          );
          setReports(filteredReports);
        } else {
          setReports([]);
        }

        console.log("Report get: ", reports);

        const creatorResponse = await axiosInstance.get(
          `/account/lodger-account-list`
        );
        const creatorReportMap = creatorResponse.data.data.reduce(
          (acc, creator) => {
            acc[creator._id] = creator.firstName + " " + creator.lastName;
            return acc;
          },
          {}
        );
        console.log("Report creatorReportMap", creatorReportMap);

        setCreators(creatorReportMap);

        const roomMap = roomResponse.data.data.reduce((acc, room) => {
          acc[room._id] = room.name;
          return acc;
        }, {});
        setRooms(roomMap);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleStatusChange = async (reportId) => {
    try {
      const report = reports.find((r) => r._id === reportId);
      const newStatus = !report.status;
      await axiosInstance.put(`/problem/${reportId}`, { status: newStatus });
      setReports((prevReports) =>
        prevReports.map((r) =>
          r._id === reportId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  console.log("Report list ====", selectedReport);

  return (
    <section className="p-8 w-full">
      <div className="shadow overflow-hidden m-6">
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">
            Danh sách báo cáo vấn đề
          </h6>
        </div>
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  {[
                    "Tiêu Đề",
                    "Loại Vấn Đề",
                    "Phòng",
                    "Người Tạo",
                    "Ngày Tạo",
                    "Trạng thái",
                    "Tính năng",
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
                {reports.map((report, index) => {
                  const cellClass = `py-3 px-6 truncate  ${
                    index === reports.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;
                  return (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-300 transition duration-100"
                    >
                      <td className={cellClass}>
                        <div className="flex items-center gap-4">
                          <div className="overflow-hidden text-ellipsis">
                            <p className="text-sm font-semibold text-blue-gray-700">
                              {report.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {capitalizeFirstLetter(report?.type)}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {report.roomId?.name}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {`${report.creatorId?.lastName} ${report.creatorId?.firstName}`}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {formatDate(report.createdAt)}
                        </p>
                      </td>

                      <td className={cellClass}>
                        <p
                          className={`text-xs font-semibold ${
                            report.status === true
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {report.status === true ? "Đã xử lý" : "Chưa xử lý"}
                        </p>
                      </td>
                      <td className={cellClass}>
                        <button onClick={() => setSelectedReport(report)}>
                          <Eye
                            size={20}
                            className="text-blue-600 hover:text-blue-800"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center mr-2 w-[110px] ${
            currentPage === 1
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-700"
          } p-2 rounded-lg text-base font-semibold text-white`}
        >
          Trang Trước
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
          className="flex justify-center items-center ml-2 w-[110px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Trang Sau
        </button>
      </div>

      {/* Modal Popup */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Chi Tiết Báo Cáo</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-600 font-semibold">Tiêu Đề:</label>
                <p>{selectedReport.title}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">
                  Loại Vấn Đề:
                </label>
                <p>{capitalizeFirstLetter(selectedReport.type)}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">
                  Người Tạo:
                </label>
                <p>{`${selectedReport.creatorId.lastName} ${selectedReport.creatorId.firstName}`}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Phòng:</label>
                <p>{selectedReport.roomId.name}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">
                  Trạng Thái:
                </label>
                <button
                  onClick={() => handleStatusChange(selectedReport._id)}
                  className={`px-4 py-2 rounded text-white ml-2 ${
                    selectedReport.status
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {selectedReport.status ? "Xử Lý" : "Chưa Xử Lý"}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 font-semibold">
                Nội Dung Báo Cáo:
              </label>
              <p className="mt-2">{selectedReport.content}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 font-semibold">Ngày Tạo:</label>
              <p className="mt-2">{formatDate(selectedReport.createdAt)}</p>
            </div>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setSelectedReport(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
