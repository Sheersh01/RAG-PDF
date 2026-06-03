const vectorStore = [];

const cosineSimilarity = (leftVector, rightVector) => {
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < leftVector.length; index += 1) {
    dotProduct += leftVector[index] * rightVector[index];
    leftMagnitude += leftVector[index] * leftVector[index];
    rightMagnitude += rightVector[index] * rightVector[index];
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

export const addVectorsToStore = (items) => {
  vectorStore.push(...items);
};

export const clearVectorsForDocument = (documentId) => {
  for (let index = vectorStore.length - 1; index >= 0; index -= 1) {
    if (String(vectorStore[index].documentId) === String(documentId)) {
      vectorStore.splice(index, 1);
    }
  }
};

export const similaritySearch = async (
  queryVector,
  { userId, limit = 5 } = {},
) => {
  const scoredItems = vectorStore
    .filter((item) => !userId || String(item.userId) === String(userId))
    .map((item) => ({
      ...item,
      score: cosineSimilarity(queryVector, item.vector),
    }))
    .sort((left, right) => right.score - left.score);

  return scoredItems.slice(0, limit);
};

export const getVectorStoreSize = () => vectorStore.length;
