import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "../config/db.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { retrieveRelevantChunks } from "../rag/retriever.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const goldenPath = join(__dirname, "../evals/golden.json");

const findUserId = async (cliUserId) => {
  if (cliUserId) {
    return cliUserId;
  }

  const latestChunk = await DocumentChunk.findOne({
    $or: [{ chunkType: "resume" }, { chunkType: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .select("userId");

  if (!latestChunk?.userId) {
    throw new Error(
      "No resume chunks found. Pass a userId argument or upload a resume first.",
    );
  }

  return latestChunk.userId.toString();
};

const evaluateQuestion = (chunks, item) => {
  const top5 = chunks.slice(0, 5);
  const keywords = (item.expectedKeywords || []).map((k) => k.toLowerCase());
  const expectedSection = item.expectedSection?.toLowerCase();

  const keywordHit = top5.some((chunk) => {
    const haystack = `${chunk.content || ""} ${chunk.section || ""} ${chunk.title || ""}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });

  const sectionHit = expectedSection
    ? top5.some((chunk) => (chunk.section || "").toLowerCase() === expectedSection)
    : false;

  return {
    pass: keywordHit || sectionHit,
    keywordHit,
    sectionHit,
    topSections: top5.map((chunk) => chunk.section || "General"),
  };
};

const runEval = async () => {
  const cliUserId = process.argv[2];
  const golden = JSON.parse(readFileSync(goldenPath, "utf-8"));

  await connectDB();
  const userId = await findUserId(cliUserId);

  console.log(`\nRAG Evaluation — userId: ${userId}`);
  console.log(`Golden set: ${golden.length} questions\n`);

  let passed = 0;
  const rows = [];

  for (const item of golden) {
    const chunks = await retrieveRelevantChunks(item.question, userId);
    const result = evaluateQuestion(chunks, item);
    if (result.pass) passed += 1;

    rows.push({
      question: item.question,
      pass: result.pass,
      keywordHit: result.keywordHit,
      sectionHit: result.sectionHit,
      topSections: result.topSections.join(", "),
    });
  }

  const precisionAt5 = golden.length > 0 ? passed / golden.length : 0;

  console.log("Question".padEnd(52), "Pass", "Keywords", "Section", "Top-5 Sections");
  console.log("-".repeat(100));
  for (const row of rows) {
    console.log(
      row.question.slice(0, 50).padEnd(52),
      row.pass ? "✓" : "✗",
      row.keywordHit ? "✓" : "✗",
      row.sectionHit ? "✓" : "✗",
      row.topSections,
    );
  }

  console.log("\n" + "=".repeat(100));
  console.log(`precision@5: ${(precisionAt5 * 100).toFixed(1)}% (${passed}/${golden.length})`);
  console.log("=".repeat(100) + "\n");

  await mongoose.connection.close();
  process.exit(precisionAt5 >= 0.5 ? 0 : 1);
};

runEval().catch(async (error) => {
  console.error("Eval failed:", error.message);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
