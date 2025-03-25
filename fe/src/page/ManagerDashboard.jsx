import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ManagerDashboard = () => {
  const currentDate = new Date("2025-03-25");

  const [stats, setStats] = useState({
    revenue: {
      year: currentDate.getFullYear(),
      revenueByMonth: Array(12).fill(0),
      billCountByMonth: Array(12).fill(0),
      houseRevenueByMonth: Array(12).fill([]),
      totalAnnualRevenue: 0,
      averageMonthlyRevenue: 0,
      highestRevenueMonth: 0,
      lowestRevenueMonth: 0,
    },
    bills: [],
    problems: {
      problemByHouse: [],
      totalProblems: 0,
      resolvedProblems: 0,
      unresolvedProblems: 0,
    },
  });

  const [filters, setFilters] = useState({
    revenueYear: currentDate.getFullYear().toString(),
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
      case "revenueYear": {
        const year = parseInt(value, 10);
        if (year > currentDate.getFullYear()) {
          errors.revenueYear = "Year cannot exceed current year (2025)";
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
        { 
          url: "/api/v1/static/house/revenues", 
          statKey: "revenue",
          params: { year: filters.revenueYear }
        },
        { 
          url: "/api/v1/static/house/bills", 
          statKey: "bills",
          params: {
            month: filters.billMonth || null,
            isPaid: filters.billIsPaid === "" ? null : filters.billIsPaid === "true",
          }
        },
        { 
          url: "/api/v1/static/house/problems", 
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
          params: endpoint.params
        })
      );

      const responses = await Promise.all(requests);
      const updatedStats = {};
      endpoints.forEach((endpoint, index) => {
        console.log(`Raw response from ${endpoint.url}:`, responses[index].data);
        updatedStats[endpoint.statKey] = responses[index].data;
      });

      setStats((prevStats) => {
        const newStats = { ...prevStats, ...updatedStats };
        console.log("New stats after update:", newStats);
        return newStats;
      });
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
    }
  };

  // Fetch dữ liệu ban đầu khi mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch lại khi filters thay đổi
  useEffect(() => {
    const criticalErrors = ["revenueYear", "billMonth", "problemStartDate", "problemEndDate"];
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
    monthlyRevenueBar: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: `Monthly Revenue (${stats.revenue.year})`,
        data: stats.revenue.revenueByMonth,
        backgroundColor: "#42A5F5",
      }],
    },
    billStatusPie: {
      labels: ["Paid Bills", "Unpaid Bills"],
      datasets: [{
        data: [
          stats.bills.reduce((sum, house) => sum + (house.billIsPaid || 0), 0),
          stats.bills.reduce((sum, house) => sum + (house.billIsNotPaid || 0), 0)
        ],
        backgroundColor: ["#4CAF50", "#F44336"],
      }],
    },
    problemStatusPie: {
      labels: ["Resolved", "Unresolved"],
      datasets: [{
        data: [
          stats.problems.resolvedProblems || 0,
          stats.problems.unresolvedProblems || 0
        ],
        backgroundColor: ["#4CAF50", "#FF6384"],
      }],
    },
    billCountBar: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: `Bill Count (${stats.revenue.year})`,
        data: stats.revenue.billCountByMonth,
        backgroundColor: "#FFC107",
      }],
    },
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
        Manager Dashboard - House Statistics
      </h1>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.revenue.totalAnnualRevenue.toLocaleString()} VND
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Bills</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.bills.reduce((sum, house) => sum + (house.totalBills || 0), 0)}
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Total Problems</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.problems.totalProblems || 0}
          </p>
        </div>
        <div className="bg-gray-100 p-5 rounded-lg text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-600">Paid Percentage</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {stats.bills.length > 0 
              ? (stats.bills.reduce((sum, house) => sum + (house.paidPercentage || 0), 0) / stats.bills.length).toFixed(2)
              : 0}%
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
              name="revenueYear"
              value={filters.revenueYear}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            />
            {errors.revenueYear && (
              <p className="text-red-500 text-sm mt-1">{errors.revenueYear}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Monthly Revenue ({stats.revenue.year})
            </h4>
            <Bar data={chartConfigurations.monthlyRevenueBar} />
          </div>
          <div>
            <h4 className="text-center text-lg font-semibold text-gray-700 mb-5">
              Monthly Bill Count ({stats.revenue.year})
            </h4>
            <Bar data={chartConfigurations.billCountBar} />
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
            {errors.billMonth && (
              <p className="text-red-500 text-sm mt-1">{errors.billMonth}</p>
            )}
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
                <h4 className="text-md font-medium text-gray-600">Total Paid Amount</h4>
                <p className="text-lg font-bold">
                  {stats.bills.reduce((sum, house) => sum + (house.totalBillIsPaid || 0), 0).toLocaleString()} VND
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-md font-medium text-gray-600">Total Unpaid Amount</h4>
                <p className="text-lg font-bold">
                  {stats.bills.reduce((sum, house) => sum + (house.totalBillIsNotPaid || 0), 0).toLocaleString()} VND
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
    </div>
  );
};

export default ManagerDashboard;