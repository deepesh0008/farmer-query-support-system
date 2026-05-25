/**
 * Escalation routes
 */

import express from 'express';
import escalationController from '../controllers/escalationController.js';
import { authenticateToken, officerOnly, adminOnly, farmerOrOfficer } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, farmerOrOfficer, escalationController.createEscalation);
router.get('/', authenticateToken, officerOnly, escalationController.listEscalations);
router.patch('/:id/assign', authenticateToken, officerOnly, escalationController.assignOfficer);
router.patch('/:id/status', authenticateToken, officerOnly, escalationController.updateStatus);

export default router;
