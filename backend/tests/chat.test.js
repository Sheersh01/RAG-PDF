import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app.js";

vi.mock("../rag/processDocument.js", () => ({
  processDocument: vi.fn().mockResolvedValue([
    {
      content: "Built a RAG application with Node.js and React.",
      section: "Experience",
      title: "Software Engineer",
      embedding: new Array(3072).fill(0.1),
    },
  ]),
}));

vi.mock("../services/pdfService.js", () => ({
  extractPdfText: vi.fn().mockResolvedValue(
    "John Doe\nExperience\nSoftware Engineer\nBuilt a RAG application.\nSkills\nJavaScript, Python",
  ),
}));

const registerAndGetToken = async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Chat User", email: `chat${Date.now()}@example.com`, password: "password123" });
  return res.body.token;
};

describe("Chat history API", () => {
  it("persists and returns chat history", async () => {
    const token = await registerAndGetToken();

    await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf"), "resume.pdf");

    const chatRes = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What technologies do I know?" });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);

    const historyRes = await request(app)
      .get("/api/chat/history")
      .set("Authorization", `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.messages.length).toBe(2);
    expect(historyRes.body.messages[0].role).toBe("user");
    expect(historyRes.body.messages[0].content).toContain("technologies");
    expect(historyRes.body.messages[1].role).toBe("assistant");
  });

  it("clears chat history", async () => {
    const token = await registerAndGetToken();

    await request(app)
      .post("/api/documents/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("%PDF-1.4 fake pdf"), "resume.pdf");

    await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "Summarize my experience." });

    const clearRes = await request(app)
      .delete("/api/chat/history")
      .set("Authorization", `Bearer ${token}`);

    expect(clearRes.status).toBe(200);
    expect(clearRes.body.success).toBe(true);

    const historyRes = await request(app)
      .get("/api/chat/history")
      .set("Authorization", `Bearer ${token}`);

    expect(historyRes.body.messages.length).toBe(0);
  });
});
