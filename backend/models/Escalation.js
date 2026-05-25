/**
 * Escalation Model
 * Store escalated queries and track officer responses
 */

import mongoose from 'mongoose';
import { ESCALATION_STATUS, ESCALATION_PRIORITY } from '../config/constants.js';

const escalationSchema = new mongoose.Schema(
  {
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Query',
      required: true,
      unique: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Priority & Classification
    priority: {
      type: String,
      enum: {
        values: Object.values(ESCALATION_PRIORITY),
        message: 'Invalid priority',
      },
      default: 'medium',
    },

    category: {
      type: String,
      enum: [
        'disease-complex',
        'pest-infestation',
        'soil-issue',
        'water-issue',
        'financial',
        'legal',
        'other',
      ],
    },

    reason: String,

    // Status & Tracking
    status: {
      type: String,
      enum: {
        values: Object.values(ESCALATION_STATUS),
        message: 'Invalid status',
      },
      default: 'open',
    },

    escalationDate: {
      type: Date,
      default: Date.now,
    },

    assignedDate: Date,

    startedDate: Date,

    resolvedDate: Date,

    closedDate: Date,

    // Context
    fullContext: {
      queryDetails: mongoose.Schema.Types.Mixed,
      farmerHistory: mongoose.Schema.Types.Mixed,
      aiRecommendation: mongoose.Schema.Types.Mixed,
      additionalNotes: String,
    },

    // Officer Notes & Communication
    messages: [
      {
        messageId: mongoose.Schema.Types.ObjectId,

        senderId: mongoose.Schema.Types.ObjectId,

        senderRole: {
          type: String,
          enum: ['officer', 'farmer', 'admin'],
        },

        messageType: {
          type: String,
          enum: ['text', 'image', 'file', 'voice'],
        },

        content: String,

        attachments: [
          {
            url: String,
            type: String,
            _id: false,
          },
        ],

        readBy: [mongoose.Schema.Types.ObjectId],

        readAt: [Date],

        createdAt: {
          type: Date,
          default: Date.now,
        },

        updatedAt: Date,

        _id: false,
      },
    ],

    // Resolution Details
    resolution: {
      resolvedBy: mongoose.Schema.Types.ObjectId,

      resolution: String,

      followUpRequired: Boolean,

      followUpDate: Date,

      notes: String,

      solution: String,
    },

    // Activity Log
    activityLog: [
      {
        action: String,

        performedBy: mongoose.Schema.Types.ObjectId,

        timestamp: {
          type: Date,
          default: Date.now,
        },

        details: mongoose.Schema.Types.Mixed,

        _id: false,
      },
    ],

    // Metrics
    metrics: {
      timeToAssign: Number,

      timeToResolution: Number,

      numberOfMessages: Number,

      numberOfAttachments: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
escalationSchema.index({ assignedOfficerId: 1, status: 1 });
escalationSchema.index({ priority: 1, createdAt: -1 });
escalationSchema.index({ farmerId: 1 });
escalationSchema.index({ status: 1 });
escalationSchema.index({ escalationDate: -1 });

// Virtual for duration in hours
escalationSchema.virtual('durationHours').get(function () {
  if (!this.startedDate) return null;
  const endDate = this.resolvedDate || new Date();
  const diffMs = endDate - this.startedDate;
  return Math.round(diffMs / (1000 * 60 * 60));
});

const Escalation = mongoose.model('Escalation', escalationSchema);

export default Escalation;
