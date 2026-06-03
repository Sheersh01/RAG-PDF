import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { scoreAtsMatch } from "../controllers/atsController.js";

const router = express.Router();

router.post("/", protect, scoreAtsMatch);

export default router;
