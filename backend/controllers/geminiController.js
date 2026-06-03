import { generateGeminiResponse } from "../services/geminiService.js";

export const testGemini = async (req, res) => {
  try {
    const prompt = req.body.prompt || "Tell me a joke";
    const response = await generateGeminiResponse(prompt);

    return res.status(200).json({
      success: true,
      prompt,
      response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
