import getCurrentUser from "../utils/getCurrentUser.js";
import House from "../model/House.js";
import Room from "../model/Room.js";
import Bills from "../model/Bills.js";
import Problem from "../model/Problem.js";

export const statisticGeneral = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    // Find houses specifically owned by the current user
    const houses = await House.find();

    console.log("houses", houses);

    // Early return if no houses found
    if (houses.length === 0) {
      return res.json({
        houseNumber: 0,
        roomNumber: 0,
        roomNumberNotEmpty: 0,
        roomNumberEmpty: 0,
      });
    }

    // Aggregate rooms data for the user's houses
    const roomsData = await Room.aggregate([
      {
        $match: {
          house: { $in: houses.map((h) => h._id) },
          deleted: false,
        },
      },
      {
        $group: {
          _id: "$house",
          totalRooms: { $sum: 1 },
          emptyRooms: {
            $sum: { $cond: [{ $eq: [{ $size: "$members" }, 0] }, 1, 0] },
          },
        },
      },
    ]);

    // Calculate aggregate statistics
    const houseNumber = houses.length;
    const roomNumber = roomsData.reduce(
      (sum, data) => sum + data.totalRooms,
      0
    );
    const roomNumberEmpty = roomsData.reduce(
      (sum, data) => sum + data.emptyRooms,
      0
    );

    // Return comprehensive statistics
    res.json({
      houseNumber,
      roomNumber,
      roomNumberNotEmpty: roomNumber - roomNumberEmpty,
      roomNumberEmpty,
    });
  } catch (error) {
    next(error);
  }
};

export const statisticAllBills = async (req, res, next) => {
  try {
    // Destructure query parameters with optional chaining and default values
    const { month, isPaid = null, houseId = null, roomId = null } = req.query;

    // Construct dynamic date filter for monthly bill statistics
    let dateFilter = {};
    if (month) {
      const [mm, yyyy] = month.split("-");
      const startOfMonth = new Date(Date.UTC(yyyy, mm - 1, 1));
      const endOfMonth = new Date(Date.UTC(yyyy, mm, 0));
      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      };
    }

    // Construct dynamic query filter
    const queryFilter = {
      ...dateFilter,
      ...(isPaid !== null && { isPaid }),
      ...(houseId && { houseId: new mongoose.Types.ObjectId(houseId) }),
      ...(roomId && { roomId: new mongoose.Types.ObjectId(roomId) }),
    };

    // Advanced aggregation for comprehensive bill statistics
    const billStats = await Bills.aggregate([
      { $match: queryFilter },
      {
        $group: {
          _id: null,
          billIsPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] },
          },
          totalBillIsPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$total", 0] },
          },
          billIsNotPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] },
          },
          totalBillIsNotPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$total", 0] },
          },
          totalBills: { $sum: 1 },
          grandTotal: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          billIsPaid: 1,
          totalBillIsPaid: 1,
          billIsNotPaid: 1,
          totalBillIsNotPaid: 1,
          totalBills: 1,
          grandTotal: 1,
          paidPercentage: {
            $multiply: [{ $divide: ["$billIsPaid", "$totalBills"] }, 100],
          },
        },
      },
    ]);

    // Handle scenario with no bills
    const stats =
      billStats.length > 0
        ? billStats[0]
        : {
            billIsPaid: 0,
            totalBillIsPaid: 0,
            billIsNotPaid: 0,
            totalBillIsNotPaid: 0,
            totalBills: 0,
            grandTotal: 0,
            paidPercentage: 0,
          };

    res.json(stats);
  } catch (error) {
    console.error("Error in statisticAllBills:", error);
    next(error);
  }
};

