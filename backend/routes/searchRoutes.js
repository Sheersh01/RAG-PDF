import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchChunks } from "../controllers/searchController.js";
import { validate } from "../middleware/validate.js";
import { searchSchema } from "../schemas/requestSchemas.js";

const router = express.Router();

router.post("/", protect, validate(searchSchema), searchChunks);

export default router;
