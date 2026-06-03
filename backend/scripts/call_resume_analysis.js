import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
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
    const url = `http://localhost:${process.env.PORT || 5000}/api/analyze-resume`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    console.log("status", res.status);
    console.log("content-type", contentType);
    console.log(text);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error calling resume analysis endpoint:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