export const statisticHouselBills = async (req, res, next) => {
  try {
    // Validate user authentication and authorization
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Destructure query parameters with optional chaining and default values
    const { month, isPaid = null, houseId = null, roomId = null } = req.query;

    const currentUser = req.user;

    // Validate user account type
    if (currentUser.accountType !== "Manager") {
      return res.status(403).json({
        message: "Access denied. Requires Manager account type",
      });
    }

    // Find houses owned by the current user
    const userHouses = await House.find({
      hostId: currentUser._id,
      deleted: false,
    });

    console.log("userHouses", userHouses);
    // Extract house IDs to use in bill filtering
    const userHouseIds = userHouses.map((house) => house._id);

    // Construct dynamic date filter for monthly bill statistics
    let dateFilter = {};
    if (month) {
      const [mm, yyyy] = month.split("-");
      const startOfMonth = new Date(Date.UTC(yyyy, mm - 1, 1));
      const endOfMonth = new Date(Date.UTC(yyyy, mm, 0));
      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      };
    }

    // Construct dynamic query filter with house ownership constraint
    const queryFilter = {
      ...dateFilter,
      houseId: { $in: userHouseIds }, // Restrict to user's houses
      ...(isPaid !== null && { isPaid }),
      ...(houseId && {
        houseId: new mongoose.Types.ObjectId(houseId),
      }),
      ...(roomId && {
        roomId: new mongoose.Types.ObjectId(roomId),
      }),
    };

    // Advanced aggregation for comprehensive bill statistics
    const billStats = await Bills.aggregate([
      { $match: queryFilter },
      {
        $group: {
          _id: "$houseId", // Group by house for more detailed insights
          billIsPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] },
          },
          totalBillIsPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$total", 0] },
          },
          billIsNotPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] },
          },
          totalBillIsNotPaid: {
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$total", 0] },
          },
          totalBills: { $sum: 1 },
          grandTotal: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          houseId: "$_id",
          billIsPaid: 1,
          totalBillIsPaid: 1,
          billIsNotPaid: 1,
          totalBillIsNotPaid: 1,
          totalBills: 1,
          grandTotal: 1,
          paidPercentage: {
            $multiply: [
              { $divide: ["$billIsPaid", { $max: ["$totalBills", 1] }] },
              100,
            ],
          },
        },
      },
      // Optional: Lookup house details for additional context
      {
        $lookup: {
          from: "houses", // Ensure this matches your collection name
          localField: "houseId",
          foreignField: "_id",
          as: "houseDetails",
        },
      },
      {
        $unwind: "$houseDetails",
      },
      {
        $addFields: {
          houseName: "$houseDetails.name",
        },
      },
    ]);

    // Handle scenario with no bills
    const stats =
      billStats.length > 0
        ? billStats
        : [
            {
              billIsPaid: 0,
              totalBillIsPaid: 0,
              billIsNotPaid: 0,
              totalBillIsNotPaid: 0,
              totalBills: 0,
              grandTotal: 0,
              paidPercentage: 0,
              houseId: null,
              houseName: null,
            },
          ];

    res.json(stats);
  } catch (error) {
    console.error("Error in statisticHouselBills:", error);
    next(error);
  }
};

