import { Router } from "express";
import { listConversations, getConversation } from "../controllers/conversationsController";

const router = Router();
router.get("/", listConversations);
router.get("/:id", getConversation);
export default router;
