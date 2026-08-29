import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import DocumentChunk from "../models/DocumentChunk.js";

vi.mock("../rag/processJdDocument.js", () => ({
  processJdDocument: vi.fn().mockResolvedValue([
    {
      content: "We are hiring a React developer with Node.js and MongoDB experience.",
      section: "Requirements",
      title: "Job Description",
      embedding: new Array(3072).fill(0.1),
    },
    {
      content: "Required skills: JavaScript, TypeScript, REST APIs, and cloud deployment.",
      section: "Requirements",
      title: "Job Description",
      embedding: new Array(3072).fill(0.1),
    },
  ]),
}));

vi.mock("../rag/processDocument.js", () => ({
  processDocument: vi.fn().mockResolvedValue([
    {
      content: "Built a RAG application with Node.js and React.",
      section: "Experience",
      title: "Software Engineer",
      embedding: new Array(3072).fill(0.1),
    },
    {
      content: "Skills: JavaScript, Python, MongoDB, LangChain.",
      section: "Skills",
      title: "Technical Skills",
      embedding: new Array(3072).fill(0.1),
    },
  ]),
}));

vi.mock("../services/pdfService.js", () => ({
  extractPdfText: vi.fn().mockResolvedValue(
    "Senior React Developer\nRequirements\nReact, Node.js, MongoDB\nSkills\nJavaScript, TypeScript",
  ),
}));

const registerAndGetToken = async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "JD User", email: `jd${Date.now()}@example.com`, password: "password123" });
  return res.body.token;
};

describe("JD API", () => {
  it("uploads a text JD and creates jd chunks", async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .post("/api/documents/jd")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "We need a full-stack engineer with React, Node.js, and MongoDB experience for our platform team.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.document.vectorsCount).toBe(2);

    const chunks = await DocumentChunk.find({ chunkType: "jd" });
    expect(chunks.length).toBe(2);
    expect(chunks.every((chunk) => chunk.section === "Requirements")).toBe(true);
  });

  it("scores ATS match using saved JD", async () => {
    const token = await registerAndGetToken();

    await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf"), "resume.pdf");

    await request(app)
      .post("/api/documents/jd")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Looking for a React and Node.js engineer with MongoDB and REST API experience.",
      });

    const res = await request(app)
      .post("/api/ats-score")
      .set("Authorization", `Bearer ${token}`)
      .send({ useSavedJd: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.score).toBe("number");
    expect(Array.isArray(res.body.missingSkills)).toBe(true);
  });
});
