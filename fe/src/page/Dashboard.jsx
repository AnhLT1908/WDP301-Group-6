import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [generalStats, setGeneralStats] = useState({
    houseNumber: 0,
    roomNumber: 0,
    roomNumberNotEmpty: 0,
    roomNumberEmpty: 0,
  });
  const [revenueStats, setRevenueStats] = useState({
    year: new Date().getFullYear(),
    revenueByMonth: Array(12).fill(0),
  });
  const [billsStats, setBillsStats] = useState({
    billIsPaid: 0,
    totalBillIsPaid: 0,
    billIsNotPaid: 0,
    totalBillIsNotPaid: 0,
  });
  const [problemStats, setProblemStats] = useState({
    numberProblemNone: 0,
    numberProblemDoing: 0,
    numberProblemDone: 0,
  });

  // Gọi các API để lấy dữ liệu thống kê
  useEffect(() => {
    const fetchGeneralStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/static/general', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token nếu cần
          },
        });
        const data = response.data;
        setGeneralStats({
          houseNumber: data.houseNumber || 0,
          roomNumber: data.roomNumber || 0,
          roomNumberNotEmpty: data.roomNumberNotEmpty || 0,
          roomNumberEmpty: data.roomNumberEmpty || 0,
        });
      } catch (error) {
        console.error('Error fetching general statistics:', error);
      }
    };

    const fetchRevenueStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/static/revenue', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data;
        setRevenueStats({
          year: data.year || new Date().getFullYear(),
          revenueByMonth: data.revenueByMonth || Array(12).fill(0),
        });
      } catch (error) {
        console.error('Error fetching revenue statistics:', error);
      }
    };

    const fetchBillsStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/static/bills', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data;
        setBillsStats({
          billIsPaid: data.billIsPaid || 0,
          totalBillIsPaid: data.totalBillIsPaid || 0,
          billIsNotPaid: data.billIsNotPaid || 0,
          totalBillIsNotPaid: data.totalBillIsNotPaid || 0,
        });
      } catch (error) {
        console.error('Error fetching bills statistics:', error);
      }
    };

    const fetchProblemStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/static/problems', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data;
        setProblemStats({
          numberProblemNone: data.numberProblemNone || 0,
          numberProblemDoing: data.numberProblemDoing || 0,
          numberProblemDone: data.numberProblemDone || 0,
        });
      } catch (error) {
        console.error('Error fetching problem statistics:', error);
      }
    };

    // Gọi tất cả các API
    fetchGeneralStats();
    fetchRevenueStats();
    fetchBillsStats();
    fetchProblemStats();
  }, []);

  // Tính tổng doanh thu từ revenueByMonth
  const totalRevenue = revenueStats.revenueByMonth.reduce((sum, revenue) => sum + revenue, 0);

  // Dữ liệu cho biểu đồ Pie (Trạng thái phòng)
  const roomStatusData = {
    labels: ['Empty', 'Occupied'],
    datasets: [
      {
        label: 'Room Status',
        data: [generalStats.roomNumberEmpty, generalStats.roomNumberNotEmpty],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  // Dữ liệu cho biểu đồ Bar (Doanh thu theo tháng)
  const monthlyRevenueData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    datasets: [
      {
        label: `Monthly Revenue (VND) - ${revenueStats.year}`,
        data: revenueStats.revenueByMonth,
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ Pie (Trạng thái vấn đề)
  const problemStatusData = {
    labels: ['None', 'Doing', 'Done'],
    datasets: [
      {
        label: 'Problem Status',
        data: [
          problemStats.numberProblemNone,
          problemStats.numberProblemDoing,
          problemStats.numberProblemDone,
        ],
        backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
        Admin Dashboard - Hostel Statistics
      </h1>

      {/* Các thẻ hiển thị số liệu chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Hostels</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{generalStats.houseNumber}</p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Rooms</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{generalStats.roomNumber}</p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {totalRevenue.toLocaleString()} VND
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Problems</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {problemStats.numberProblemNone +
              problemStats.numberProblemDoing +
              problemStats.numberProblemDone}
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Room Status Distribution
          </h3>
          <Pie data={roomStatusData} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Problem Status Distribution
          </h3>
          <Pie data={problemStatusData} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Monthly Revenue ({revenueStats.year})
          </h3>
          <Bar
            data={monthlyRevenueData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Revenue (VND)',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Month',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Thống kê hóa đơn */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-10">
        <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
          Bills Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-600">Paid Bills</h4>
            <p className="text-2xl font-bold text-green-600">{billsStats.billIsPaid}</p>
            <p className="text-gray-600">
              Total: {billsStats.totalBillIsPaid.toLocaleString()} VND
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-600">Unpaid Bills</h4>
            <p className="text-2xl font-bold text-red-600">{billsStats.billIsNotPaid}</p>
            <p className="text-gray-600">
              Total: {billsStats.totalBillIsNotPaid.toLocaleString()} VND
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;