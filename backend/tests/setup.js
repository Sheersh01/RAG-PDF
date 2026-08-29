import { beforeAll, afterAll, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const mockedAtsJson = JSON.stringify({
  score: 78,
  missingSkills: ["Docker", "AWS"],
});

const mockInvoke = vi.fn().mockImplementation((prompt) => {
  const text = typeof prompt === "string" ? prompt : String(prompt || "");
  if (text.includes("ATS scoring assistant")) {
    return Promise.resolve({ content: mockedAtsJson });
  }
  return Promise.resolve({ content: "Mocked AI response for testing." });
});

vi.mock("../services/geminiService.js", () => ({
  default: {
    invoke: mockInvoke,
    stream: vi.fn().mockImplementation(async function* () {
      yield { content: "Mocked " };
      yield { content: "stream response." };
    }),
  },
  chatModel: {
    invoke: mockInvoke,
    stream: vi.fn().mockImplementation(async function* () {
      yield { content: "Mocked " };
      yield { content: "stream response." };
    }),
  },
  generateGeminiResponse: vi.fn().mockResolvedValue("Mocked AI response for testing."),
}));

vi.mock("../rag/embeddingService.js", () => ({
  embeddings: {
    embedDocuments: vi.fn().mockImplementation((texts) =>
      Promise.resolve(texts.map(() => new Array(3072).fill(0.1))),
    ),
    embedQuery: vi.fn().mockResolvedValue(new Array(3072).fill(0.1)),
  },
}));

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
