import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState({});
  const [houses, setHouses] = useState({});
  const [accounts, setAccounts] = useState({});
  const [bills, setBills] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isBillPopupOpen, setIsBillPopupOpen] = useState(false);
  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
  const [isReportsListPopupOpen, setIsReportsListPopupOpen] = useState(false);
  const [isReportDetailPopupOpen, setIsReportDetailPopupOpen] = useState(false);
  const [isTransferPopupOpen, setIsTransferPopupOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    type: "",
    content: "",
    roomId: "",
  });
  const [transferForm, setTransferForm] = useState({
    content: "",
    roomId: "",
  });
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          console.log("No user data found");
          return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setReportForm((prev) => ({ ...prev, roomId: parsedUser.roomId }));
        setTransferForm((prev) => ({ ...prev, roomId: parsedUser.roomId }));

        const roomResponse = await axiosInstance.get("/room");
        const roomMap = roomResponse.data.data.reduce((acc, room) => {
          acc[room._id] = room.name;
          return acc;
        }, {});
        setRoom(roomMap);

        const houseResponse = await axiosInstance.get("/house");
        const houseMap = houseResponse.data.houses.reduce((acc, house) => {
          acc[house._id] = house.name;
          return acc;
        }, {});
        setHouses(houseMap);

        const accountResponse = await axiosInstance.get(
          "/account/lodger-account-list"
        );
        const accountMap = accountResponse.data.data.reduce((acc, account) => {
          acc[account._id] = `${account.firstName} ${account.lastName}`;
          return acc;
        }, {});
        setAccounts(accountMap);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axiosInstance.get("/bill/");
      const filteredBills = res.data.data.filter(
        (bill) => bill.roomId === user?.roomId
      );
      setBills(filteredBills);
      setIsBillPopupOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportResponse = await axiosInstance.get("/problem");
      const filteredReports = reportResponse.data.data.filter(
        (report) => report.roomId === user?.roomId
      );
      setReports(filteredReports);
      setIsReportsListPopupOpen(true);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchReportDetail = async (problemId) => {
    try {
      const response = await axiosInstance.get(`/problem/${problemId}`);
      setSelectedReport(response.data.data);
      setIsReportDetailPopupOpen(true);
    } catch (error) {
      console.error("Error fetching report detail:", error);
      alert(
        "Không thể tải chi tiết báo cáo: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleViewBillDetail = (billId) => {
    if (!billId) {
      console.error("Bill ID is undefined");
      return;
    }
    navigate(`/lodger-invoice/${billId}`);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/problem/Add-problem", {
        title: reportForm.title,
        type: reportForm.type,
        content: reportForm.content,
        roomId: reportForm.roomId,
      });
      console.log("Report created:", response.data);
      setIsReportPopupOpen(false);
      setReportForm({
        title: "",
        type: "",
        content: "",
        roomId: user?.roomId,
      });
      alert("Báo cáo đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating report:", error);
      alert(
        "Không thể tạo báo cáo: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/problem", transferForm);
      console.log("Transfer request created:", response.data);
      setIsTransferPopupOpen(false);
      setTransferForm({
        content: "",
        roomId: user?.roomId,
      });
      alert("Yêu cầu chuyển phòng đã được gửi thành công!");
    } catch (error) {
      console.error("Error creating transfer request:", error);
      alert(
        "Không thể gửi yêu cầu chuyển phòng: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
            <div className="ml-4">
              <p className="text-lg font-medium">
                {user?.firstName + " " + user?.lastName}
              </p>
              <p className="text-gray-600">{user?.accountType}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">User Information</h2>
          <p>
            <strong>Identify Card:</strong> {user?.identityCard}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Phone:</strong> {user?.phone}
          </p>
          <p>
            <strong>Gender:</strong> {user?.gender}
          </p>
          <p>
            <strong>Room:</strong> {room[user?.roomId]}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded w-full"
            onClick={fetchBills}
          >
            Xem hóa đơn phòng
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded w-full"
            onClick={() => setIsReportPopupOpen(true)}
          >
            Tạo báo cáo
          </button>
          <button
            className="bg-yellow-500 text-white px-6 py-3 rounded w-full"
            onClick={fetchReports}
          >
            Xem báo cáo phòng
          </button>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded w-full"
            onClick={() => setIsTransferPopupOpen(true)}
          >
            Yêu cầu chuyển phòng
          </button>
        </div>

        {isBillPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Danh sách hóa đơn</h3>
              <ul>
                {bills.map((bill) => (
                  <li key={bill._id} className="mb-4">
                    <p>Note: {bill.note}</p>
                    <p>Total: {bill.total}</p>
                    <p>Status: {bill.status}</p>
                    <button
                      onClick={() => handleViewBillDetail(bill._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Xem chi tiết
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsBillPopupOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded w-full mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {isReportPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Tạo báo cáo mới</h3>
              <form onSubmit={handleReportSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Tiêu đề:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={reportForm.title}
                    onChange={handleReportChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Loại:
                  </label>
                  <select
                    name="type"
                    value={reportForm.type}
                    onChange={handleReportChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Chọn loại</option>
                    <option value="common">Chung</option>
                    <option value="electric">Điện</option>
                    <option value="water">Nước</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Nội dung:
                  </label>
                  <textarea
                    name="content"
                    value={reportForm.content}
                    onChange={handleReportChange}
                    className="w-full px-3 py-2 border rounded"
                    rows="4"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Gửi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReportPopupOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isReportsListPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Danh sách báo cáo</h3>
              <ul>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <li key={report._id} className="mb-4">
                      <p>
                        <strong>Tiêu đề:</strong> {report.title}
                      </p>
                      <p>
                        <strong>Loại:</strong> {report.type}
                      </p>
                      <p>
                        <strong>Nội dung:</strong> {report.content}
                      </p>
                      <p>
                        <strong>Phòng:</strong> {room[report.roomId]}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>
                        <span
                          className={
                            report.status ? "text-green-500" : "text-red-500"
                          }
                        >
                          {report.status ? "Đã giải quyết" : "Chưa giải quyết"}
                        </span>
                      </p>
                      <button
                        onClick={() => fetchReportDetail(report._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                      >
                        Xem chi tiết
                      </button>
                    </li>
                  ))
                ) : (
                  <p>Không có báo cáo nào cho phòng này.</p>
                )}
              </ul>
              <button
                onClick={() => setIsReportsListPopupOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded w-full mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {isReportDetailPopupOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Chi tiết báo cáo</h3>
              <p>
                <strong>Tiêu đề:</strong> {selectedReport.title}
              </p>
              <p>
                <strong>Loại:</strong> {selectedReport.type}
              </p>
              <p>
                <strong>Nội dung:</strong> {selectedReport.content}
              </p>
              <p>
                <strong>Phòng:</strong> {room[selectedReport.roomId]}
              </p>
              <p>
                <strong>Nhà:</strong> {houses[selectedReport.houseId]}
              </p>
              <p>
                <strong>Trạng thái:</strong>
                <span
                  className={
                    selectedReport.status ? "text-green-500" : "text-red-500"
                  }
                >
                  {selectedReport.status ? "Đã giải quyết" : "Chưa giải quyết"}
                </span>
              </p>
              <p>
                <strong>Người tạo:</strong> {accounts[selectedReport.creatorId]}
              </p>
              <button
                onClick={() => setIsReportDetailPopupOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded w-full mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {isTransferPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">
                Yêu cầu chuyển phòng
              </h3>
              <form onSubmit={handleTransferSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Lý do chuyển phòng:
                  </label>
                  <textarea
                    name="content"
                    value={transferForm.content}
                    onChange={handleTransferChange}
                    className="w-full px-3 py-2 border rounded"
                    rows="4"
                    placeholder="Nhập lý do bạn muốn chuyển phòng (không bắt buộc)"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Gửi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTransferPopupOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
