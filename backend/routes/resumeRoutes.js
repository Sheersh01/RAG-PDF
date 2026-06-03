import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { analyzeResume } from "../controllers/resumeAnalysisController.js";

const router = express.Router();

router.post("/", protect, analyzeResume);

export default router;
