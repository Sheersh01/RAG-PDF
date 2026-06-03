import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    content: String,
    embedding: [Number],
  },
  {
    timestamps: true,
  },
);

// Index fields used for filtering in Atlas Vector Search
documentChunkSchema.index({ userId: 1 });

export default mongoose.model("DocumentChunk", documentChunkSchema);
