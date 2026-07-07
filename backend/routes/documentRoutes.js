import express from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume, getResume, getResumeText, deleteResume } from "../controllers/documentController.js";

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Heavy operations limit exceeded. Please wait 15 minutes." },
});

const router = express.Router();

router.post("/resume", uploadLimiter, protect, upload.single("file"), uploadResume);
router.get("/resume", protect, getResume);
router.get("/resume/text", protect, getResumeText);
router.delete("/resume", protect, deleteResume);

export default router;
