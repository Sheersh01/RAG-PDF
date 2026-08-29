import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Health endpoints", () => {
  it("GET / returns API banner", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/health returns healthy status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.database).toBe("connected");
  });
});

describe("Auth API", () => {
  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.token).toBeDefined();
  });

  it("rejects duplicate registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "dup@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User 2", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Login User", email: "login@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.com", password: "wrongpass" });

    expect(res.status).toBe(401);
  });

  it("returns current user with valid token", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Me User", email: "me@example.com", password: "password123" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("rejects /me without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("Validation", () => {
  it("rejects chat without question", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Chat User", email: "chat@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${registerRes.body.token}`)
      .send({ question: "" });

    expect(res.status).toBe(400);
  });

  it("rejects register with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Bad Email", email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
  });
});
