import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: {
      type: [
        {
          chunkId: String,
          section: String,
          title: String,
          score: Number,
          snippet: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);
