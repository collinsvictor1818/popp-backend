import { Router } from 'express';
import { handleApplicationWebhook } from '../controllers/webhookController';

const router = Router();

// POST /webhook/application - Handles incoming job application events
router.post('/application', handleApplicationWebhook);

export default router;