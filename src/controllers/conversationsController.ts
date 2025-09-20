import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { ConversationStatus } from '@prisma/client'; // Import Prisma's generated ConversationStatus enum

export const getAllConversations = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    let whereClause: any = {};
    if (status) {
      const statusString = String(status).toUpperCase();
      // Validate status against enum values
      if (!Object.values(ConversationStatus).includes(statusString as ConversationStatus)) {
        return res.status(400).json({ error: "Invalid status provided", details: `Status must be one of: ${Object.values(ConversationStatus).join(', ')}` });
      }
      whereClause.status = statusString;
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: { candidate: true }, // Optionally include candidate details
      orderBy: { createdAt: 'desc' } // Small improvement: sort by creation date
    });
    return res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching all conversations:", error.message, { stack: error.stack });
    return res.status(500).json({ error: "Internal server error fetching conversations", details: "An unexpected error occurred." });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { candidate: true } // Optionally include candidate details
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found", details: `Conversation with ID ${id} not found.` });
    }

    return res.status(200).json(conversation);
  } catch (error: any) {
    console.error("Error fetching conversation by ID:", error.message, { conversationId: id, stack: error.stack });
    return res.status(500).json({ error: "Internal server error fetching conversation", details: "An unexpected error occurred." });
  }
};