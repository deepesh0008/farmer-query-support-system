/**
 * Query Routes
 */

import express from 'express';
import queryController from '../controllers/queryController.js';
import { authenticateToken, farmerOnly, officerOnly, farmerOrOfficer } from '../middlewares/auth.js';

const router = express.Router();

// Public AI chatbot assistant
router.post('/chatbot', queryController.chatbotQuery);

// Premium Expert Chat (farmer only)
router.post('/expert-chat', authenticateToken, farmerOnly, queryController.expertChatQuery);

// Create a new query (farmer only)
router.post('/', authenticateToken, farmerOnly, queryController.createQuery);

// List queries (farmers -> own, officers/admin -> all)
router.get('/', authenticateToken, queryController.listQueries);

// Get single query
router.get('/:id', authenticateToken, queryController.getQuery);

// Add feedback to a query (farmer or officer can add)
router.post('/:id/feedback', authenticateToken, farmerOrOfficer, queryController.addFeedback);

// Escalate a query (farmer or officer)
router.post('/:id/escalate', authenticateToken, farmerOrOfficer, queryController.escalate);

export default router;
