import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { uploadDocument } from "../controllers/uploadController.js";

const router = Router();

router.post("/resume", authMiddleware, upload.single("file"), uploadDocument);
router.post("/jd", authMiddleware, upload.single("file"), uploadDocument);
router.post("/notes", authMiddleware, upload.single("file"), uploadDocument);

export default router;
