import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getDashboardStats,
  getItemStats,
  getClaimStats,
  getUserStats,
  getMonthlyTrends
} from "../controllers/statsController.js";

const router = express.Router();

// All stats routes require admin authentication
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/items",     protect, adminOnly, getItemStats);
router.get("/claims",    protect, adminOnly, getClaimStats);
router.get("/users",     protect, adminOnly, getUserStats);
router.get("/trends",    protect, adminOnly, getMonthlyTrends);

export default router;
