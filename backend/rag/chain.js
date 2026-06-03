import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import embeddings from "./embeddings.js";
import { addVectorsToStore, clearVectorsForDocument } from "./vectorStore.js";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const ingestDocumentText = async ({
  documentId,
  userId,
  type,
  fileName,
  extractedText,
}) => {
  if (!extractedText || !extractedText.trim()) {
    return [];
  }

  clearVectorsForDocument(documentId);

  const chunks = await textSplitter.splitText(extractedText);
  const vectors = await embeddings.embedDocuments(chunks);

  const items = chunks.map((chunk, index) => ({
    documentId,
    userId,
    type,
    fileName,
    chunkIndex: index,
    text: chunk,
    vector: vectors[index],
  }));

  addVectorsToStore(items);

  return items;
};
