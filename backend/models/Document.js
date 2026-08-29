import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["resume", "jd", "notes"],
    },
    fileName: String,
    extractedText: String,
    sectionsCount: {
      type: Number,
      default: 0,
    },
    vectorsCount: {
      type: Number,
      default: 0,
    },
    quality: {
      type: Number,
      default: 0,
    },
    sectionTypes: {
      type: [String],
      default: [],
    },
    lastAnalysisAt: Date,
    cachedStrength: String,
    cachedImprovement: String,
    cachedAtsKeyword: String,
    lastAtsScore: Number,
    lastAtsAt: Date,
    lastChatAt: Date,
    mockInterviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Document || mongoose.model("Document", documentSchema);
