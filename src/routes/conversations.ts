import { Router } from 'express';
import { getAllConversations, getConversationById } from '../controllers/conversationsController';

const router = Router();

// GET /conversations - Fetch all conversations, with optional status filter
router.get('/', getAllConversations);

// GET /conversations/:id - Retrieve a single conversation by its ID
router.get('/:id', getConversationById);

export default router;