import { splitTextIntoResumeChunks } from "./chunker.js";
import { embeddings } from "./embeddingService.js";

export const processDocument = async (text) => {
  const chunks = await splitTextIntoResumeChunks(text);
  
  const paginationRegex = /^(?:page\s*\d+|\(?\s*\d+\s*of\s*\d+\s*\)?|[-—_]*\s*\d+\s*of\s*\d+\s*[-—_]*)$/i;
  
  // Filter out empty, pagination, or very short garbage chunks
  const filteredChunks = chunks.filter(chunk => {
    const content = chunk.content.trim();
    if (!content) return false;
    if (content.length < 20 && !/[a-zA-Z]/.test(content)) return false;
    if (paginationRegex.test(content)) return false;
    return true;
  });

  const texts = filteredChunks.map((chunk) => chunk.enrichedContent);
  
  if (texts.length === 0) {
    return [];
  }
  
  const embeddingsArray = await embeddings.embedDocuments(texts);

  return filteredChunks.map((chunk, index) => ({
    content: chunk.content,
    section: chunk.section,
    title: chunk.title,
    embedding: embeddingsArray[index],
  }));
};
