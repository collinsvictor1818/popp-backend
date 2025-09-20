import { Request, Response } from 'express';
import { createConversation } from '../services/conversationService';
import { isValidPhoneNumber } from '../utils/validation';
import { ApplicationEvent } from '../models/types';

export const handleApplicationWebhook = async (req: Request, res: Response) => {
  const event: ApplicationEvent = req.body;

  // Basic payload validation
  if (!event || !event.id || !event.job_id || !event.candidate_id || !event.candidate) {
    console.error("Webhook error: Invalid payload structure", event);
    return res.status(400).json({ error: "Invalid payload structure" });
  }

  const { candidate } = event;

  // Phone number validation
  if (!isValidPhoneNumber(candidate.phone_number)) {
    console.error("Webhook error: Invalid phone number format", candidate.phone_number);
    // TODO: Consider more specific error messages for different validation failures
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const conversation = await createConversation(event);
    // NOTE: A 200 OK is returned even if a conversation already existed but was marked as completed,
    // as per the duplicate application check logic which prevents new creation but doesn't error out if already completed.
    // However, our current implementation throws an error for both active and duplicate applications.
    // Re-evaluating the spec: "Prevent the creation of a new conversation if the candidate has already applied for the same job, even if the conversation has been marked as COMPLETED."
    // This implies that if it's a duplicate, we should just acknowledge it without creating a new one.
    // Our current `createConversation` throws an error for duplicates. We might need to adjust this.
    // For now, we'll catch the specific errors and return appropriate HTTP codes.
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