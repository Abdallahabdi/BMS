import crypto from "crypto";
import Item from "../models/Item.js";
import Claim from "../models/Claim.js";
import { logAction } from "./auditController.js";
import { createNotification } from "./notificationController.js";
import { sendEmail } from "../utils/emailer.js";

// ─── Helper: generate a human-readable pickup token ────────────────────────
const makePickupToken = () => {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `BFN-${rand}-${num}`;
};

// ─── POST /api/returns/mark-returned ───────────────────────────────────────
// Admin marks a verified/claimed item as returned and generates a pickup token
export const markAsReturned = async (req, res) => {
  try {
    const { itemId, claimId } = req.body;

    const item = await Item.findById(itemId).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (item.status === "returned") {
      return res.status(400).json({ success: false, message: "Item is already marked as returned" });
    }

    item.status = "returned";
    await item.save();

    let pickupToken = null;

    // If a claim is linked, generate / attach token and notify claimer
    if (claimId) {
      const claim = await Claim.findById(claimId).populate("claimer", "name email");
      if (claim) {
        if (!claim.pickupToken) {
          claim.pickupToken = makePickupToken();
        }
        pickupToken = claim.pickupToken;
        await claim.save();

        // Notify claimer via in-app notification
        await createNotification(
          claim.claimer._id,
          `Your item "${item.itemName}" is ready for pickup. Your token: ${pickupToken}`
        );

        // Send email with pickup token
        try {
          await sendEmail(
            claim.claimer.email,
            "Baafin – Item Ready for Pickup 🎉",
            `Dear ${claim.claimer.name},\n\nYour claimed item "${item.itemName}" is ready for pickup.\n\nYour Pickup Token: ${pickupToken}\n\nPlease present this token when collecting your item.\n\nBaafin Lost & Found`
          );
        } catch (emailErr) {
          console.warn("Email send failed:", emailErr.message);
        }
      }
    }

    await logAction(
      req.user._id, "UPDATE", "Item", item._id,
      `Item marked as returned: ${item.itemName}${pickupToken ? ` | Token: ${pickupToken}` : ""}`
    );

    res.json({
      success: true,
      message: "Item marked as returned",
      item,
      pickupToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error marking item as returned", error: error.message });
  }
};

// ─── GET /api/returns/history ───────────────────────────────────────────────
// Get all returned items (admin) or the current user's returned items
export const getReturnHistory = async (req, res) => {
  try {
    const filter = { status: "returned" };
    if (req.user.role !== "admin") {
      filter.reportedBy = req.user._id;
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("reportedBy", "name email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Item.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching return history", error: error.message });
  }
};

// ─── PUT /api/returns/:claimId/confirm ────────────────────────────────────
// Validate pickup token — called when claimer presents the token at pickup
export const validatePickupToken = async (req, res) => {
  try {
    const { token } = req.body;
    const claim = await Claim.findById(req.params.claimId)
      .populate("item")
      .populate("claimer", "name email");

    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

    if (!claim.pickupToken || claim.pickupToken !== token) {
      return res.status(400).json({ success: false, message: "Invalid pickup token" });
    }

    // Mark item as returned if not already
    if (claim.item && claim.item.status !== "returned") {
      await Item.findByIdAndUpdate(claim.item._id, { status: "returned" });
    }

    await logAction(
      req.user._id, "UPDATE", "Claim", claim._id,
      `Pickup confirmed for: ${claim.item?.itemName} | Token: ${token}`
    );

    res.json({
      success: true,
      message: "Pickup token validated successfully. Item handover complete.",
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error validating pickup token", error: error.message });
  }
};

// ─── POST /api/returns/generate-token/:claimId ────────────────────────────
// Generate (or regenerate) a pickup token for an approved claim
export const generatePickupToken = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item")
      .populate("claimer", "name email");

    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });
    if (claim.status !== "approved") {
      return res.status(400).json({ success: false, message: "Claim must be approved before generating a token" });
    }

    claim.pickupToken = makePickupToken();
    await claim.save();

    // Notify claimer
    await createNotification(
      claim.claimer._id,
      `Your pickup token for "${claim.item?.itemName}" is: ${claim.pickupToken}`
    );

    await logAction(
      req.user._id, "UPDATE", "Claim", claim._id,
      `Pickup token generated: ${claim.pickupToken}`
    );

    res.json({
      success: true,
      pickupToken: claim.pickupToken,
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating pickup token", error: error.message });
  }
};
