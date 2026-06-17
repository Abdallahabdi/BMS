import Item from "../models/Item.js";
import User from "../models/User.js";
import Claim from "../models/Claim.js";

// ─── Helper ────────────────────────────────────────────────────────────────
/**
 * Build an array of {month, count} pairs for the last N months.
 * Works with any mongoose model that has a `createdAt` field.
 */
const monthlyTrend = async (Model, matchFilter = {}, months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months + 1);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const raw = await Model.aggregate([
    { $match: { ...matchFilter, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year:  { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Fill empty months with 0 so charts always have N data-points
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const found = raw.find(r => r._id.year === y && r._id.month === m);
    result.push({ month: label, count: found ? found.count : 0 });
  }
  return result;
};

// ─── GET /api/stats/dashboard ───────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalItems,
      lostItems,
      foundItems,
      pendingItems,
      verifiedItems,
      claimedItems,
      returnedItems,
      totalUsers,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ itemType: "lost" }),
      Item.countDocuments({ itemType: "found" }),
      Item.countDocuments({ status: "pending" }),
      Item.countDocuments({ status: "verified" }),
      Item.countDocuments({ status: "claimed" }),
      Item.countDocuments({ status: "returned" }),
      User.countDocuments(),
      Claim.countDocuments(),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "approved" }),
      Claim.countDocuments({ status: "rejected" })
    ]);

    const recoveryRate = totalItems > 0
      ? Math.round((returnedItems / totalItems) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        items: { total: totalItems, lost: lostItems, found: foundItems },
        status: { pending: pendingItems, verified: verifiedItems, claimed: claimedItems, returned: returnedItems },
        users: { total: totalUsers },
        claims: { total: totalClaims, pending: pendingClaims, approved: approvedClaims, rejected: rejectedClaims },
        recoveryRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard stats", error: error.message });
  }
};

// ─── GET /api/stats/items ───────────────────────────────────────────────────
export const getItemStats = async (req, res) => {
  try {
    const [byCategory, byZone, byStatus, byType] = await Promise.all([
      Item.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Item.aggregate([
        { $group: { _id: "$parkZone", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Item.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Item.aggregate([
        { $group: { _id: "$itemType", count: { $sum: 1 } } }
      ])
    ]);

    const trend = await monthlyTrend(Item, {}, 6);

    // Normalize null/empty buckets
    const normalize = arr => arr.map(a => ({ _id: a._id || "Unknown", count: a.count }));

    res.json({
      success: true,
      data: { byCategory: normalize(byCategory), byZone: normalize(byZone), byStatus: normalize(byStatus), byType: normalize(byType), trend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching item stats", error: error.message });
  }
};

// ─── GET /api/stats/claims ──────────────────────────────────────────────────
export const getClaimStats = async (req, res) => {
  try {
    const byStatus = await Claim.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const trend = await monthlyTrend(Claim, {}, 6);

    res.json({
      success: true,
      data: { byStatus: byStatus.map(a => ({ _id: a._id || "Unknown", count: a.count })), trend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching claim stats", error: error.message });
  }
};

// ─── GET /api/stats/users ───────────────────────────────────────────────────
export const getUserStats = async (req, res) => {
  try {
    const [byRole, recentUsers] = await Promise.all([
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt")
    ]);

    const trend = await monthlyTrend(User, {}, 6);

    res.json({
      success: true,
      data: { byRole: byRole.map(a => ({ _id: a._id || "Unknown", count: a.count })), recentUsers, trend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user stats", error: error.message });
  }
};

// ─── GET /api/stats/trends ──────────────────────────────────────────────────
export const getMonthlyTrends = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;

    const [itemsTrend, usersTrend, claimsTrend] = await Promise.all([
      monthlyTrend(Item, {}, months),
      monthlyTrend(User, {}, months),
      monthlyTrend(Claim, {}, months)
    ]);

    res.json({
      success: true,
      data: { items: itemsTrend, users: usersTrend, claims: claimsTrend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching trends", error: error.message });
  }
};
