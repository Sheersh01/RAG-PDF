import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { swaggerSpec } from "./swagger.js";

dotenv.config();

const app = express();

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
      } catch {
        // ignore
      }
    }
    return arg;
  });
  originalLog.apply(console, sanitizedArgs);
};

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

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

/**
 * @openapi
 * /:
 *   get:
 *     summary: API health banner
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "InterviewPilot API Running",
  });
});

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check with database status
 *     responses:
 *       200:
 *         description: Service health
 */
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    success: true,
    status: "healthy",
    database: dbStatus,
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api/analyze-resume", apiLimiter, resumeRoutes);
app.use("/api/interview", apiLimiter, interviewRoutes);
app.use("/api/ats-score", apiLimiter, atsRoutes);
app.use("/api/search", apiLimiter, searchRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;
