import { Router } from "express";
import { testGemini } from "../controllers/geminiController.js";

const router = Router();

router.post("/test", testGemini);

export default router;
