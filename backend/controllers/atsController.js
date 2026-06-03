import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildAtsScorePrompt } from "../rag/promptBuilder.js";

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

export const scoreAtsMatch = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "jobDescription is required",
      });
    }

    const chunks = await retrieveRelevantChunks(jobDescription, req.user.id);
    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildAtsScorePrompt(jobDescription, context);
    const response = await chatModel.invoke(prompt);
    const content = response?.content ?? response ?? "";
    const result = parseJsonResponse(
      Array.isArray(content)
        ? content
            .map((part) => (typeof part === "string" ? part : part?.text || ""))
            .join("")
        : content,
    );

    return res.status(200).json({
      success: true,
      score: Number.isFinite(Number(result.score)) ? Number(result.score) : 0,
      missingSkills: Array.isArray(result.missingSkills)
        ? result.missingSkills
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
