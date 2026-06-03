import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { extractPdfText } from "../services/pdfService.js";
import { processDocument } from "../rag/processDocument.js";

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: "jane.doe.test4@example.com" });
    if (!user) {
      throw new Error("User jane.doe.test4@example.com not found! Make sure registration completed.");
    }
    console.log("Found user:", user.email);

    // Delete any existing resume/chunks for this test user to start clean
    await Document.deleteMany({ userId: user._id, type: "resume" });
    await DocumentChunk.deleteMany({ userId: user._id });
    console.log("Cleared existing resume data for clean test");

    const filePath = "c:/Users/HP/Desktop/Programming/Projects/Full-Stack/RAG/test-resume.pdf";
    console.log("Extracting PDF text from:", filePath);
    const text = await extractPdfText(filePath);
    console.log("PDF parsed successfully. Length:", text.length);

    const document = new Document({
      userId: user._id,
      type: "resume",
      fileName: "test-resume.pdf",
      extractedText: text,
    });

    console.log("Vectorizing and embedding resume chunks (calls Gemini embedding API)...");
    const chunks = await processDocument(text);
    console.log("Generated chunks count:", chunks.length);

    await Promise.all(
      chunks.map((chunk) =>
        DocumentChunk.create({
          userId: user._id,
          documentId: document._id,
          content: chunk.content,
          embedding: chunk.embedding,
        })
      )
    );
    console.log("Saved DocumentChunks to database");

    await document.save();
    console.log("Saved Document metadata to database");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Success!");
  } catch (error) {
    console.error("Error in upload_jane_resume script:", error);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
