import Notification from "../models/Notification.js";
import { sendNotification } from "../sockets/socketServer.js";

/**
 * Internal helper — called from other controllers to create a notification.
 * Also pushes a real-time event via Socket.io if the socket server is up.
 */
export const createNotification = async (userId, message) => {
  try {
    const notif = await Notification.create({ user: userId, message });
    // Push real-time event to the user's socket room
    sendNotification(userId.toString(), { message, createdAt: notif.createdAt });
    return notif;
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

// ─── GET /api/notifications ─────────────────────────────────────────────────
export const getUserNotifications = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
  }
};

// ─── PATCH /api/notifications/:id/read ─────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notification", error: error.message });
  }
};

// ─── PATCH /api/notifications/read-all ─────────────────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error marking all as read", error: error.message });
  }
};

// ─── DELETE /api/notifications/:id ─────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting notification", error: error.message });
  }
};
