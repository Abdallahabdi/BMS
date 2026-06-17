import express from "express";
import { getMyClaims, getClaimById, sendMessage, createClaim, deleteMessage, updateClaimStatus } from "../controllers/claimController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getMyClaims);
router.get("/:id", protect, getClaimById);
router.post("/", protect, createClaim);
router.post("/:id/messages", protect, sendMessage);
router.delete("/:id/messages/:messageId", protect, deleteMessage);
router.patch("/:id/status", protect, updateClaimStatus);

export default router;
