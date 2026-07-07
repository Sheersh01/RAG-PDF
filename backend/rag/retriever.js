import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embeddings } from "./embeddingService.js";

// Basic English stopwords to avoid boosting generic words
const STOPWORDS = new Set([
  "the", "and", "a", "of", "to", "in", "is", "that", "it", "on", "for", "as", 
  "with", "was", "at", "by", "an", "be", "this", "are", "from", "or", "have",
  "your", "my", "our", "their", "his", "her", "its", "you", "me", "him", "them"
]);

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const retrieveRelevantChunks = async (question, userId) => {
  // Phase 1: Exact keyword check
  const trimmedQuery = question.trim();
  const escapedQuery = escapeRegex(trimmedQuery);
  if (escapedQuery.length >= 3) {
    const exactMatches = await DocumentChunk.find({
      userId: new mongoose.Types.ObjectId(userId),
      content: {
        $regex: escapedQuery,
        $options: "i"
      }
    }).limit(10);

    if (exactMatches.length > 0) {
      return exactMatches.map((m) => ({
        _id: m._id,
        content: m.content,
        documentId: m.documentId,
        section: m.section,
        title: m.title,
        documentName: m.documentName,
        chunkType: m.chunkType,
        score: 1.0,
        boostedScore: 1.0,
      }));
    }
  }

  // Fallback to vector search if no exact matches found
  let results = [];
  try {
    const queryVector = await embeddings.embedQuery(question);

    // Retrieve more candidates for reranking (e.g., 15)
    results = await DocumentChunk.aggregate([
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
          section: 1,
          title: 1,
          documentName: 1,
          chunkType: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
  } catch (error) {
    console.warn("Vector search failed, falling back to regex text matching:", error.message);
    
    // Extract query terms
    const queryTerms = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(term => term.length >= 3 && !STOPWORDS.has(term));

    // Find chunks for this user
    const allChunks = await DocumentChunk.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).limit(50);

    // Score chunks based on term matching frequency
    results = allChunks.map((chunk) => {
      let matchCount = 0;
      const contentLower = (chunk.content || "").toLowerCase();
      queryTerms.forEach((term) => {
        if (contentLower.includes(term)) {
          matchCount++;
        }
      });
      return {
        _id: chunk._id,
        content: chunk.content,
        documentId: chunk.documentId,
        section: chunk.section,
        title: chunk.title,
        documentName: chunk.documentName,
        chunkType: chunk.chunkType,
        score: matchCount > 0 ? 0.5 + matchCount * 0.05 : 0.1,
      };
    });
  }

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
