import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messagesController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:productId", authMiddleware, getMessages);
router.post("/", authMiddleware, sendMessage);

export default router;