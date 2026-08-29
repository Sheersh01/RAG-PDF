import express from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadResume,
  getResume,
  getResumeStats,
  getResumeText,
  deleteResume,
} from "../controllers/documentController.js";
import {
  uploadJd,
  getJd,
  getJdText,
  deleteJd,
} from "../controllers/jdController.js";

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Heavy operations limit exceeded. Please wait 15 minutes." },
});

const optionalJdUpload = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    return upload.single("file")(req, res, next);
  }
  return next();
};

const router = express.Router();

router.post("/resume", uploadLimiter, protect, upload.single("file"), uploadResume);
router.get("/resume", protect, getResume);
router.get("/resume/stats", protect, getResumeStats);
router.get("/resume/text", protect, getResumeText);
router.delete("/resume", protect, deleteResume);

router.post("/jd", uploadLimiter, protect, optionalJdUpload, uploadJd);
router.get("/jd", protect, getJd);
router.get("/jd/text", protect, getJdText);
router.delete("/jd", protect, deleteJd);

export default router;
