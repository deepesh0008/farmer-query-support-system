/**
 * Query Model
 * Store all farmer queries with context, AI responses, and metadata
 */

import mongoose from 'mongoose';
import { QUERY_TYPES, QUERY_STATUS, SEASONS } from '../config/constants.js';

const querySchema = new mongoose.Schema(
  {
    // Query Metadata
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    queryType: {
      type: String,
      enum: {
        values: Object.values(QUERY_TYPES),
        message: 'Invalid query type',
      },
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(QUERY_STATUS),
        message: 'Invalid status',
      },
      default: 'pending',
    },

    // Original Query
    originalQuery: {
      type: String,
      required: true,
    },

    // Language & Translation
    queryLanguage: {
      detectedLanguage: String,
      confidence: Number,
    },

    translatedQuery: {
      english: String,
    },

    // Query Context
    context: {
      cropType: {
        type: String,
        required: true,
      },

      cropVariety: String,

      stage: {
        type: String,
        enum: [
          'germination',
          'seedling',
          'vegetative',
          'flowering',
          'fruiting',
          'harvesting',
        ],
      },

      season: {
        type: String,
        enum: Object.values(SEASONS),
      },

      symptomsDuration: {
        type: String,
        enum: ['1-3 days', '1-2 weeks', '2-4 weeks', '1+ months'],
      },

      affectedAreaPercentage: Number,

      weatherCondition: String,

      soilCondition: String,

      previousTreatment: String,

      farmerLocation: {
        state: String,
        district: String,
        village: String,
      },
    },

    // Media Attachments
    media: {
      imageUrl: String,

      imagePublicId: String,

      imageMetadata: {
        uploadedAt: Date,
        size: Number,
        format: String,
        dimensions: {
          width: Number,
          height: Number,
        },
      },

      voiceUrl: String,

      voicePublicId: String,

      transcription: String,

      transcriptionLanguage: String,

      imageAnalysis: {
        detectedDiseases: [String],
        confidence: Number,
        affectedArea: Number,
        symptoms: [String],
      },
    },

    // AI Response
    aiResponse: {
      status: {
        type: String,
        enum: ['generated', 'pending', 'failed'],
        default: 'pending',
      },

      primaryResponse: String,

      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },

      multilingualResponse: {
        hindi: String,
        punjabi: String,
        tamil: String,
        telugu: String,
        bengali: String,
        marathi: String,
        kannada: String,
        malayalam: String,
        english: String,
      },

      structuredResponse: {
        causeOfIssue: String,
        symptoms: [String],
        recommendedSolution: String,
        organicAlternatives: [
          {
            name: String,
            description: String,
            dosage: String,
            application: String,
          },
        ],
        chemicalTreatment: {
          pesticide: String,
          activeIngredient: String,
          dosage: String,
          dilutionRatio: String,
          frequency: String,
          precautions: String,
          safetyPeriod: String,
          phytotoxicity: String,
        },
        preventiveMeasures: [String],
        governmentSupport: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scheme',
          },
        ],
        relatedDiseases: [String],
        referenceLinks: [String],
      },

      generatedAt: Date,

      modelUsed: String,

      modelVersion: String,

      tokens: {
        prompt: Number,
        completion: Number,
        total: Number,
      },
    },

    // Escalation
    escalation: {
      requiresEscalation: Boolean,

      escalatedAt: Date,

      escalationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escalation',
      },

      escalationReason: String,

      assignedToOfficerId: mongoose.Schema.Types.ObjectId,

      status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
      },
    },

    // Feedback & Rating
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },

      helpful: Boolean,

      farmerNotes: String,

      corrections: {
        wrongDiagnosis: Boolean,
        incorrectSolution: Boolean,
        missingInfo: Boolean,
        actualIssue: String,
      },

      feedbackDate: Date,

      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
      },
    },

    // Engagement
    engagement: {
      viewed: Boolean,

      viewedAt: Date,

      opened: Boolean,

      openedAt: Date,

      responded: Boolean,

      respondedAt: Date,

      shared: Boolean,

      sharedAt: Date,
    },

    // Activity Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: Date,

    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
querySchema.index({ farmerId: 1, createdAt: -1 });
querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ 'context.cropType': 1 });
querySchema.index({ 'aiResponse.confidence': 1 });
querySchema.index({ 'escalation.requiresEscalation': 1 });
querySchema.index({ 'feedback.rating': 1 });
querySchema.index({ createdAt: -1 });

const Query = mongoose.model('Query', querySchema);

export default Query;
