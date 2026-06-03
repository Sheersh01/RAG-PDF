import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import path from "path";
import fs from "fs";

import User from "../models/User.js";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import * as procMod from "../rag/processDocument.js";

const processDocument = procMod.processDocument || procMod.default || procMod;

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set in .env");
    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 5 });
    console.log("Connected to MongoDB");

    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Sim Upload User",
        email: `simulate-upload+${Date.now()}@example.com`,
        password: "test",
      });
      console.log("Created test user:", user.email);
    } else {
      console.log("Using existing user:", user.email);
    }

    // Build a moderately-sized sample resume text by repeating a paragraph
    const paragraph = `Experienced software developer with a track record of building production web applications. Worked on front-end and back-end systems, designed APIs, integrated third-party services, and optimized performance. Skilled in Node.js, Express, MongoDB, and cloud deployments.`;
    const repetitions = 40; // adjust to produce a handful of chunks without excessive API calls
    const sampleText = Array(repetitions).fill(paragraph).join("\n\n");

    console.log(
      "Processing document into chunks and embeddings (this may take a moment)...",
    );
    const chunks = await processDocument(sampleText);
    console.log("processDocument returned chunk count:", chunks.length);

    const document = await Document.create({
      userId: user._id,
      type: "resume",
      fileName: "simulate_upload.txt",
      extractedText: sampleText.slice(0, 1000000),
    });

    const docsToInsert = chunks.map((chunk) => ({
      userId: user._id,
      documentId: document._id,
      content: chunk.content || chunk.text || chunk.pageContent || "",
      embedding: chunk.embedding || chunk.vector || chunk.emb || [],
    }));

    const inserted = await DocumentChunk.insertMany(docsToInsert);
    console.log("Inserted DocumentChunk count:", inserted.length);
    if (inserted.length > 0) {
      console.log(
        "Sample chunk content (truncated):",
        inserted[0].content.slice(0, 120),
      );
      console.log(
        "Sample embedding length:",
        (inserted[0].embedding || []).length,
      );
    }

    await mongoose.disconnect();
    console.log("Done — disconnected from MongoDB");
  } catch (err) {
    console.error("Error in simulate_upload:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
