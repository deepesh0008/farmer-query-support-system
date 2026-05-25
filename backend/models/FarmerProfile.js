/**
 * FarmerProfile Model
 * Farmer-specific profile information and farm details
 */

import mongoose from 'mongoose';
import {
  SEASONS,
  SOIL_TYPES,
  FARMING_TYPES,
} from '../config/constants.js';

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Farm Information
    farm: {
      farmName: String,

      totalLandSize: {
        value: {
          type: Number,
          min: 0.1,
          max: 1000,
        },
        unit: {
          type: String,
          enum: ['hectares', 'acres'],
          default: 'hectares',
        },
      },

      soilInfo: {
        type: String,
        enum: {
          values: Object.values(SOIL_TYPES),
          message: 'Invalid soil type',
        },
        required: true,
      },

      soilPH: {
        type: Number,
        min: 3,
        max: 10,
      },

      soilFertility: {
        type: String,
        enum: ['low', 'medium', 'high', 'very-high'],
      },

      soilLastTestDate: Date,

      soilTestReport: String,

      irrigationType: {
        type: String,
        enum: [
          'rainfed',
          'surface',
          'groundwater',
          'drip',
          'sprinkler',
          'mixed',
        ],
      },

      waterSource: [String],

      waterAvailability: String,

      organicCertified: {
        type: Boolean,
        default: false,
      },

      certificationNumber: String,

      certificationBody: String,

      certificationExpiry: Date,
    },

    // Crops & Cultivation
    crops: [
      {
        cropName: {
          type: String,
          required: true,
        },

        areaUnderCultivation: Number,

        season: {
          type: String,
          enum: {
            values: Object.values(SEASONS),
            message: 'Invalid season',
          },
        },

        plantingDate: Date,

        expectedHarvestDate: Date,

        previousYield: {
          value: Number,
          unit: {
            type: String,
            enum: ['quintals', 'kg', 'tons'],
          },
        },

        previousSellPrice: Number,

        variety: String,

        seedSource: String,

        fertilizersUsed: [String],

        pesticidesUsed: [String],

        notes: String,

        _id: false,
      },
    ],

    // Agricultural Experience
    agricultural: {
      yearsOfExperience: {
        type: Number,
        min: 0,
        max: 80,
      },

      farmingType: {
        type: String,
        enum: {
          values: Object.values(FARMING_TYPES),
          message: 'Invalid farming type',
        },
        required: true,
      },

      certifications: [String],

      trainingAttended: [
        {
          trainingName: String,
          provider: String,
          date: Date,
          certificate: String,
          _id: false,
        },
      ],

      machineryOwned: [String],

      laborForceSize: {
        type: Number,
        default: 0,
      },

      associatedWithCooperative: {
        type: Boolean,
        default: false,
      },

      cooperativeDetails: {
        name: String,
        membershipNumber: String,
        joinDate: Date,
        _id: false,
      },
    },

    // Location & Geography
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
      },

      altitude: Number,

      rainZone: String,

      agriClimate: String,

      weatherZone: String,

      climateZone: String,
    },

    // Financial Information
    financial: {
      bankAccountHolder: String,

      bankAccountNumber: String,

      bankName: String,

      ifscCode: String,

      routingNumber: String,

      aadharNumber: String,

      panNumber: String,

      hasLoanFromBank: Boolean,

      loanAmount: Number,

      loanProvider: String,

      businessTurnover: Number,

      annualIncome: Number,
    },

    // Preferences
    preferences: {
      newsletterSubscribed: Boolean,

      preferredCommunication: {
        type: String,
        enum: ['email', 'sms', 'both'],
        default: 'sms',
      },

      bestContactTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
      },

      contentPreferences: {
        weatherAdvisory: Boolean,
        diseaseAlerts: Boolean,
        marketPrices: Boolean,
        schemeUpdates: Boolean,
        cropCalendar: Boolean,
      },

      preferredLanguageForContent: {
        type: String,
        enum: [
          'en',
          'hi',
          'pa',
          'ta',
          'te',
          'bn',
          'mr',
          'kn',
          'ml',
        ],
      },
    },

    // Statistics
    statistics: {
      totalQueriesAsked: {
        type: Number,
        default: 0,
      },

      totalQueriesResolved: {
        type: Number,
        default: 0,
      },

      averageSatisfactionScore: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      questionsEscalated: {
        type: Number,
        default: 0,
      },

      diseaseEncountered: [String],
    },

    // Activity Tracking
    activityLog: {
      lastQueryAt: Date,

      lastLoginAt: Date,

      totalLoginCount: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
farmerProfileSchema.index({ 'location.coordinates': '2dsphere' });
farmerProfileSchema.index({ createdAt: -1 });
farmerProfileSchema.index({ 'crops.cropName': 1 });
farmerProfileSchema.index({ 'farm.totalLandSize.value': 1 });

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);

export default FarmerProfile;
