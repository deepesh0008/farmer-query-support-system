/**
 * Weather routes
 */

import express from 'express';
import weatherController from '../controllers/weatherController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/current', authenticateToken, weatherController.currentWeather);
router.get('/forecast', authenticateToken, weatherController.weatherForecast);
router.post('/advisory', authenticateToken, weatherController.weatherAdvisory);

export default router;
