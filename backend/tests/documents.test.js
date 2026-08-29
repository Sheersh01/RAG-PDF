import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { processDocument } from "../rag/processDocument.js";
import { vi } from "vitest";

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
    "John Doe\nExperience\nSoftware Engineer at TechCorp\nBuilt a RAG application.\nSkills\nJavaScript, Python, MongoDB",
  ),
}));

const registerAndGetToken = async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Doc User", email: `doc${Date.now()}@example.com`, password: "password123" });
  return res.body.token;
};

describe("Documents API", () => {
  it("uploads a resume and creates chunks", async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf content"), "resume.pdf");

    expect(res.status).toBe(201);
    expect(res.body.vectorsCount).toBe(2);
    expect(res.body.sectionsCount).toBeGreaterThan(0);
    expect(processDocument).toHaveBeenCalled();
  });

  it("returns resume stats after upload", async () => {
    const token = await registerAndGetToken();

    await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf"), "resume.pdf");

    const res = await request(app)
      .get("/api/documents/resume/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.vectorsCount).toBe(2);
    expect(res.body.activity.length).toBeGreaterThan(0);
  });
});

describe("Chat API", () => {
  it("returns answer with sources", async () => {
    const token = await registerAndGetToken();

    await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf"), "resume.pdf");

    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What technologies do I know?" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.answer).toBeDefined();
    expect(Array.isArray(res.body.sources)).toBe(true);
  });
});
