import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateInterviewQuestions } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/questions", protect, generateInterviewQuestions);

export default router;
