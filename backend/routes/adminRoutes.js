import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAllUsers,
  deleteUser,
  getAllLostItems,
  getAllFoundItems,
  updateUserRole
} from "../controllers/adminController.js";

const router = express.Router();

// User management
router.get("/users",            protect, adminOnly, getAllUsers);
router.delete("/users/:id",     protect, adminOnly, deleteUser);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);

// Item management (admin views)
router.get("/lost-items",  protect, adminOnly, getAllLostItems);
router.get("/found-items", protect, adminOnly, getAllFoundItems);

export default router;
