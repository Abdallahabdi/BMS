import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getParkZones,
  createParkZone,
  deleteParkZone,
  toggleItemImageVisibility
} from "../controllers/parkZoneController.js";

const router = express.Router();

// Public - get all zones
router.get("/", getParkZones);

// Admin - manage zones
router.post("/", protect, adminOnly, createParkZone);
router.delete("/:id", protect, adminOnly, deleteParkZone);

// Admin - toggle item image visibility
router.patch("/items/:id/toggle-image", protect, adminOnly, toggleItemImageVisibility);

export default router;
