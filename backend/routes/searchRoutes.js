import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchChunks } from "../controllers/searchController.js";

const router = express.Router();

router.post("/", protect, searchChunks);

export default router;
