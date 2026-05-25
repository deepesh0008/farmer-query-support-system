/**
 * Escalation service
 */

import Escalation from '../models/Escalation.js';
import Query from '../models/Query.js';
import { ESCALATION_STATUS } from '../config/constants.js';

export const createEscalation = async ({ queryId, farmerId, category, priority, reason, fullContext }) => {
  const existing = await Escalation.findOne({ queryId });
  if (existing) return existing;

  const escalation = new Escalation({
    queryId,
    farmerId,
    category,
    priority,
    reason,
    fullContext,
    status: ESCALATION_STATUS.OPEN,
    escalationDate: new Date(),
  });
  const saved = await escalation.save();
  await Query.findByIdAndUpdate(queryId, {
    status: 'escalated',
    'escalation.requiresEscalation': true,
    'escalation.escalatedAt': new Date(),
    'escalation.escalationReason': reason,
    'escalation.escalationId': saved._id,
    'escalation.status': ESCALATION_STATUS.OPEN,
  });
  return saved;
};

export const listEscalations = async ({ page = 1, limit = 20, filters = {} }) => {
  const skip = (page - 1) * limit;
  const query = Escalation.find(filters).sort({ escalationDate: -1 }).skip(skip).limit(limit);
  const [items, total] = await Promise.all([query.exec(), Escalation.countDocuments(filters).exec()]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const assignOfficer = async (escalationId, officerId) => {
  const escalation = await Escalation.findById(escalationId);
  if (!escalation) throw new Error('Escalation not found');
  escalation.assignedOfficerId = officerId;
  escalation.status = ESCALATION_STATUS.ASSIGNED;
  escalation.assignedDate = new Date();
  await escalation.save();
  await Query.findByIdAndUpdate(escalation.queryId, {
    'escalation.assignedToOfficerId': officerId,
    'escalation.status': ESCALATION_STATUS.ASSIGNED,
    status: 'escalated',
  });
  return escalation;
};

export const updateEscalationStatus = async (escalationId, status) => {
  const escalation = await Escalation.findById(escalationId);
  if (!escalation) throw new Error('Escalation not found');
  escalation.status = status;
  if (status === ESCALATION_STATUS.RESOLVED) escalation.resolvedDate = new Date();
  if (status === ESCALATION_STATUS.CLOSED) escalation.closedDate = new Date();
  await escalation.save();
  await Query.findByIdAndUpdate(escalation.queryId, {
    'escalation.status': status,
    status: status === ESCALATION_STATUS.RESOLVED ? 'resolved' : escalation.status === ESCALATION_STATUS.CLOSED ? 'closed' : 'escalated',
  });
  return escalation;
};

export default {
  createEscalation,
  listEscalations,
  assignOfficer,
  updateEscalationStatus,
};
