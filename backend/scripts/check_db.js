import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";

async function check() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const usersCount = await User.countDocuments();
    const docsCount = await Document.countDocuments();
    const chunksCount = await DocumentChunk.countDocuments();
    console.log(`DB Counts - Users: ${usersCount}, Documents: ${docsCount}, Chunks: ${chunksCount}`);

    const doc = await Document.findOne().sort({ createdAt: -1 });
    if (doc) {
      console.log(`Latest Document: id=${doc._id}, fileName=${doc.fileName}, userId=${doc.userId}`);
      const chunks = await DocumentChunk.find({ documentId: doc._id });
      console.log(`Found ${chunks.length} chunks for this document.`);
      if (chunks.length > 0) {
        console.log(`Sample chunk embedding length: ${chunks[0].embedding.length}`);
      }
    } else {
      console.log("No documents found in database.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("DB check error:", error);
    try { await mongoose.disconnect(); } catch (e) {}
  }
}

check();
