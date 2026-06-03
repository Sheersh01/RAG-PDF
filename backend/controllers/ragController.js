import { retrieveRelevantChunks } from "../rag/retriever.js";
import { ragAnswerPrompt } from "../rag/prompts.js";
import { generateGeminiResponse } from "../services/geminiService.js";

export const searchDocuments = async (req, res) => {
  try {
    const question = req.body.question || req.body.prompt;
    const limit = Number(req.body.limit) || 5;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const chunks = await retrieveRelevantChunks(question, {
      userId: req.user.userId,
      limit,
    });

    return res.status(200).json({
      success: true,
      question,
      chunks: chunks.map((chunk) => ({
        documentId: chunk.documentId,
        type: chunk.type,
        fileName: chunk.fileName,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        score: chunk.score,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const question = req.body.question || req.body.prompt;
    const limit = Number(req.body.limit) || 5;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const chunks = await retrieveRelevantChunks(question, {
      userId: req.user.userId,
      limit,
    });

    const context = chunks
      .map(
        (chunk, index) =>
          `Chunk ${index + 1} (${chunk.type} | ${chunk.fileName}):\n${chunk.text}`,
      )
      .join("\n\n");

    const prompt = ragAnswerPrompt(context, question);
    const answer = await generateGeminiResponse(prompt);

    return res.status(200).json({
      success: true,
      question,
      answer,
      chunks: chunks.map((chunk) => ({
        documentId: chunk.documentId,
        type: chunk.type,
        fileName: chunk.fileName,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        score: chunk.score,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
