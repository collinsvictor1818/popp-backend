import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getAllConversations = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    const conversations = await prisma.conversation.findMany({
      where: status ? { status: String(status) } : undefined,
      include: { candidate: true }, // Optionally include candidate details
      orderBy: { createdAt: 'desc' } // Small improvement: sort by creation date
    });
    return res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching all conversations:", error.message);
    return res.status(500).json({ error: "Internal server error fetching conversations" });
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
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json(conversation);
  } catch (error: any) {
    console.error("Error fetching conversation by ID:", error.message);
    return res.status(500).json({ error: "Internal server error fetching conversation" });
  }
};