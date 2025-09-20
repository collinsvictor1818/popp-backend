import { Request, Response } from 'express';
import { createConversation } from '../services/conversationService';
import { isValidPhoneNumber, ApplicationEventSchema } from '../utils/validation';
import { ApplicationEvent } from '../models/types';

export const handleApplicationWebhook = async (req: Request, res: Response) => {
  let event: ApplicationEvent;

  try {
    event = ApplicationEventSchema.parse(req.body);
  } catch (error: any) {
    console.error("Webhook error: Invalid payload structure or data types", error.errors || error.message);
    return res.status(400).json({ error: "Invalid payload", details: error.errors || error.message });
  }

  const { candidate } = event;

  // Phone number validation (still useful for specific format beyond basic string check)
  if (!isValidPhoneNumber(candidate.phone_number)) {
    console.error("Webhook error: Invalid phone number format", candidate.phone_number);
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const conversation = await createConversation(event);
    return res.status(200).json({ message: "Application event processed", conversationId: conversation.id });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message, { eventId: event.id, candidateId: event.candidate_id });

    if (error.code === "ACTIVE_CONVERSATION") {
      return res.status(409).json({ error: "Candidate already has an active conversation" });
    } else if (error.code === "DUPLICATE_APPLICATION") {
      // This implies a new conversation was attempted for an already existing candidateId_jobId pair.
      // As per spec, we should prevent creation. Returning 200 OK here might be misleading if no new conversation was created.
      // A 409 Conflict is more appropriate if the intent was to create a *new* conversation but it already exists.
      return res.status(409).json({ error: "Candidate has already applied for this job" });
    } else {
      return res.status(500).json({ error: "Internal server error processing webhook" });
    }
  }
};