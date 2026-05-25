/**
 * Market routes
 */

import express from 'express';
import marketController from '../controllers/marketController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/prices', authenticateToken, marketController.getPrices);

export default router;
