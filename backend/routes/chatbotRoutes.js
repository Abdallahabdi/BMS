import express from "express";
import { handleChatbotQuery } from "../controllers/chatbotController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, handleChatbotQuery);

export default router;
