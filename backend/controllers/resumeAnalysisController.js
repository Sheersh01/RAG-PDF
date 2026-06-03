import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildResumeAnalysisPrompt } from "../rag/promptBuilder.js";

const parseJsonResponse = (text) => {
  const raw = String(text || "").trim();
  const withoutCodeFences = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = withoutCodeFences.indexOf("{");
  const end = withoutCodeFences.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Model did not return valid JSON");
  }

  return JSON.parse(withoutCodeFences.slice(start, end + 1));
};

export const analyzeResume = async (req, res) => {
  try {
    const chunks = await retrieveRelevantChunks(
      "Analyze this resume and identify strengths, weaknesses, and improvements.",
      req.user.id,
    );

    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildResumeAnalysisPrompt(context);
    const response = await chatModel.invoke(prompt);
    const content = response?.content ?? response ?? "";
    const analysis = parseJsonResponse(
      Array.isArray(content)
        ? content
            .map((part) => (typeof part === "string" ? part : part?.text || ""))
            .join("")
        : content,
    );

    return res.status(200).json({
      success: true,
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      improvements: Array.isArray(analysis.improvements)
        ? analysis.improvements
        : [],
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
