import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "./embeddingService.js";

export const retrieveRelevantChunks = async (question, userId) => {
  const queryVector = await embeddings.embedQuery(question);

  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 5,
        filter: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
    },
    {
      $project: {
        content: 1,
        documentId: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
};

export default retrieveRelevantChunks;
