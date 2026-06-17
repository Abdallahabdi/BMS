import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    // Admin kaliya
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await AuditLog.find()
      .populate("user", "name role") // Waxaan u badalnay 'name' madaama 'username' la tirtiray
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Function si loo diiwaangeliyo ficillada
export const logAction = async (user, action, itemType, itemId, description) => {
  try {
    await AuditLog.create({
      user,
      action,
      itemType,
      itemId,
      description,
    });
  } catch (err) {
    console.error("Audit Logging Error:", err);
  }
};
