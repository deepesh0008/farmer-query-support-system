/**
 * Response Model
 * Store officer and AI responses to farmer queries
 */

import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Query',
      required: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    responseType: {
      type: String,
      enum: ['ai', 'officer'],
    },

    message: {
      type: String,
      required: true,
    },

    multilingualResponse: {
      hindi: String,
      english: String,
      punjabi: String,
      tamil: String,
      telugu: String,
      bengali: String,
      marathi: String,
      kannada: String,
      malayalam: String,
    },

    attachments: [
      {
        type: {
          type: String,
          enum: ['video', 'pdf', 'image', 'link'],
        },
        url: String,
        title: String,
        description: String,
        _id: false,
      },
    ],

    voiceResponse: {
      url: String,
      language: String,
      duration: Number,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    helpful: Boolean,

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
responseSchema.index({ queryId: 1 });
responseSchema.index({ responderId: 1 });
responseSchema.index({ farmerId: 1 });

const Response = mongoose.model('Response', responseSchema);

export default Response;
