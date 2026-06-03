import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return await splitter.createDocuments([text]);
};
