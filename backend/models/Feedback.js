/**
 * Feedback Model
 * Store farmer feedback on AI responses for continuous learning
 */

import mongoose from 'mongoose';
import { FEEDBACK_SENTIMENTS } from '../config/constants.js';

const feedbackSchema = new mongoose.Schema(
  {
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Query',
      required: true,
      index: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Rating & Sentiment
    rating: {
      overall: {
        type: Number,
        min: 1,
        max: 5,
      },

      accuracy: {
        type: Number,
        min: 1,
        max: 5,
      },

      clarity: {
        type: Number,
        min: 1,
        max: 5,
      },

      actionability: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    sentiment: {
      type: String,
      enum: {
        values: Object.values(FEEDBACK_SENTIMENTS),
        message: 'Invalid sentiment',
      },
    },

    // Feedback Details
    feedback: {
      wasHelpful: Boolean,

      helpful: Boolean,

      reasons: [String],

      comments: String,

      suggestions: String,
    },

    // Corrections & Improvements
    corrections: {
      mislabeledDisease: Boolean,

      incorrectSolution: Boolean,

      missingInformation: Boolean,

      incorrectDosage: Boolean,

      wrongSeason: Boolean,

      otherError: Boolean,

      errorDescription: String,

      correctInformation: String,
    },

    // Implementation Result
    implementation: {
      applied: Boolean,

      appliedDate: Date,

      resultObserved: Boolean,

      resultDate: Date,

      resultDescription: String,

      success: Boolean,

      costInvolved: Number,

      yieldImprovement: Number,
    },

    // Follow-up
    followUpNeeded: Boolean,

    followUpReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
feedbackSchema.index({ queryId: 1 });
feedbackSchema.index({ farmerId: 1, createdAt: -1 });
feedbackSchema.index({ 'rating.overall': 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
