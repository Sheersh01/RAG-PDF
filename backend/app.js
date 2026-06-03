import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import { chat } from "./controllers/chatController.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
dotenv.config();

const app = express();

// Console log sanitizer to prevent accidental logging of API keys
const originalLog = console.log;
console.log = (...args) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    originalLog.apply(console, args);
    return;
  }
  const sanitizedArgs = args.map((arg) => {
    if (typeof arg === "string") {
      return arg.replaceAll(key, "[REDACTED_GEMINI_KEY]");
    }
    if (arg && typeof arg === "object") {
      try {
        const str = JSON.stringify(arg);
        if (str.includes(key)) {
          return JSON.parse(str.replaceAll(key, "[REDACTED_GEMINI_KEY]"));
        }
      } catch (e) {
        // ignore
      }
    }
    return arg;
  });
  originalLog.apply(console, sanitizedArgs);
};

import rateLimit from "express-rate-limit";

// Rate limit rules: global (100 reqs/15m) and strict (15 reqs/15m)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Heavy operations limit exceeded. Please wait 15 minutes." },
});


app.set("trust proxy", true);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(generalLimiter);
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "InterviewPilot API Running",
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    success: true,
    status: "healthy",
    database: dbStatus,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", apiLimiter, documentRoutes);
app.post("/api/chat", apiLimiter, protect, chat);
app.use("/api/analyze-resume", apiLimiter, resumeRoutes);
app.use("/api/interview", apiLimiter, interviewRoutes);
app.use("/api/ats-score", apiLimiter, atsRoutes);
app.use("/api/search", apiLimiter, searchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
