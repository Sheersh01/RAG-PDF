import Document from "../models/Document.js";
import ChatMessage from "../models/ChatMessage.js";
import chatModel from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildPrompt } from "../rag/promptBuilder.js";
import { extractModelContent } from "../utils/parseJson.js";

const formatSources = (chunks) =>
  chunks.map((chunk) => ({
    chunkId: chunk._id?.toString(),
    section: chunk.section || "General",
    title: chunk.title || "Untitled",
    score: Number((chunk.boostedScore ?? chunk.score ?? 0).toFixed(2)),
    snippet: chunk.content?.slice(0, 200) || "",
  }));

const saveChatExchange = async (userId, question, answer, sources) => {
  await ChatMessage.create({
    userId,
    role: "user",
    content: question.trim(),
    sources: [],
  });
  await ChatMessage.create({
    userId,
    role: "assistant",
    content: answer,
    sources: sources || [],
  });
};

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
    const sources = formatSources(chunks);
    const prompt = buildPrompt(question, context);

    const response = await chatModel.invoke(prompt);
    const answer = extractModelContent(response);

    await saveChatExchange(req.user.id, question, answer, sources);

    await Document.findOneAndUpdate(
      { userId: req.user.id, type: "resume" },
      { lastChatAt: new Date() },
    );

    return res.status(200).json({
      success: true,
      answer,
      sources,
      chunks: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const chatStream = async (req, res) => {
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
    const sources = formatSources(chunks);
    const prompt = buildPrompt(question, context);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const stream = await chatModel.stream(prompt);
    let fullAnswer = "";

    for await (const chunk of stream) {
      const token = extractModelContent(chunk);
      if (token) {
        fullAnswer += token;
        res.write(`data: ${JSON.stringify({ type: "token", data: token })}\n\n`);
      }
    }

    await saveChatExchange(req.user.id, question, fullAnswer, sources);

    await Document.findOneAndUpdate(
      { userId: req.user.id, type: "resume" },
      { lastChatAt: new Date() },
    );

    res.write(`data: ${JSON.stringify({ type: "sources", data: sources })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
    res.end();
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(50)
      .select("role content sources createdAt");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    return res.status(200).json({
      success: true,
      message: "Chat history cleared.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
