import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "./embeddingService.js";

const STOPWORDS = new Set([
  "the", "and", "a", "of", "to", "in", "is", "that", "it", "on", "for", "as",
  "with", "was", "at", "by", "an", "be", "this", "are", "from", "or", "have",
  "your", "my", "our", "their", "his", "her", "its", "you", "me", "him", "them",
]);

const paginationRegex =
  /^(?:page\s*\d+|\(?\s*\d+\s*of\s*\d+\s*\)?|[-—_]*\s*\d+\s*of\s*\d+\s*[-—_]*)$/i;

const escapeRegex = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

const toObjectId = (userId) => new mongoose.Types.ObjectId(userId);

const resumeChunkFilter = (userId) => ({
  userId: toObjectId(userId),
  $or: [{ chunkType: "resume" }, { chunkType: { $exists: false } }],
});

const formatChunk = (chunk, score = 0.5) => ({
  _id: chunk._id,
  content: chunk.content,
  documentId: chunk.documentId,
  section: chunk.section,
  title: chunk.title,
  documentName: chunk.documentName,
  chunkType: chunk.chunkType,
  score,
  boostedScore: score,
});

const extractQueryTerms = (question) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((term) => term.length >= 3 && !STOPWORDS.has(term));

const keywordFallback = async (userId, question) => {
  const queryTerms = extractQueryTerms(question);
  const allChunks = await DocumentChunk.find(resumeChunkFilter(userId)).limit(50);

  if (allChunks.length === 0) {
    return [];
  }

  const scored = allChunks.map((chunk) => {
    let matchCount = 0;
    const contentLower = (chunk.content || "").toLowerCase();
    queryTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        matchCount++;
      }
    });
    return formatChunk(chunk, matchCount > 0 ? 0.5 + matchCount * 0.05 : 0.1);
  });

  scored.sort((a, b) => b.score - a.score);

  const hasMatches = scored.some((item) => item.score > 0.1);
  if (!hasMatches) {
    return allChunks.map((chunk) => formatChunk(chunk, 0.3));
  }

  return scored;
};

export const getAllResumeChunks = async (userId) => {
  const chunks = await DocumentChunk.find(resumeChunkFilter(userId))
    .sort({ section: 1, createdAt: 1 })
    .limit(30);

  return chunks.map((chunk) => formatChunk(chunk, 1.0));
};

const rerankResults = (results, question) => {
  const queryTerms = extractQueryTerms(question);

  return results
    .filter((item) => {
      const content = (item.content || "").trim();
      if (content.length < 20 && !/[a-zA-Z]/.test(content)) return false;
      if (paginationRegex.test(content)) return false;
      return true;
    })
    .map((item) => {
      const contentLower = (item.content || "").toLowerCase();
      let keywordScoreBoost = 0;

      queryTerms.forEach((term) => {
        if (contentLower.includes(term)) {
          const termRegex = new RegExp(`\\b${term}\\b`, "i");
          keywordScoreBoost += termRegex.test(contentLower) ? 0.25 : 0.1;
        }
      });

      return {
        ...item,
        boostedScore: (item.score ?? 0) + keywordScoreBoost,
      };
    })
    .sort((a, b) => b.boostedScore - a.boostedScore);
};

export const retrieveRelevantChunks = async (question, userId) => {
  const trimmedQuery = question.trim();
  const escapedQuery = escapeRegex(trimmedQuery);

  if (escapedQuery.length >= 3) {
    const exactMatches = await DocumentChunk.find({
      ...resumeChunkFilter(userId),
      content: { $regex: escapedQuery, $options: "i" },
    }).limit(10);

    if (exactMatches.length > 0) {
      return exactMatches.map((m) => formatChunk(m, 1.0));
    }
  }

  let results = [];

  try {
    const queryVector = await embeddings.embedQuery(question);
    results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 15,
          filter: {
            userId: toObjectId(userId),
            chunkType: "resume",
          },
        },
      },
      {
        $project: {
          content: 1,
          documentId: 1,
          section: 1,
          title: 1,
          documentName: 1,
          chunkType: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
  } catch (error) {
    console.warn("Vector search failed, falling back to keyword matching:", error.message);
    results = await keywordFallback(userId, question);
  }

  if (results.length === 0) {
    console.warn("Vector search returned no results, using keyword fallback.");
    results = await keywordFallback(userId, question);
  }

  return rerankResults(results, question).slice(0, 5);
};

export default retrieveRelevantChunks;
