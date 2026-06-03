import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
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

app.use(cors());
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

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.post("/api/chat", protect, chat);
app.use("/api/analyze-resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/ats-score", atsRoutes);
app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
