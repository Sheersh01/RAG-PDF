import { retrieveRelevantChunks } from "../rag/retriever.js";

export const searchChunks = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const chunks = await retrieveRelevantChunks(question, req.user.id);

    return res.status(200).json({
      success: true,
      chunks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
