import { Request, Response } from "express";
import prisma from "../prismaClient";

export async function listConversations(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const where: any = {};
  if (status) where.status = status;
  const convos = await prisma.conversation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { candidate: true }
  });
  res.json(convos);
}

export async function getConversation(req: Request, res: Response) {
  const { id } = req.params;
  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: { candidate: true }
  });
  if (!convo) return res.status(404).json({ error: "Not found" });
  res.json(convo);
}
