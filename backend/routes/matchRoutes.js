import express from "express";
import { getMatches, getMatchById } from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getMatches);
router.get("/:id", protect, getMatchById);

export default router;
