/**
 * Market Controller
 */

import marketService from '../services/marketService.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

export const getPrices = async (req, res) => {
  const { crop, state, market } = req.query;
  const data = await marketService.getMarketPrices({ crop, state, market });
  return res.status(HTTP_STATUS.OK).json({ success: true, data });
};

export default {
  getPrices,
};
