import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const coll = await DocumentChunk.collection;
    console.log("Creating index on userId...");
    const res = await coll.createIndex({ userId: 1 });
    console.log("Index created:", res);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
