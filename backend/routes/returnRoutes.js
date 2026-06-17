import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  markAsReturned,
  getReturnHistory,
  validatePickupToken,
  generatePickupToken
} from "../controllers/returnController.js";

const router = express.Router();

// Mark an item as returned (admin only)
router.post("/mark-returned", protect, adminOnly, markAsReturned);

// Get return history (admin sees all, user sees own)
router.get("/history", protect, getReturnHistory);

// Validate a pickup token (confirm handover)
router.put("/:claimId/confirm", protect, validatePickupToken);

// Generate / regenerate a pickup token for an approved claim (admin only)
router.post("/generate-token/:claimId", protect, adminOnly, generatePickupToken);

export default router;
