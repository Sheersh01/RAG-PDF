import { splitText } from "./chunker.js";
import { embeddings } from "./embeddingService.js";

export const processJdDocument = async (text) => {
  const docs = await splitText(text);
  const filtered = docs.filter((doc) => doc.pageContent.trim().length >= 20);

  if (filtered.length === 0) {
    return [];
  }

  const texts = filtered.map(
    (doc) => `Document: Job Description\n\n${doc.pageContent}`,
  );
  const embeddingsArray = await embeddings.embedDocuments(texts);

  return filtered.map((doc, index) => ({
    content: doc.pageContent,
    section: "Requirements",
    title: "Job Description",
    embedding: embeddingsArray[index],
  }));
};
