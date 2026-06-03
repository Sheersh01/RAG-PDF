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
    embedding: {
      type: [Number],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 3072;
        },
        message: "Embedding array must have exactly 3072 dimensions",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index fields used for filtering in Atlas Vector Search & non-vector queries
documentChunkSchema.index({ userId: 1, documentId: 1 });

export default mongoose.model("DocumentChunk", documentChunkSchema);
