import { Router } from "express";
import { webhookApplications } from "../controllers/webhookController";

const router = Router();
router.post("/webhook/applications", webhookApplications);
export default router;
