import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
// Using built-in global fetch instead of node-fetch
import User from "../models/User.js";

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 5 });
    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("Using token for user:", user.email);

    const url =
      "http://localhost:" + (process.env.PORT || 5000) + "/api/search";
    const res = await fetch(url, {
      // Using built-in global fetch instead of node-fetch
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: "What frontend technologies do I know?",
      }),
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log(JSON.stringify(data, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error calling search endpoint:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
