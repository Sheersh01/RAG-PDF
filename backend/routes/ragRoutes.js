import { Router } from "express";
import {
  answerQuestion,
  searchDocuments,
} from "../controllers/ragController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/search", authMiddleware, searchDocuments);
router.post("/answer", authMiddleware, answerQuestion);

export default router;
