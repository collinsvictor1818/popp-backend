import request from "supertest";
import app from "../src/app";
import prisma from "../src/prismaClient";
import { ConversationStatus } from '@prisma/client';

const API_KEY = process.env.API_KEY || "my-secret-api-key";

describe("Conversation API Endpoints", () => {
  let testCandidateId: string;
  let createdConversationId: string;
  let ongoingConversationId: string;
  let completedConversationId: string;

  beforeAll(async () => {
    // Clear database before all tests
    await prisma.conversation.deleteMany({});
    await prisma.candidate.deleteMany({});

    // Seed test data
    const candidate = await prisma.candidate.create({
      data: {
        id: "test-candidate-1",
        phoneNumber: "+12345678900",
        firstName: "Test",
        lastName: "Candidate",
        emailAddress: "test@example.com",
      },
    });
    testCandidateId = candidate.id;

    const createdConvo = await prisma.conversation.create({
      data: {
        id: "convo-created-1",
        candidateId: testCandidateId,
        jobId: "job-1",
        status: ConversationStatus.CREATED,
      },
    });
    createdConversationId = createdConvo.id;

    const ongoingConvo = await prisma.conversation.create({
      data: {
        id: "convo-ongoing-1",
        candidateId: testCandidateId,
        jobId: "job-2",
        status: ConversationStatus.ONGOING,
      },
    });
    ongoingConversationId = ongoingConvo.id;

    const completedConvo = await prisma.conversation.create({
      data: {
        id: "convo-completed-1",
        candidateId: testCandidateId,
        jobId: "job-3",
        status: ConversationStatus.COMPLETED,
      },
    });
    completedConversationId = completedConvo.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- GET /api/conversations --- //

  it("should return 401 if API key is missing for GET /conversations", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized: X-API-Key header missing");
  });

  it("should return 403 if API key is invalid for GET /conversations", async () => {
    const res = await request(app).get("/api/conversations").set("x-api-key", "wrong-key");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: Invalid X-API-Key");
  });

  it("should fetch all conversations", async () => {
    const res = await request(app).get("/api/conversations").set("x-api-key", API_KEY);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(3); // Expecting 3 seeded conversations
    expect(res.body[0].id).toBe(completedConversationId); // Ordered by createdAt desc
  });

  it("should fetch conversations filtered by status (CREATED)", async () => {
    const res = await request(app).get("/api/conversations?status=CREATED").set("x-api-key", API_KEY);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe("CREATED");
    expect(res.body[0].id).toBe(createdConversationId);
  });

  it("should fetch conversations filtered by status (ONGOING)", async () => {
    const res = await request(app).get("/api/conversations?status=ONGOING").set("x-api-key", API_KEY);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe("ONGOING");
    expect(res.body[0].id).toBe(ongoingConversationId);
  });

  it("should return 400 for invalid status filter", async () => {
    const res = await request(app).get("/api/conversations?status=INVALID_STATUS").set("x-api-key", API_KEY);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid status provided");
    expect(res.body.details).toContain("Status must be one of:");
  });

  // --- GET /api/conversations/:id --- //

  it("should return 401 if API key is missing for GET /conversations/:id", async () => {
    const res = await request(app).get(`/api/conversations/${createdConversationId}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized: X-API-Key header missing");
  });

  it("should return 403 if API key is invalid for GET /conversations/:id", async () => {
    const res = await request(app).get(`/api/conversations/${createdConversationId}`).set("x-api-key", "wrong-key");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: Invalid X-API-Key");
  });

  it("should fetch a conversation by ID", async () => {
    const res = await request(app).get(`/api/conversations/${createdConversationId}`).set("x-api-key", API_KEY);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdConversationId);
    expect(res.body.status).toBe("CREATED");
    expect(res.body.candidate).toBeDefined();
    expect(res.body.candidate.id).toBe(testCandidateId);
  });

  it("should return 404 if conversation ID is not found", async () => {
    const res = await request(app).get("/api/conversations/non-existent-id").set("x-api-key", API_KEY);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Conversation not found");
    expect(res.body.details).toContain("Conversation with ID non-existent-id not found.");
  });
});
