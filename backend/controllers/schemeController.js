/**
 * Scheme Controller
 */

import schemeService from '../services/schemeService.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

export const listSchemes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filters = {};
  if (req.query.active) filters.active = req.query.active === 'true';
  if (req.query.govtLevel) filters.govtLevel = req.query.govtLevel;

  const data = await schemeService.listSchemes({ page, limit, filters });
  return res.status(HTTP_STATUS.OK).json({ success: true, ...data });
};

export const getScheme = async (req, res) => {
  const data = await schemeService.getSchemeById(req.params.id);
  if (!data) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Scheme not found' });
  }
  return res.status(HTTP_STATUS.OK).json({ success: true, data });
};

export const searchSchemes = async (req, res) => {
  const queryText = req.query.q;
  const data = await schemeService.searchSchemes({ queryText });
  return res.status(HTTP_STATUS.OK).json({ success: true, data });
};

export default {
  listSchemes,
  getScheme,
  searchSchemes,
};
