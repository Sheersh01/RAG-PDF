import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  return await splitter.createDocuments([text]);
};
