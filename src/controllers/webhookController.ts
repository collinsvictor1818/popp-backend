import { Request, Response } from "express";
import { isValidPhoneNumber } from "../utils/validation";
import { createConversation } from "../services/conversationService";

export async function webhookApplications(req: Request, res: Response) {
  const payload = req.body;
  if (!payload || !payload.candidate || !payload.candidate.phone_number) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  if (!isValidPhoneNumber(payload.candidate.phone_number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const convo = await createConversation(payload);
    return res.status(201).json({
      id: convo.id,
      candidateId: convo.candidateId,
      jobId: convo.jobId,
      status: convo.status,
      createdAt: convo.createdAt
    });
  } catch (err: any) {
    if (err.code === "ACTIVE_CONVERSATION") {
      return res.status(400).json({ error: err.message });
    } else if (err.code === "DUPLICATE_APPLICATION") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
