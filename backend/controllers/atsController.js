import Document from "../models/Document.js";
import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildAtsScorePrompt } from "../rag/promptBuilder.js";
import { parseJsonResponse, extractModelContent } from "../utils/parseJson.js";

export const scoreAtsMatch = async (req, res) => {
  try {
    const { jobDescription, useSavedJd } = req.body;
    let jdText = jobDescription?.trim() || "";

    if (useSavedJd) {
      const savedJd = await Document.findOne({
        userId: req.user.id,
        type: "jd",
      });

      if (!savedJd?.extractedText) {
        return res.status(404).json({
          success: false,
          message: "No saved job description found. Upload or paste a JD first.",
        });
      }

      jdText = savedJd.extractedText;
    }

    if (!jdText) {
      return res.status(400).json({
        success: false,
        message: "jobDescription is required",
      });
    }

    const chunks = await retrieveRelevantChunks(jdText, req.user.id);
    const context = chunks.map((chunk) => chunk.content).filter(Boolean);
    const prompt = buildAtsScorePrompt(jdText, context);
    const response = await chatModel.invoke(prompt);
    const result = parseJsonResponse(extractModelContent(response));

    const score = Number.isFinite(Number(result.score)) ? Number(result.score) : 0;
    const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];

    await Document.findOneAndUpdate(
      { userId: req.user.id, type: "resume" },
      {
        lastAtsScore: score,
        lastAtsAt: new Date(),
        cachedAtsKeyword: missingSkills[0]
          ? `Consider adding: ${missingSkills[0]}`
          : score >= 80
            ? "Strong keyword alignment with job description"
            : "Review keyword gaps for this role",
      },
    );

    return res.status(200).json({
      success: true,
      score,
      missingSkills,
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
