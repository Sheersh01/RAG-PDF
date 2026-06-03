import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildPrompt } from "../rag/promptBuilder.js";

export const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const chunks = await retrieveRelevantChunks(question, req.user.id);
    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildPrompt(question, context);

    const response = await chatModel.invoke(prompt);
    const answer =
      typeof response?.content === "string"
        ? response.content
        : Array.isArray(response?.content)
          ? response.content
              .map((part) =>
                typeof part === "string" ? part : part?.text || "",
              )
              .join("")
          : String(response ?? "");

    return res.status(200).json({
      success: true,
      answer,
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