export const statisticProblem = async (req, res, next) => {
  try {
    // Destructure query parameters with optional chaining
    const {
      type = null,
      status = null,
      startDate = null,
      endDate = null,
      houseId = null,
      roomId = null,
    } = req.query;

    // Construct dynamic date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Construct dynamic query filter
    const queryFilter = {
      deleted: false,
      ...dateFilter,
      ...(type && { type }),
      ...(status !== null && { status }),
      ...(houseId && { houseId: new mongoose.Types.ObjectId(houseId) }),
      ...(roomId && { roomId: new mongoose.Types.ObjectId(roomId) }),
    };

    // Advanced aggregation for comprehensive problem statistics
    const problemStats = await Problem.aggregate([
      { $match: queryFilter },
      {
        $facet: {
          // Total problems by type and status
          problemTypeBreakdown: [
            {
              $group: {
                _id: "$type",
                total: { $sum: 1 },
                resolved: {
                  $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
                },
                unresolved: {
                  $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] },
                },
              },
            },
          ],

          // Overall statistics
          overallStats: [
            {
              $group: {
                _id: null,
                totalProblems: { $sum: 1 },
                resolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
                },
                unresolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          problemTypes: {
            common: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$problemTypeBreakdown",
                    as: "type",
                    cond: { $eq: ["$$type._id", "common"] },
                  },
                },
                0,
              ],
            },
            electric: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$problemTypeBreakdown",
                    as: "type",
                    cond: { $eq: ["$$type._id", "electric"] },
                  },
                },
                0,
              ],
            },
            water: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$problemTypeBreakdown",
                    as: "type",
                    cond: { $eq: ["$$type._id", "water"] },
                  },
                },
                0,
              ],
            },
            other: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$problemTypeBreakdown",
                    as: "type",
                    cond: { $eq: ["$$type._id", "other"] },
                  },
                },
                0,
              ],
            },
          },
          totalProblems: { $arrayElemAt: ["$overallStats.totalProblems", 0] },
          resolvedProblems: {
            $arrayElemAt: ["$overallStats.resolvedProblems", 0],
          },
          unresolvedProblems: {
            $arrayElemAt: ["$overallStats.unresolvedProblems", 0],
          },
        },
      },
    ]);

    // Handle scenario with no problems
    const stats =
      problemStats.length > 0
        ? problemStats[0]
        : {
            problemTypes: {
              common: { total: 0, resolved: 0, unresolved: 0 },
              electric: { total: 0, resolved: 0, unresolved: 0 },
              water: { total: 0, resolved: 0, unresolved: 0 },
              other: { total: 0, resolved: 0, unresolved: 0 },
            },
            totalProblems: 0,
            resolvedProblems: 0,
            unresolvedProblems: 0,
          };

    res.json(stats);
  } catch (error) {
    console.error("Error in statisticProblem:", error);
    next(error);
  }
};

export const statisticRevenue = async (req, res, next) => {
  try {
    // Allow optional year specification via query parameter
    const { year: requestedYear } = req.query;
    const currentYear = requestedYear
      ? parseInt(requestedYear, 10)
      : new Date().getFullYear();

    // Advanced revenue aggregation pipeline
    const revenueStats = await Bills.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(Date.UTC(currentYear, 0, 1)),
            $lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$total" },
          billCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Initialize revenue array with zero values
    const revenueByMonth = Array(12).fill(0);
    const billCountByMonth = Array(12).fill(0);

    // Populate revenue and bill count arrays
    revenueStats.forEach(({ _id: month, totalRevenue, billCount }) => {
      // Adjust for zero-based array indexing
      revenueByMonth[month - 1] = totalRevenue;
      billCountByMonth[month - 1] = billCount;
    });

    // Calculate comprehensive revenue statistics
    const annualStats = {
      year: currentYear,
      revenueByMonth,
      billCountByMonth,
      totalAnnualRevenue: revenueByMonth.reduce(
        (sum, revenue) => sum + revenue,
        0
      ),
      averageMonthlyRevenue: Math.floor(
        revenueByMonth.reduce((sum, revenue) => sum + revenue, 0) / 12
      ),
      highestRevenueMonth: Math.max(...revenueByMonth),
      lowestRevenueMonth: Math.min(...revenueByMonth),
    };

    res.json(annualStats);
  } catch (error) {
    console.error("Comprehensive Revenue Statistics Error:", error);
    next(error);
  }
};

