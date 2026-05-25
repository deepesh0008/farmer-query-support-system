/**
 * Query Controller
 * HTTP handlers for queries
 */

import * as queryService from '../services/queryService.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

export const createQuery = async (req, res) => {
  const { originalQuery, queryType, context, media } = req.body;
  const farmerId = req.user._id;
  const created = await queryService.createQuery({ farmerId, originalQuery, queryType, context, media });
  return res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
};

export const listQueries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filters = {};

  if (req.query.status) filters.status = req.query.status;
  if (req.query.queryType) filters.queryType = req.query.queryType;
  if (req.query.farmerId) filters.farmerId = req.query.farmerId;

  // If farmer, only return own queries
  if (req.user.role === 'farmer') {
    filters.farmerId = req.user._id;
  }

  const result = await queryService.listQueries({ page, limit, filters });
  return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
};

export const getQuery = async (req, res) => {
  const { id } = req.params;
  const q = await queryService.getQueryById(id);
  if (!q) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Query not found' });

  // If farmer, ensure ownership
  if (req.user.role === 'farmer' && q.farmerId.toString() !== req.user._id.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Forbidden' });
  }

  return res.status(HTTP_STATUS.OK).json({ success: true, data: q });
};

export const addFeedback = async (req, res) => {
  const { id } = req.params;
  const feedbackObj = req.body;
  const updated = await queryService.addFeedback(id, feedbackObj);
  return res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
};

export const escalate = async (req, res) => {
  const { id } = req.params;
  const escalationData = req.body;
  const updated = await queryService.escalateQuery(id, escalationData);
  return res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
};

export const chatbotQuery = async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message parameter is required' });
  }
  const reply = await queryService.chatbotQuery({ message, history });
  return res.status(HTTP_STATUS.OK).json({ success: true, reply });
};

export default {
  createQuery,
  listQueries,
  getQuery,
  addFeedback,
  escalate,
  chatbotQuery,
};
