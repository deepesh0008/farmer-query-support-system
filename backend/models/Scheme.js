/**
 * Scheme Model
 * Store government schemes and subsidies information
 */

import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    // Basic Information
    schemeName: {
      type: String,
      required: true,
    },

    schemeCode: {
      type: String,
      unique: true,
    },

    schemeType: {
      type: String,
      enum: ['subsidy', 'loan', 'insurance', 'grant', 'others'],
    },

    govtLevel: {
      type: String,
      enum: ['central', 'state', 'district'],
    },

    governmentDepartment: String,

    description: String,

    objectives: [String],

    // Financial Benefits
    benefits: {
      subsidy: {
        amount: Number,
        currency: {
          type: String,
          default: 'INR',
        },
        percentage: Number,
      },

      loan: {
        maxAmount: Number,
        interestRate: Number,
        moratoriumPeriod: Number,
        repaymentPeriod: Number,
      },

      interestSubvention: {
        percentage: Number,
      },

      insurance: {
        premium: Number,
        coverage: String,
        maxClaim: Number,
      },

      otherBenefits: [String],
    },

    // Eligibility Criteria
    eligibility: {
      targetBeneficiaries: [String],

      cropTypes: [String],

      cropVarieties: [String],

      states: [String],

      districts: [String],

      landSize: {
        min: Number,
        max: Number,
      },

      farmerType: [
        {
          type: String,
          enum: ['marginal', 'small', 'medium', 'large', 'all'],
        },
      ],

      annualIncome: {
        max: Number,
      },

      educationLevel: String,

      ageLimit: {
        min: Number,
        max: Number,
      },

      otherCriteria: [String],
    },

    // Duration & Timeline
    duration: {
      launchDate: Date,

      endDate: Date,

      applicableSeasons: [String],

      applicableMonths: [Number],
    },

    // Application Process
    applicationProcess: {
      mode: [
        {
          type: String,
          enum: ['online', 'offline', 'mobile-app'],
        },
      ],

      stepsToApply: [String],

      requiredDocuments: [String],

      applicationDeadline: String,

      processingTime: String,

      offlineLocation: {
        department: String,
        address: String,
        contactNumber: String,
        email: String,
      },

      onlinePortal: {
        portalName: String,
        url: String,
        supportEmail: String,
        supportPhone: String,
      },

      mobileApp: {
        appName: String,
        platform: [String],
        downloadUrl: String,
      },
    },

    // Contact Information
    contactInfo: {
      department: String,
      office: String,
      phone: String,
      email: String,
      website: String,
      address: String,
    },

    // Additional Resources
    resources: {
      guidelines: String,
      applicationForm: String,
      faqUrl: String,
      videoLink: String,
      relatedSchemes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Scheme',
        },
      ],
    },

    // Status & Management
    active: {
      type: Boolean,
      default: true,
    },

    featured: Boolean,

    // Statistics
    statistics: {
      totalApplications: {
        type: Number,
        default: 0,
      },

      approvedApplications: {
        type: Number,
        default: 0,
      },

      rejectedApplications: {
        type: Number,
        default: 0,
      },

      fundDisbursed: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    createdBy: mongoose.Schema.Types.ObjectId,

    updatedBy: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Indexes
schemeSchema.index({ schemeName: 1 });
schemeSchema.index({ govtLevel: 1 });
schemeSchema.index({ active: 1 });
schemeSchema.index({ 'eligibility.cropTypes': 1 });
schemeSchema.index({ 'eligibility.states': 1 });
schemeSchema.index({ schemeName: 'text', description: 'text', 'eligibility.otherCriteria': 'text' });

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
