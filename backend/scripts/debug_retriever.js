import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "../rag/embeddingService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";

const userId = process.argv[2] || "6a201b7db1b4ef03a30e700b";
const question =
  process.argv[3] ||
  "Analyze this resume and identify strengths, weaknesses, and improvements.";

await mongoose.connect(process.env.MONGO_URI);

const oid = new mongoose.Types.ObjectId(userId);
const chunkCount = await DocumentChunk.countDocuments({ userId: oid });
console.log("Chunks for user:", chunkCount);

const sample = await DocumentChunk.findOne({ userId: oid });
console.log("Sample userId type:", sample?.userId?.constructor?.name, sample?.userId?.toString());

try {
  const queryVector = await embeddings.embedQuery(question);
  console.log("Query vector length:", queryVector.length);

  const withFilter = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector,
        numCandidates: 100,
        limit: 15,
        filter: { userId: oid },
      },
    },
    { $project: { content: 1, section: 1, score: { $meta: "vectorSearchScore" } } },
  ]);
  console.log("Vector search WITH userId filter:", withFilter.length);

  const withoutFilter = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector,
        numCandidates: 100,
        limit: 15,
      },
    },
    { $project: { content: 1, section: 1, userId: 1, score: { $meta: "vectorSearchScore" } } },
  ]);
  console.log("Vector search WITHOUT filter:", withoutFilter.length);
  withoutFilter.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. user=${r.userId} [${r.section}] score=${r.score}`);
  });
} catch (error) {
  console.error("Vector search failed:", error.message);
}

const allChunks = await DocumentChunk.find({ userId: oid }).limit(50);
console.log("Keyword fallback pool:", allChunks.length);

const retrieverResults = await retrieveRelevantChunks(question, userId);
console.log("Retriever final results:", retrieverResults.length);

await mongoose.disconnect();
