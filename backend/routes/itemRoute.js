import express from "express"
import {
    createItem,
    getItems,
    verifyItem,
    getMyItems,
    updateItem,
    deleteItem,
    getItemById,
    completeHandover
} from "../controllers/itemController.js";
import { protect, admin } from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const router = express.Router()

router.post("/", protect, upload.single("image"), createItem)
router.get("/", getItems)
router.get("/my-items", protect, getMyItems)
router.get("/:id", getItemById)
router.put("/verify/:id", protect, admin, verifyItem)
router.patch("/:id/handover", protect, admin, completeHandover)
router.patch("/:id", protect, admin, upload.single("image"), updateItem)
router.delete("/:id", protect, admin, deleteItem)

export default router