import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";

// Comprehensive Chart.js component registration
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    general: {
      houseNumber: 0,
      roomNumber: 0,
      roomNumberNotEmpty: 0,
      roomNumberEmpty: 0,
    },
    revenue: {
      year: new Date().getFullYear(),
      revenueByMonth: Array(12).fill(0),
      billCountByMonth: Array(12).fill(0),
      totalAnnualRevenue: 0,
      averageMonthlyRevenue: 0,
      highestRevenueMonth: 0,
      lowestRevenueMonth: 0,
    },
    bills: {
      billIsPaid: 0,
      totalBillIsPaid: 0,
      billIsNotPaid: 0,
      totalBillIsNotPaid: 0,
      totalBills: 0,
      grandTotal: 0,
      paidPercentage: 0,
    },
    problems: {
      totalProblems: 0,
      resolvedProblems: 0,
      unresolvedProblems: 0,
    },
  });

  // Unified data fetching method
  const fetchStatistics = async () => {
    try {
      const endpoints = [
        { url: "/api/v1/static/general", statKey: "general" },
        { url: "/api/v1/static/revenue", statKey: "revenue" },
        { url: "/api/v1/static/bills", statKey: "bills" },
        { url: "/api/v1/static/problems", statKey: "problems" },
      ];

      const requests = endpoints.map((endpoint) =>
        axios.get(`http://localhost:5000${endpoint.url}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );

      const responses = await Promise.all(requests);

      const updatedStats = {};
      endpoints.forEach((endpoint, index) => {
        updatedStats[endpoint.statKey] = responses[index].data;
      });

      setStats((prevStats) => ({
        ...prevStats,
        ...updatedStats,
      }));
    } catch (error) {
      console.error("Comprehensive statistics fetch error:", error);
    }
  };

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Chart configurations with new data
  const chartConfigurations = {
    roomStatusPie: {
      labels: ["Occupied Rooms", "Empty Rooms"],
      datasets: [
        {
          data: [
            stats.general.roomNumberNotEmpty,
            stats.general.roomNumberEmpty,
          ],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    },
    monthlyRevenueLine: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: `Monthly Revenue (${stats.revenue.year})`,
          data: stats.revenue.revenueByMonth,
          borderColor: "#42A5F5",
          backgroundColor: "rgba(66, 165, 245, 0.2)",
        },
      ],
    },
    billStatusPie: {
      labels: ["Paid Bills", "Unpaid Bills"],
      datasets: [
        {
          data: [stats.bills.billIsPaid, stats.bills.billIsNotPaid],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
    problemStatusPie: {
      labels: ["Resolved", "Unresolved"],
      datasets: [
        {
          data: [
            stats.problems.resolvedProblems,
            stats.problems.unresolvedProblems,
          ],
          backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB", "#4CAF50"],
        },
      ],
    },
    billCountByMonthBar: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: `Bill Count (${stats.revenue.year})`,
          data: stats.revenue.billCountByMonth,
          backgroundColor: "#FFC107",
        },
      ],
    },
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
        Admin Dashboard - Hostel Statistics
      </h1>

      {/* Existing Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Hostels</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.general.houseNumber}
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Rooms</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.general.roomNumber}
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.revenue.totalAnnualRevenue.toLocaleString()} VND
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Problems</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.problems.totalProblems}
          </p>
        </div>
      </div>

      {/* Expanded Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        {/* Existing Charts */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Room Status Distribution
          </h3>
          <Pie data={chartConfigurations.roomStatusPie} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Problem Status Distribution
          </h3>
          <Pie data={chartConfigurations.problemStatusPie} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Monthly Revenue ({stats.revenue.year})
          </h3>
          <Bar
            data={chartConfigurations.monthlyRevenueLine}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Revenue (VND)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Month",
                  },
                },
              },
            }}
          />
        </div>

        {/* New Charts */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Bill Status Distribution
          </h3>
          <Pie data={chartConfigurations.billStatusPie} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Monthly Bill Count ({stats.revenue.year})
          </h3>
          <Bar
            data={chartConfigurations.billCountByMonthBar}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of Bills",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Month",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Additional Revenue and Bill Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Revenue Insights
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">
                Avg. Monthly Revenue
              </h4>
              <p className="text-lg font-bold">
                {stats.revenue.averageMonthlyRevenue.toLocaleString()} VND
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">
                Highest Revenue Month
              </h4>
              <p className="text-lg font-bold">
                {stats.revenue.highestRevenueMonth.toLocaleString()} VND
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">
                Lowest Revenue Month
              </h4>
              <p className="text-lg font-bold">
                {stats.revenue.lowestRevenueMonth.toLocaleString()} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
            Bill Payment Insights
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">Total Bills</h4>
              <p className="text-lg font-bold">{stats.bills.totalBills}</p>
            </div>
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">
                Payment Percentage
              </h4>
              <p className="text-lg font-bold">
                {stats.bills.paidPercentage.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-md font-medium text-gray-600">Grand Total</h4>
              <p className="text-lg font-bold">
                {stats.bills.grandTotal.toLocaleString()} VND
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
