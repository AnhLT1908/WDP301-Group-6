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
  const currentDate = new Date("2025-03-25");

  const [stats, setStats] = useState({
    general: {
      houseNumber: 0,
      roomNumber: 0,
      roomNumberNotEmpty: 0,
      roomNumberEmpty: 0,
    },
    revenue: {
      year: currentDate.getFullYear(),
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

  const [filters, setFilters] = useState({
    year: currentDate.getFullYear().toString(),
    billMonth: "",
    billIsPaid: "",
    problemStartDate: "",
    problemEndDate: "",
    problemStatus: "",
  });

  const [errors, setErrors] = useState({});

  const validateFilters = (name, value) => {
    const errors = {};

    switch (name) {
      case "year": {
        const year = parseInt(value, 10);
        if (year > currentDate.getFullYear()) {
          errors.year = "Year cannot exceed current year (2025)";
        }
        break;
      }
      case "billMonth": {
        if (value) {
          const [month, year] = value.split("-").map(Number);
          const billDate = new Date(year, month - 1, 1);
          if (billDate > currentDate) {
            errors.billMonth = "Month cannot be in the future";
          }
          if (!/^\d{2}-\d{4}$/.test(value) || month < 1 || month > 12) {
            errors.billMonth = "Invalid format (MM-YYYY)";
          }
        }
        break;
      }
      case "problemStartDate": {
        if (value) {
          const startDate = new Date(value);
          if (startDate > currentDate) {
            errors.problemStartDate = "Start date cannot be in the future";
          }
        }
        break;
      }
      case "problemEndDate": {
        if (value) {
          const endDate = new Date(value);
          if (endDate > currentDate) {
            errors.problemEndDate = "End date cannot be in the future";
          }
          if (filters.problemStartDate && new Date(filters.problemStartDate) > endDate) {
            errors.problemEndDate = "End date cannot be before start date";
          }
        }
        break;
      }
      default:
        break;
    }
    return errors;
  };

  const fetchStatistics = async () => {
    try {
      const endpoints = [
        { url: "/api/v1/static/general", statKey: "general", params: {} },
        { 
          url: "/api/v1/static/revenue", 
          statKey: "revenue", 
          params: { year: filters.year } 
        },
        { 
          url: "/api/v1/static/bills", 
          statKey: "bills", 
          params: {
            month: filters.billMonth || null,
            isPaid: filters.billIsPaid === "" ? null : filters.billIsPaid === "true",
          }
        },
        { 
          url: "/api/v1/static/problems", 
          statKey: "problems", 
          params: {
            startDate: filters.problemStartDate || null,
            endDate: filters.problemEndDate || null,
            status: filters.problemStatus === "" ? null : filters.problemStatus === "true",
          }
        },
      ];

      console.log("Fetching with params:");
      endpoints.forEach(endpoint => console.log(`${endpoint.url}:`, endpoint.params));

      const requests = endpoints.map((endpoint) =>
        axios.get(`http://localhost:5000${endpoint.url}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: endpoint.params,
        })
      );

      const responses = await Promise.all(requests);
      const updatedStats = {};
      endpoints.forEach((endpoint, index) => {
        console.log(`Response from ${endpoint.url}:`, responses[index].data);
        updatedStats[endpoint.statKey] = responses[index].data;
      });

      setStats((prevStats) => ({
        ...prevStats,
        ...updatedStats,
      }));
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    const criticalErrors = ["year", "billMonth", "problemStartDate", "problemEndDate"];
    const hasCriticalError = criticalErrors.some(key => errors[key]);
    if (!hasCriticalError) {
      fetchStatistics();
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const validationErrors = validateFilters(name, value);

    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      console.log("New filters:", newFilters);
      return newFilters;
    });
    setErrors((prev) => ({ ...prev, ...validationErrors }));
  };

  const chartConfigurations = {
    roomStatusPie: {
      labels: ["Occupied Rooms", "Empty Rooms"],
      datasets: [
        {
          data: [stats.general.roomNumberNotEmpty, stats.general.roomNumberEmpty],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    },
    monthlyRevenueLine: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: `Monthly Revenue (${filters.year})`,
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
          data: [
            filters.billIsPaid === "true" ? stats.bills.billIsPaid : 
            filters.billIsPaid === "false" ? 0 : stats.bills.billIsPaid,
            filters.billIsPaid === "true" ? 0 : 
            filters.billIsPaid === "false" ? stats.bills.billIsNotPaid : stats.bills.billIsNotPaid
          ],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
    problemStatusPie: {
      labels: ["Resolved", "Unresolved"],
      datasets: [
        {
          data: [
            filters.problemStatus === "true" ? stats.problems.resolvedProblems : 
            filters.problemStatus === "false" ? 0 : stats.problems.resolvedProblems,
            filters.problemStatus === "true" ? 0 : 
            filters.problemStatus === "false" ? stats.problems.unresolvedProblems : stats.problems.unresolvedProblems
          ],
          backgroundColor: ["#FF6384", "#FFCE56"],
        },
      ],
    },
    billCountByMonthBar: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: `Bill Count (${filters.year})`,
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

      {/* Key Performance Indicators */}
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

      {/* Revenue Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-10">
        <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
          Revenue Statistics
        </h3>
        <div className="flex flex-wrap gap-4 mb-5 justify-center">
          <div>
            <label className="block text-gray-700 mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            />
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Monthly Revenue ({filters.year})
            </h4>
            <Bar
              data={chartConfigurations.monthlyRevenueLine}
              options={{
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: "Revenue (VND)" } },
                  x: { title: { display: true, text: "Month" } },
                },
              }}
            />
          </div>
          <div>
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Monthly Bill Count ({filters.year})
            </h4>
            <Bar
              data={chartConfigurations.billCountByMonthBar}
              options={{
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: "Number of Bills" } },
                  x: { title: { display: true, text: "Month" } },
                },
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <div className="text-center">
            <h4 className="text-md font-medium text-gray-600">Avg. Monthly Revenue</h4>
            <p className="text-lg font-bold">
              {stats.revenue.averageMonthlyRevenue.toLocaleString()} VND
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-md font-medium text-gray-600">Highest Revenue Month</h4>
            <p className="text-lg font-bold">
              {stats.revenue.highestRevenueMonth.toLocaleString()} VND
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-md font-medium text-gray-600">Lowest Revenue Month</h4>
            <p className="text-lg font-bold">
              {stats.revenue.lowestRevenueMonth.toLocaleString()} VND
            </p>
          </div>
        </div>
      </div>

      {/* Bills Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-10">
        <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
          Bill Statistics
        </h3>
        <div className="flex flex-wrap gap-4 mb-5 justify-center">
          <div>
            <label className="block text-gray-700 mb-2">Month (MM-YYYY)</label>
            <input
              type="text"
              name="billMonth"
              value={filters.billMonth}
              onChange={handleFilterChange}
              placeholder="e.g., 03-2025"
              className="p-2 rounded border"
            />
            {errors.billMonth && <p className="text-red-500 text-sm mt-1">{errors.billMonth}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="billIsPaid"
              value={filters.billIsPaid}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            >
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Bill Status Distribution
            </h4>
            <Pie data={chartConfigurations.billStatusPie} />
          </div>
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <h4 className="text-md font-medium text-gray-600">Total Bills</h4>
                <p className="text-lg font-bold">{stats.bills.totalBills}</p>
              </div>
              <div className="text-center">
                <h4 className="text-md font-medium text-gray-600">Payment Percentage</h4>
                <p className="text-lg font-bold">{stats.bills.paidPercentage.toFixed(2)}%</p>
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

      {/* Problems Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-10">
        <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
          Problem Statistics
        </h3>
        <div className="flex flex-wrap gap-4 mb-5 justify-center">
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="problemStartDate"
              value={filters.problemStartDate}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            />
            {errors.problemStartDate && (
              <p className="text-red-500 text-sm mt-1">{errors.problemStartDate}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="problemEndDate"
              value={filters.problemEndDate}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            />
            {errors.problemEndDate && (
              <p className="text-red-500 text-sm mt-1">{errors.problemEndDate}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="problemStatus"
              value={filters.problemStatus}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            >
              <option value="">All</option>
              <option value="true">Resolved</option>
              <option value="false">Unresolved</option>
            </select>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Problem Status Distribution
            </h4>
            <Pie data={chartConfigurations.problemStatusPie} />
          </div>
        </div>
      </div>

      {/* Room Status Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-10">
        <h3 className="text-center text-xl font-semibold text-gray-700 mb-5">
          Room Status Distribution
        </h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Pie data={chartConfigurations.roomStatusPie} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;