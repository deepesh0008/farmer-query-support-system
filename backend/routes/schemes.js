/**
 * Scheme routes
 */

import express from 'express';
import schemeController from '../controllers/schemeController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticateToken, schemeController.listSchemes);
router.get('/search', authenticateToken, schemeController.searchSchemes);
router.get('/:id', authenticateToken, schemeController.getScheme);

export default router;
