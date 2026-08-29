import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateInterviewQuestions } from "../controllers/interviewController.js";
import { validate } from "../middleware/validate.js";
import { interviewSchema } from "../schemas/requestSchemas.js";

const router = express.Router();

router.post("/questions", protect, validate(interviewSchema), generateInterviewQuestions);

export default router;
