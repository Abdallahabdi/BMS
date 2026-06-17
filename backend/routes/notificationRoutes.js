import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/",                  protect, getUserNotifications);  // list (paginated)
router.patch("/read-all",        protect, markAllAsRead);          // mark all read
router.patch("/:id/read",        protect, markAsRead);             // mark one read
router.delete("/:id",            protect, deleteNotification);     // delete one

export default router;
