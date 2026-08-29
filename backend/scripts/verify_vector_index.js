import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "../rag/embeddingService.js";

const SAMPLE_QUERY = "What technical skills and experience are listed?";

async function verify() {
  if (!process.env.MONGO_URI) {
    console.error("FAIL: MONGO_URI is not set in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  const totalChunks = await DocumentChunk.countDocuments();
  const resumeChunks = await DocumentChunk.countDocuments({
    $or: [{ chunkType: "resume" }, { chunkType: { $exists: false } }],
  });
  const withEmbedding = await DocumentChunk.countDocuments({
    embedding: { $exists: true, $not: { $size: 0 } },
  });

  console.log("--- Chunk counts ---");
  console.log(`Total chunks:        ${totalChunks}`);
  console.log(`Resume chunks:       ${resumeChunks}`);
  console.log(`Chunks w/ embedding: ${withEmbedding}`);

  if (resumeChunks === 0) {
    console.error("\nFAIL: No resume chunks found. Upload a resume first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const sample = await DocumentChunk.findOne({
    $or: [{ chunkType: "resume" }, { chunkType: { $exists: false } }],
    embedding: { $exists: true },
  });

  if (!sample) {
    console.error("\nFAIL: No chunks with embeddings found.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const embedLen = sample.embedding?.length ?? 0;
  console.log(`\nSample embedding dimensions: ${embedLen}`);
  if (embedLen !== 3072) {
    console.warn("WARN: Expected 3072 dimensions. Index must match embedding model output.");
  }

  console.log("\n--- Vector index test ---");
  let vectorOk = false;
  let vectorError = null;

  try {
    const queryVector = await embeddings.embedQuery(SAMPLE_QUERY);
    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $project: {
          section: 1,
          chunkType: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    console.log(`Vector search (no filter): ${results.length} results`);
    if (results.length > 0) {
      results.forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.section}] type=${r.chunkType} score=${r.score?.toFixed(4)}`);
      });
      vectorOk = true;
    } else {
      vectorError = "Index exists but returned 0 results — index may not be synced yet.";
    }
  } catch (error) {
    vectorError = error.message;
    console.error(`Vector search error: ${error.message}`);
  }

  console.log("\n--- Result ---");
  if (vectorOk) {
    console.log("PASS: Atlas vector_index is working.");
    console.log("Tip: Re-upload resume after index changes to ensure all chunks are indexed.");
  } else {
    console.log("FAIL: Vector search is not returning results.");
    console.log("\nFix steps:");
    console.log("1. Open MongoDB Atlas → your cluster → Search tab");
    console.log("2. Create Atlas Vector Search index on collection: documentchunks");
    console.log("3. Index name MUST be: vector_index");
    console.log("4. Use JSON from docs/search_index.json or docs/ATLAS_VECTOR_INDEX.md");
    console.log("5. Wait until status is Active, then re-run: npm run verify:index");
    if (vectorError) {
      console.log(`\nDetail: ${vectorError}`);
    }
  }

  await mongoose.disconnect();
  process.exit(vectorOk ? 0 : 1);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
