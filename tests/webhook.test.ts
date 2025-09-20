import request from "supertest";
import app from "../src/app";
import prisma from "../src/prismaClient";

const API_KEY = process.env.API_KEY || "my-secret-api-key"; // Use the API_KEY from .env

beforeAll(async () => {
  // Clear the database before running tests
  await prisma.conversation.deleteMany({});
  await prisma.candidate.deleteMany({});
  // No need to delete job, as it's not a model in our schema
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Webhook handler", () => {
  // Test Case 1: Missing API Key
  it("should return 401 if API key is missing", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .send({
        id: "app-no-key",
        job_id: "job-no-key",
        candidate_id: "cand-no-key",
        candidate: {
          phone_number: "+12345678901",
          first_name: "No",
          last_name: "Key",
          email_address: "nokey@example.com"
        }
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized: X-API-Key header missing");
  });

  // Test Case 2: Invalid API Key
  it("should return 403 if API key is invalid", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", "wrong-key")
      .send({
        id: "app-bad-key",
        job_id: "job-bad-key",
        candidate_id: "cand-bad-key",
        candidate: {
          phone_number: "+12345678901",
          first_name: "Bad",
          last_name: "Key",
          email_address: "badkey@example.com"
        }
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: Invalid X-API-Key");
  });

  // Test Case 3: Zod validation - missing required field (id)
  it("should return 400 for missing required fields (Zod validation)", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        job_id: "job-zod-missing",
        candidate_id: "cand-zod-missing",
        candidate: {
          phone_number: "+12345678901",
          first_name: "Zod",
          last_name: "Missing",
          email_address: "zodmissing@example.com"
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
    expect(res.body.details).toContain("id: Required");
  });

  // Test Case 4: Zod validation - invalid email format
  it("should return 400 for invalid email format (Zod validation)", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-zod-email",
        job_id: "job-zod-email",
        candidate_id: "cand-zod-email",
        candidate: {
          phone_number: "+12345678901",
          first_name: "Zod",
          last_name: "Email",
          email_address: "invalid-email"
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
    expect(res.body.details).toContain("email_address: Invalid email");
  });

  // Test Case 5: Invalid phone number format
  it("should return 400 for invalid phone number format", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-invalid-phone",
        job_id: "job-invalid-phone",
        candidate_id: "cand-invalid-phone",
        candidate: {
          phone_number: "12345", // Missing '+' and too short
          first_name: "Invalid",
          last_name: "Phone",
          email_address: "invalidphone@example.com"
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid phone number format");
    expect(res.body.details).toContain("does not match expected international format");
  });

  // Test Case 6: Valid payload - creates conversation
  it("should create conversation on valid payload", async () => {
    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-valid-1",
        job_id: "job-valid-1",
        candidate_id: "cand-valid-1",
        candidate: {
          phone_number: "+15551234567",
          first_name: "John",
          last_name: "Doe",
          email_address: "john.doe@example.com"
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Application event processed");
    expect(res.body.conversationId).toBeDefined();

    const conversation = await prisma.conversation.findUnique({
      where: { id: res.body.conversationId },
    });
    expect(conversation).toBeDefined();
    expect(conversation?.status).toBe("CREATED");
  });

  // Test Case 7: Prevent duplicate application
  it("should return 409 if candidate already applied for this job", async () => {
    // First application (should succeed)
    await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-dedupe-1",
        job_id: "job-dedupe-1",
        candidate_id: "cand-dedupe-1",
        candidate: {
          phone_number: "+11111111111",
          first_name: "Dup",
          last_name: "User",
          email_address: "dup@example.com"
        }
      });

    // Second application for the same candidate and job (should conflict)
    const res2 = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-dedupe-2", // Different app ID, but same candidate_id and job_id
        job_id: "job-dedupe-1",
        candidate_id: "cand-dedupe-1",
        candidate: {
          phone_number: "+11111111111",
          first_name: "Dup",
          last_name: "User",
          email_address: "dup@example.com"
        }
      });

    expect(res2.status).toBe(409);
    expect(res2.body.error).toBe("Candidate has already applied for this job");
  });

  // Test Case 8: Prevent active conversation
  it("should return 409 if candidate already has an active conversation", async () => {
    // First application (should succeed and create an ACTIVE conversation)
    await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-active-1",
        job_id: "job-active-1",
        candidate_id: "cand-active-1",
        candidate: {
          phone_number: "+22222222222",
          first_name: "Active",
          last_name: "User",
          email_address: "active@example.com"
        }
      });

    // Second application for the same candidate (should conflict due to active conversation)
    const res2 = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-active-2",
        job_id: "job-active-2", // Different job ID
        candidate_id: "cand-active-1", // Same candidate ID
        candidate: {
          phone_number: "+22222222222",
          first_name: "Active",
          last_name: "User",
          email_address: "active@example.com"
        }
      });

    expect(res2.status).toBe(409);
    expect(res2.body.error).toBe("Candidate already has an active conversation");
  });

  // Test Case 9: Internal Server Error
  it("should return 500 for internal server errors", async () => {
    // Temporarily mock createConversation to throw a generic error
    const originalCreateConversation = jest.requireActual('../src/services/conversationService').createConversation;
    jest.spyOn(require('../src/services/conversationService'), 'createConversation').mockImplementationOnce(() => {
      throw new Error("Simulated internal error");
    });

    const res = await request(app)
      .post("/api/webhook/application")
      .set("x-api-key", API_KEY)
      .send({
        id: "app-internal-error",
        job_id: "job-internal-error",
        candidate_id: "cand-internal-error",
        candidate: {
          phone_number: "+19998887777",
          first_name: "Internal",
          last_name: "Error",
          email_address: "internal@example.com"
        }
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error processing webhook");
    expect(res.body.details).toBe("An unexpected error occurred.");

    // Restore original implementation
    jest.restoreAllMocks();
  });
});