import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: modelName,
});

export const generateGeminiResponse = async (prompt) => {
  const response = await chatModel.invoke(prompt);
  return typeof response?.content === "string"
    ? response.content
    : Array.isArray(response?.content)
      ? response.content
          .map((part) => (typeof part === "string" ? part : part?.text || ""))
          .join("")
      : String(response ?? "");
};

export default chatModel;
