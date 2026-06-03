import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume, getResume, getResumeText, deleteResume } from "../controllers/documentController.js";

const router = express.Router();

router.post("/resume", protect, upload.single("file"), uploadResume);
router.get("/resume", protect, getResume);
router.get("/resume/text", protect, getResumeText);
router.delete("/resume", protect, deleteResume);

export default router;
