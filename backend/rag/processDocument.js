import { splitText } from "./chunker.js";
import { embeddings } from "./embeddingService.js";

export const processDocument = async (text) => {
  const chunks = await splitText(text);

  const processedChunks = await Promise.all(
    chunks.map(async (chunk) => ({
      content: chunk.pageContent,
      embedding: await embeddings.embedQuery(chunk.pageContent),
    })),
  );

  return processedChunks;
};
