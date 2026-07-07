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
      default: 12,
    },
    vectorsCount: {
      type: Number,
      default: 842,
    },
    quality: {
      type: Number,
      default: 98,
    },
    resumeScore: {
      type: Number,
      default: 87,
    },
    atsCompatibility: {
      type: Number,
      default: 92,
    },
    interviewSessionsCount: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Document", documentSchema);

