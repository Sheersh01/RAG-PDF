import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume, getResume } from "../controllers/documentController.js";

const router = express.Router();

router.post("/resume", protect, upload.single("file"), uploadResume);
router.get("/resume", protect, getResume);

export default router;
