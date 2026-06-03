import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import User from "../models/User.js";

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 5 });
    console.log("Connected to MongoDB");

    const user = await User.findOne();
    if (!user) throw new Error("No user found to test retrieval for");

    const question = "What frontend technologies do I know?";
    console.log("Retrieving for question:", question);
    const results = await retrieveRelevantChunks(question, user._id);
    console.log("Results count:", results.length);
    results.forEach((r, i) => {
      console.log("---", i + 1, "score:", r.score);
      console.log(r.content.slice(0, 200));
    });

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
