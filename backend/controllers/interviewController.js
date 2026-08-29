import Document from "../models/Document.js";
import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks, getAllResumeChunks } from "../rag/retriever.js";
import { buildInterviewQuestionsPrompt } from "../rag/promptBuilder.js";
import { parseJsonResponse, extractModelContent } from "../utils/parseJson.js";

export const generateInterviewQuestions = async (req, res) => {
  try {
    const { topic = "Generate mock interview questions from this resume." } =
      req.body;

    let chunks = await retrieveRelevantChunks(topic, req.user.id);
    if (chunks.length === 0) {
      chunks = await getAllResumeChunks(req.user.id);
    }
    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildInterviewQuestionsPrompt(topic, context);
    const response = await chatModel.invoke(prompt);
    const result = parseJsonResponse(extractModelContent(response));

    await Document.findOneAndUpdate(
      { userId: req.user.id, type: "resume" },
      { $inc: { mockInterviewCount: 1 } },
    );

    return res.status(200).json({
      success: true,
      questions: Array.isArray(result.questions) ? result.questions : [],
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
