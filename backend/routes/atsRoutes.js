import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { scoreAtsMatch } from "../controllers/atsController.js";
import { validate } from "../middleware/validate.js";
import { atsSchema } from "../schemas/requestSchemas.js";

const router = express.Router();

router.post("/", protect, validate(atsSchema), scoreAtsMatch);

export default router;
