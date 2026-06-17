import User from "../models/User.js";
import Item from "../models/Item.js";
import { logAction } from "./auditController.js";

// ─── GET /api/admin/users ───────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]); 

    res.json({
      success: true,
      data: users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};

// ─── DELETE /api/admin/users/:id ───────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete an admin account" });
    }

    await user.deleteOne();
    await logAction(req.user._id, "DELETE", "User", req.params.id, `Deleted user: ${user.email}`);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
  }
};

// ─── GET /api/admin/lost-items ─────────────────────────────────────────────
export const getAllLostItems = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = { itemType: "lost" };
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      Item.find(filter).populate("reportedBy", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, currentPage: page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching lost items", error: error.message });
  }
};

// ─── GET /api/admin/found-items ────────────────────────────────────────────
export const getAllFoundItems = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = { itemType: "found" };
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      Item.find(filter).populate("reportedBy", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, currentPage: page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching found items", error: error.message });
  }
};

// ─── PATCH /api/admin/users/:id/role ──────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await logAction(req.user._id, "UPDATE", "User", user._id, `Role updated to '${role}' for: ${user.email}`);

    res.json({ success: true, message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating role", error: error.message });
  }
};