export const statisticHouseProblem = async (req, res, next) => {
  try {
    // Validate user authentication and authorization
    if (!req.user || req.user.accountType !== "Manager") {
      return res.status(403).json({
        message: "Access denied. Requires Manager account type",
      });
    }

    // Destructure query parameters with optional chaining
    const {
      type = null,
      status = null,
      startDate = null,
      endDate = null,
      houseId = null,
    } = req.query;

    // Find houses owned by the current user
    const userHouses = await House.find({
      hostId: req.user._id,
      deleted: false,
    });

    // Extract house IDs to use in problem filtering
    const userHouseIds = userHouses.map((house) => house._id);

    // Construct dynamic date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Construct dynamic query filter with house ownership constraint
    const queryFilter = {
      deleted: false,
      houseId: { $in: userHouseIds }, // Restrict to user's houses
      ...dateFilter,
      ...(type && { type }),
      ...(status !== null && { status }),
      ...(houseId && {
        houseId: new mongoose.Types.ObjectId(houseId),
      }),
    };

    // Advanced aggregation for comprehensive problem statistics
    const problemStats = await Problem.aggregate([
      { $match: queryFilter },
      {
        $facet: {
          // Problem breakdown by house
          problemByHouse: [
            {
              $group: {
                _id: "$houseId",
                totalProblems: { $sum: 1 },
                resolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
                },
                unresolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] },
                },
                problemsByType: {
                  $push: {
                    type: "$type",
                    status: "$status",
                  },
                },
              },
            },
          ],
          // Overall statistics
          overallStats: [
            {
              $group: {
                _id: null,
                totalProblems: { $sum: 1 },
                resolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
                },
                unresolvedProblems: {
                  $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          problemByHouse: 1,
          totalProblems: { $arrayElemAt: ["$overallStats.totalProblems", 0] },
          resolvedProblems: {
            $arrayElemAt: ["$overallStats.resolvedProblems", 0],
          },
          unresolvedProblems: {
            $arrayElemAt: ["$overallStats.unresolvedProblems", 0],
          },
        },
      },
    ]);

    // Handle scenario with no problems
    const stats =
      problemStats.length > 0
        ? problemStats[0]
        : {
            problemByHouse: [],
            totalProblems: 0,
            resolvedProblems: 0,
            unresolvedProblems: 0,
          };

    res.json(stats);
  } catch (error) {
    console.error("Error in statisticHouseProblem:", error);
    next(error);
  }
};

export const statisticHouseRevenue = async (req, res, next) => {
  try {
    // Validate user authentication and authorization
    if (!req.user || req.user.accountType !== "Manager") {
      return res.status(403).json({
        message: "Access denied. Requires Manager account type",
      });
    }

    // Find houses owned by the current user
    const userHouses = await House.find({
      hostId: req.user._id,
      deleted: false,
    });

    // Extract house IDs to use in bill filtering
    const userHouseIds = userHouses.map((house) => house._id);

    // Allow optional year specification via query parameter
    const { year: requestedYear } = req.query;
    const currentYear = requestedYear
      ? parseInt(requestedYear, 10)
      : new Date().getFullYear();

    // Advanced revenue aggregation pipeline
    const revenueStats = await Bills.aggregate([
      {
        $match: {
          isPaid: true,
          houseId: { $in: userHouseIds }, // Restrict to user's houses
          createdAt: {
            $gte: new Date(Date.UTC(currentYear, 0, 1)),
            $lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            houseId: "$houseId",
          },
          totalRevenue: { $sum: "$total" },
          billCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          totalMonthlyRevenue: { $sum: "$totalRevenue" },
          totalMonthlyBills: { $sum: "$billCount" },
          houseDetails: {
            $push: {
              houseId: "$_id.houseId",
              revenue: "$totalRevenue",
              billCount: "$billCount",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Initialize revenue and bill count arrays
    const revenueByMonth = Array(12).fill(0);
    const billCountByMonth = Array(12).fill(0);
    const houseRevenueByMonth = Array(12).fill([]);

    // Populate revenue and bill count arrays
    revenueStats.forEach(
      ({
        _id: month,
        totalMonthlyRevenue,
        totalMonthlyBills,
        houseDetails,
      }) => {
        // Adjust for zero-based array indexing
        revenueByMonth[month - 1] = totalMonthlyRevenue;
        billCountByMonth[month - 1] = totalMonthlyBills;
        houseRevenueByMonth[month - 1] = houseDetails;
      }
    );

    // Calculate comprehensive revenue statistics
    const annualStats = {
      year: currentYear,
      revenueByMonth,
      billCountByMonth,
      houseRevenueByMonth,
      totalAnnualRevenue: revenueByMonth.reduce(
        (sum, revenue) => sum + revenue,
        0
      ),
      averageMonthlyRevenue: Math.floor(
        revenueByMonth.reduce((sum, revenue) => sum + revenue, 0) / 12
      ),
      highestRevenueMonth: Math.max(...revenueByMonth),
      lowestRevenueMonth: Math.min(...revenueByMonth),
    };

    res.json(annualStats);
  } catch (error) {
    console.error("Comprehensive House Revenue Statistics Error:", error);
    next(error);
  }
};
