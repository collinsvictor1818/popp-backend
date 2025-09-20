import prisma from "../prismaClient"; // create a small wrapper that exports PrismaClient instance
import { ApplicationEvent } from "../models/types";

export async function hasActiveConversation(candidateId: string) {
  const active = await prisma.conversation.findFirst({
    where: {
      candidateId,
      status: { in: ["CREATED", "ONGOING"] }
    }
  });
  return !!active;
}

export async function hasAppliedToJob(candidateId: string, jobId: string) {
  const convo = await prisma.conversation.findUnique({
    where: {
      candidateId_jobId: { candidateId, jobId }
    }
  });
  return !!convo;
}

export async function createCandidateIfNotExists(id: string, candidateDTO: any) {
  const { email_address, phone_number, first_name, last_name } = candidateDTO;
  // Try find by email or phone
  let candidate = await prisma.candidate.findFirst({
    where: {
      OR: [
        { emailAddress: email_address },
        { phoneNumber: phone_number }
      ]
    }
  });
  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: {
        id: id,
        emailAddress: email_address,
        phoneNumber: phone_number,
        firstName: first_name,
        lastName: last_name
      }
    });
  }
  return candidate;
}

export async function createConversation(event: ApplicationEvent) {
  const { candidate_id, job_id, candidate } = event;

  // ensure candidate row exists or create it
  const dbCandidate = await createCandidateIfNotExists(candidate_id, candidate);

  // Prevent active convos
  if (await hasActiveConversation(dbCandidate.id)) {
    const err: any = new Error("Candidate has an active conversation");
    err.code = "ACTIVE_CONVERSATION";
    throw err;
  }

  // Prevent duplicate application (candidateId + jobId) even if completed
  // Because we use unique constraint, attempt to create with try/catch to handle conflict.
  try {
    const created = await prisma.conversation.create({
      data: {
        candidateId: dbCandidate.id,
        jobId: job_id,
        status: "CREATED"
      }
    });

    return created;
  } catch (e: any) {
    // Handle unique constraint error from Prisma
    if (e?.code === "P2002") {
      const err: any = new Error("Candidate already applied for this job");
      err.code = "DUPLICATE_APPLICATION";
      throw err;
    }
    throw e;
  }
}
