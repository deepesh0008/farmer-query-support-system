/**
 * Escalation Controller
 */

import escalationService from '../services/escalationService.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

export const createEscalation = async (req, res) => {
  const { queryId, category, priority, reason, fullContext } = req.body;
  const escalation = await escalationService.createEscalation({
    queryId,
    farmerId: req.user._id,
    category,
    priority,
    reason,
    fullContext,
  });
  return res.status(HTTP_STATUS.CREATED).json({ success: true, data: escalation });
};

export const listEscalations = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.assignedOfficerId) filters.assignedOfficerId = req.query.assignedOfficerId;
  if (req.query.farmerId) filters.farmerId = req.query.farmerId;

  const data = await escalationService.listEscalations({ page, limit, filters });
  return res.status(HTTP_STATUS.OK).json({ success: true, ...data });
};

export const assignOfficer = async (req, res) => {
  const escalation = await escalationService.assignOfficer(req.params.id, req.body.officerId);
  return res.status(HTTP_STATUS.OK).json({ success: true, data: escalation });
};

export const updateStatus = async (req, res) => {
  const escalation = await escalationService.updateEscalationStatus(req.params.id, req.body.status);
  return res.status(HTTP_STATUS.OK).json({ success: true, data: escalation });
};

export default {
  createEscalation,
  listEscalations,
  assignOfficer,
  updateStatus,
};
