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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Document", documentSchema);
