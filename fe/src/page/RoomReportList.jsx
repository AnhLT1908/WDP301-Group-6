import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RoomReportList() {
  const [reports, setReports] = useState([]);
  const [creators, setCreators] = useState({});
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
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
        const roomResponse = await axiosInstance.get("/room");

        if (!Array.isArray(houseResponse.data.houses)) {
          console.error("Invalid house data format");
          setLoading(false);
          return;
        }

        const managerHouse = houseResponse.data.houses.find(house => house.hostId === managerId);
        if (!managerHouse) {
          console.error("No house found for manager");
          setLoading(false);
          return;
        }

        const reportResponse = await axiosInstance.get("/problem");
        
        if (Array.isArray(reportResponse.data.data)) {
          const filteredReports = reportResponse.data.data.filter(report => report.houseId === managerHouse._id);
          setReports(filteredReports);
        } else {
          setReports([]);
        }

        const creatorResponse = await axiosInstance.get(`/account/lodger-accout-list`);
        const creatorReportMap = creatorResponse.data.data.reduce((acc, creator) => {
          acc[creator._id] = creator.firstName + " " + creator.lastName;
          return acc;
        }, {});
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
      const report = reports.find(r => r._id === reportId);
      const newStatus = !report.status;
      await axiosInstance.put(`/problem/${reportId}`, { status: newStatus });
      setReports(prevReports => 
        prevReports.map(r => 
          r._id === reportId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Room Report List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Creator</th>
                <th>Room</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} className="border-t">
                  <td>{report.title}</td>
                  <td>{report.type}</td>
                  <td>{creators[report.creatorId]}</td>
                  <td>{rooms[report.roomId]}</td>
                  <td className={report.status ? "text-green-500" : "text-red-500"}>
                    {report.status ? "Solved" : "Unsolved"}
                  </td>
                  <td>
                    <button 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => setSelectedReport(report)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Popup */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Report Detail</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-600 font-semibold">Title:</label>
                <p>{selectedReport.title}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Type:</label>
                <p>{selectedReport.type}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Creator:</label>
                <p>{creators[selectedReport.creatorId]}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Room:</label>
                <p>{rooms[selectedReport.roomId]}</p>
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Status:</label>
                <button
                  onClick={() => handleStatusChange(selectedReport._id)}
                  className={`px-4 py-2 rounded text-white ml-2 ${
                    selectedReport.status 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {selectedReport.status ? "Solved" : "Unsolved"}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 font-semibold">Content:</label>
              <p className="mt-2">{selectedReport.content}</p>
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