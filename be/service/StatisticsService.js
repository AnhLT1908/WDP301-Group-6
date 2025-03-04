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

    const currentUserId = getCurrentUser(req);
    const query = { deleted: false };

    if (req.user.accountType === "Admin") {
      query.hostId = currentUserId;
    }

    const houses = await House.find(query);
    const houseNumber = houses.length;

    // Lấy số phòng & số phòng trống trong 1 query
    const roomsData = await Room.aggregate([
      { $match: { houseId: { $in: houses.map(h => h._id) }, deleted: false } },
      { $group: { _id: "$houseId", totalRooms: { $sum: 1 }, emptyRooms: { $sum: { $cond: [{ $eq: [{ $size: "$members" }, 0] }, 1, 0] } } } },
    ]);

    const roomNumber = roomsData.reduce((sum, data) => sum + data.totalRooms, 0);
    const roomNumberEmpty = roomsData.reduce((sum, data) => sum + data.emptyRooms, 0);

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
    const currentUserId = getCurrentUser(req);
    const { month } = req.query;
    const query = { deleted: false, ...(req.user.accountType === "Admin" && { hostId: currentUserId }) };
    
    const houses = await House.find(query);
    const houseIds = houses.map(h => h._id);

    let dateFilter = {};
    if (month) {
      const [mm, yyyy] = month.split("-");
      const startOfMonth = new Date(yyyy, mm - 1, 1);
      const endOfMonth = new Date(yyyy, mm, 0);
      dateFilter = { createdAt: { $gte: startOfMonth, $lt: endOfMonth } };
    }

    const bills = await Bills.find({ houseId: { $in: houseIds }, ...dateFilter });

    const billStats = bills.reduce(
      (acc, bill) => {
        if (bill.isPaid) {
          acc.billIsPaid++;
          acc.totalBillIsPaid += bill.total;
        } else {
          acc.billIsNotPaid++;
          acc.totalBillIsNotPaid += bill.total;
        }
        return acc;
      },
      { billIsPaid: 0, totalBillIsPaid: 0, billIsNotPaid: 0, totalBillIsNotPaid: 0 }
    );

    res.json(billStats);
  } catch (error) {
    next(error);
  }
};

export const statisticProblem = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUser(req);
    const { month } = req.query;
    const query = { deleted: false, ...(req.user.accountType === "Admin" && { hostId: currentUserId }) };

    const houses = await House.find(query);
    const houseIds = houses.map(h => h._id);

    let dateFilter = {};
    if (month) {
      const [mm, yyyy] = month.split("-");
      const startOfMonth = new Date(yyyy, mm - 1, 1);
      const endOfMonth = new Date(yyyy, mm, 0);
      dateFilter = { createdAt: { $gte: startOfMonth, $lt: endOfMonth } };
    }

    const problems = await Problem.find({ houseId: { $in: houseIds }, deleted: false, ...dateFilter });

    const problemStats = problems.reduce(
      (acc, problem) => {
        acc[`numberProblem${problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}`]++;
        return acc;
      },
      { numberProblemNone: 0, numberProblemDoing: 0, numberProblemDone: 0 }
    );

    res.json(problemStats);
  } catch (error) {
    next(error);
  }
};

export const statisticRevenue = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUser(req);
    const query = { deleted: false, ...(req.user.accountType === "Admin" && { hostId: currentUserId }) };

    const houses = await House.find(query);
    const houseIds = houses.map(h => h._id);

    const currentYear = new Date().getFullYear();
    const revenueByMonth = Array(12).fill(0);

    const bills = await Bills.find({
      houseId: { $in: houseIds },
      isPaid: true,
      createdAt: { $gte: new Date(currentYear, 0, 1), $lte: new Date() },
    });

    bills.forEach(bill => {
      const month = bill.createdAt.getMonth();
      revenueByMonth[month] += bill.total;
    });

    res.json({ year: currentYear, revenueByMonth });
  } catch (error) {
    next(error);
  }
};
