import { splitText } from "./chunker.js";
import { embeddings } from "./embeddingService.js";

export const processDocument = async (text) => {
  const chunks = await splitText(text);
  const texts = chunks.map((chunk) => chunk.pageContent);
  const embeddingsArray = await embeddings.embedDocuments(texts);

  return chunks.map((chunk, index) => ({
    content: chunk.pageContent,
    embedding: embeddingsArray[index],
  }));
};
