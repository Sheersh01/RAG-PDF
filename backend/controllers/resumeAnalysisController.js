import Document from "../models/Document.js";
import chatModel from "../services/geminiService.js";
import { getAllResumeChunks } from "../rag/retriever.js";
import { buildResumeAnalysisPrompt } from "../rag/promptBuilder.js";
import { parseJsonResponse, extractModelContent } from "../utils/parseJson.js";

export const analyzeResume = async (req, res) => {
  try {
    const resume = await Document.findOne({ userId: req.user.id, type: "resume" });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload a resume first.",
      });
    }

    const chunks = await getAllResumeChunks(req.user.id);
    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Resume has no indexed chunks. Please re-upload your resume.",
      });
    }

    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildResumeAnalysisPrompt(context);
    const response = await chatModel.invoke(prompt);
    const analysis = parseJsonResponse(extractModelContent(response));

    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    const improvements = Array.isArray(analysis.improvements) ? analysis.improvements : [];

    await Document.findOneAndUpdate(
      { userId: req.user.id, type: "resume" },
      {
        lastAnalysisAt: new Date(),
        cachedStrength: strengths[0] || null,
        cachedImprovement: improvements[0] || weaknesses[0] || null,
      },
    );

    return res.status(200).json({
      success: true,
      strengths,
      weaknesses,
      improvements,
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
