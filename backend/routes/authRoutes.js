import express from "express";
import { register, login, updateProfile, forgotPassword, verifyOTP, resetPassword } from "../controllers/authController.js";
import { getAuditLogs } from "../controllers/auditController.js";
import { protect, admin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Tan waxaan ka dhigay .post si uu u aqbalo xogta laga soo diro Frontend-ka
router.post("/register", register); 
router.post("/login", login);
router.get("/me", protect, (req, res) => {
  res.json({ 
    id: req.user._id, 
    name: req.user.name, 
    email: req.user.email, 
    role: req.user.role, 
    phone: req.user.phone, 
    gender: req.user.gender, 
    avatar: req.user.avatar 
  });
});
router.put("/profile", protect, upload.single("avatar"), updateProfile);

router.post("/forgot", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/audit-logs", protect, admin, getAuditLogs);

export default router;