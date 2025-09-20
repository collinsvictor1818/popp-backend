import request from "supertest";
import app from "../src/app";
import prisma from "../src/prismaClient";

beforeAll(async () => {
  // Clear the database before running tests
  await prisma.conversation.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.job.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Webhook handler", () => {
  it("should reject invalid phone", async () => {
    const res = await request(app)
      .post("/api/webhook/applications")
      .send({
        id: "app-1",
        job_id: "job-1",
        candidate_id: "cand-1",
        candidate: {
          phone_number: "12345",
          first_name: "Jane",
          last_name: "Doe",
          email_address: "jane@example.com"
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid phone");
  });

  it("should create conversation on valid payload", async () => {
    const res = await request(app)
      .post("/api/webhook/applications")
      .set("x-api-key", "dev-key") // Add API key for authorization
      .send({
        id: "app-2",
        job_id: "job-2",
        candidate_id: "cand-2",
        candidate: {
          phone_number: "+12345678901",
          first_name: "John",
          last_name: "Doe",
          email_address: "john@example.com"
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("CREATED");
  });

  it("should prevent duplicate application", async () => {
    // create once
    await request(app)
      .post("/api/webhook/applications")
      .set("x-api-key", "dev-key") // Add API key for authorization
      .send({
        id: "app-3",
        job_id: "job-dedupe",
        candidate_id: "cand-dedupe",
        candidate: {
          phone_number: "+11111111111",
          first_name: "Dup",
          last_name: "User",
          email_address: "dup@example.com"
        }
      });

    // second attempt same candidate + same job
    const res2 = await request(app)
      .post("/api/webhook/applications")
      .set("x-api-key", "dev-key") // Add API key for authorization
      .send({
        id: "app-3b",
        job_id: "job-dedupe",
        candidate_id: "cand-dedupe",
        candidate: {
          phone_number: "+11111111111",
          first_name: "Dup",
          last_name: "User",
          email_address: "dup@example.com"
        }
      });

    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain("already applied");
  });

  it("should prevent active conversation", async () => {
    // create a conversation
    await request(app)
      .post("/api/webhook/applications")
      .set("x-api-key", "dev-key")
      .send({
        id: "app-4",
        job_id: "job-active-1",
        candidate_id: "cand-active",
        candidate: {
          phone_number: "+22222222222",
          first_name: "Active",
          last_name: "User",
          email_address: "active@example.com"
        }
      });

    // attempt to create another conversation for the same candidate
    const res2 = await request(app)
      .post("/api/webhook/applications")
      .set("x-api-key", "dev-key")
      .send({
        id: "app-5",
        job_id: "job-active-2",
        candidate_id: "cand-active",
        candidate: {
          phone_number: "+22222222222",
          first_name: "Active",
          last_name: "User",
          email_address: "active@example.com"
        }
      });

    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain("active conversation");
  });
});
