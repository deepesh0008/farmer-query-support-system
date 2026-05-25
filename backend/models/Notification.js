/**
 * Notification Model
 * Store all user notifications
 */

import mongoose from 'mongoose';
import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: 'Invalid notification type',
      },
      required: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    data: {
      queryId: mongoose.Schema.Types.ObjectId,
      escalationId: mongoose.Schema.Types.ObjectId,
      schemeId: mongoose.Schema.Types.ObjectId,
      relevantCrop: String,
      actionUrl: String,
    },

    // Read Status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: Date,

    // Channels
    channel: {
      inApp: Boolean,
      email: Boolean,
      sms: Boolean,
      push: Boolean,
    },

    // Delivery Status
    deliveryStatus: {
      inApp: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
      },
      email: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
      },
      sms: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
      },
      push: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
      },
    },

    // Expiration
    expiresAt: Date,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    sentAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete expired notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
