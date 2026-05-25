/**
 * Escalate Query Route
 * Creates expert support escalation records for a farmer's farming query
 */

import express from 'express';
import { authenticateToken, farmerOnly } from '../middlewares/auth.js';
import Escalation from '../models/Escalation.js';
import Query from '../models/Query.js';
import { ESCALATION_STATUS, ESCALATION_PRIORITY } from '../config/constants.js';

const router = express.Router();

router.post('/', authenticateToken, farmerOnly, async (req, res) => {
  const { reason, expertPreference, urgencyLevel, details } = req.body;

  try {
    // Find the latest query by this farmer to attach the escalation to
    let query = await Query.findOne({ farmerId: req.user._id }).sort({ createdAt: -1 });

    // If no query exists, create a placeholder query so that Escalation model matches requirements
    if (!query) {
      query = new Query({
        farmerId: req.user._id,
        queryType: 'text',
        originalQuery: details,
        status: 'pending',
        context: {
          cropType: 'General'
        }
      });
      await query.save();
    }

    // Determine priority
    let priority = ESCALATION_PRIORITY.MEDIUM;
    if (urgencyLevel === 'critical') {
      priority = ESCALATION_PRIORITY.HIGH;
    } else if (urgencyLevel === 'general') {
      priority = ESCALATION_PRIORITY.LOW;
    }

    // Create the escalation
    const escalation = new Escalation({
      queryId: query._id,
      farmerId: req.user._id,
      category: 'other',
      priority,
      reason: reason || 'Farmer requested expert support',
      fullContext: {
        queryDetails: query.originalQuery,
        additionalNotes: details
      },
      status: ESCALATION_STATUS.OPEN,
      escalationDate: new Date()
    });

    const savedEscalation = await escalation.save();

    // Update query status to escalated
    query.status = 'escalated';
    query.escalation = {
      requiresEscalation: true,
      escalatedAt: new Date(),
      escalationReason: reason,
      escalationId: savedEscalation._id,
      status: ESCALATION_STATUS.OPEN
    };
    await query.save();

    return res.json({
      success: true,
      escalationId: savedEscalation._id,
      assignedExpert: expertPreference === 'priya' ? 'Priya Singh' : expertPreference === 'deepak' ? 'Deepak Patel' : 'Rajesh Kumar',
      expectedResponseTime: urgencyLevel === 'critical' ? '30 minutes' : urgencyLevel === 'urgent' ? '2-4 hours' : '24 hours'
    });

  } catch (error) {
    console.error('Escalation error:', error);
    return res.status(500).json({ success: false, message: 'Escalation failed: ' + error.message });
  }
});

export default router;
