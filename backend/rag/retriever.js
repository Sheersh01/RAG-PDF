import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "./embeddingService.js";

// Basic English stopwords to avoid boosting generic words
const STOPWORDS = new Set([
  "the", "and", "a", "of", "to", "in", "is", "that", "it", "on", "for", "as", 
  "with", "was", "at", "by", "an", "be", "this", "are", "from", "or", "have",
  "your", "my", "our", "their", "his", "her", "its", "you", "me", "him", "them"
]);

export const retrieveRelevantChunks = async (question, userId) => {
  const queryVector = await embeddings.embedQuery(question);

  // Retrieve more candidates for reranking (e.g., 15)
  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 15,
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

  // Extract search terms from the query (words >= 3 chars, not stopwords)
  const queryTerms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(term => term.length >= 3 && !STOPWORDS.has(term));

  const paginationRegex = /^(?:page\s*\d+|\(?\s*\d+\s*of\s*\d+\s*\)?|[-—_]*\s*\d+\s*of\s*\d+\s*[-—_]*)$/i;

  const processedResults = results
    .filter(item => {
      const content = item.content.trim();
      // Filter out garbage/pagination chunks
      if (content.length < 20 && !/[a-zA-Z]/.test(content)) return false;
      if (paginationRegex.test(content)) return false;
      return true;
    })
    .map(item => {
      const contentLower = item.content.toLowerCase();
      let keywordScoreBoost = 0;

      // Calculate keyword matches
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          // If the term is found, check if it's a whole word boundary match or exact match
          const termRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (termRegex.test(contentLower)) {
            keywordScoreBoost += 0.25; // Significant boost for whole word match
          } else {
            keywordScoreBoost += 0.1; // Moderate boost for substring match
          }
        }
      });

      return {
        ...item,
        boostedScore: item.score + keywordScoreBoost
      };
    });

  // Sort by boosted score descending
  processedResults.sort((a, b) => b.boostedScore - a.boostedScore);

  // Return the top 5 results
  return processedResults.slice(0, 5);
};

export default retrieveRelevantChunks;
