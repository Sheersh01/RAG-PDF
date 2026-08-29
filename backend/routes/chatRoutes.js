import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { chatSchema } from "../schemas/requestSchemas.js";
import {
  chat,
  chatStream,
  getChatHistory,
  clearChatHistory,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, validate(chatSchema), chat);
router.post("/stream", protect, validate(chatSchema), chatStream);
router.get("/history", protect, getChatHistory);
router.delete("/history", protect, clearChatHistory);

export default router;
