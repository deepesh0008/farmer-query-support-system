/**
 * Media routes
 */

import express from 'express';
import multer from 'multer';
import mediaController from '../controllers/mediaController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Use multer to accept single file uploads; store on disk temporarily
const upload = multer({ dest: 'tmp/uploads/' });

// POST /api/v1/media/upload
router.post('/upload', authenticateToken, upload.single('file'), mediaController.upload);

export default router;
