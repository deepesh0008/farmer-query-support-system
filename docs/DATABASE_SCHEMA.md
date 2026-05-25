# MongoDB Database Schema - Complete Design

## Collection: Users

### Purpose
Store user authentication and basic profile information for all user types (Farmer, Officer, Admin).

### Schema
```javascript
{
  _id: ObjectId,                          // MongoDB ID
  
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false                         // Don't return password by default
  },
  
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,                         // Allow null values
    trim: true
  },
  
  // Role & Status
  role: {
    type: String,
    enum: ['farmer', 'officer', 'admin'],
    default: 'farmer',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: null                      // URL to cloud storage
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'pa', 'ta', 'te', 'bn', 'mr', 'kn', 'ml'],
      default: 'en'
    },
    bio: String,
    dateOfBirth: Date
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: {
      type: String,
      required: true
    },
    district: String,
    village: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Verification
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: Date,
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    phoneVerifiedAt: Date,
    verificationToken: String,
    verificationTokenExpiry: Date,
    otp: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0
      },
      lastAttemptAt: Date
    }
  },
  
  // Security
  security: {
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedUntil: Date,
    lastLoginAt: Date,
    lastLoginIP: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String
  },
  
  // Activity
  activity: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    lastActivityAt: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },
  
  // Notifications & Preferences
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    queryNotifications: {
      type: Boolean,
      default: true
    },
    weatherAlerts: {
      type: Boolean,
      default: true
    },
    schemeUpdates: {
      type: Boolean,
      default: true
    },
    marketPriceAlerts: {
      type: Boolean,
      default: true
    }
  }
}
```

### Indexes
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ "verification.isEmailVerified": 1 });
db.users.createIndex({ "verification.isPhoneVerified": 1 });
```

---

## Collection: FarmerProfile

### Purpose
Store farmer-specific profile information and farm details.

### Schema
```javascript
{
  _id: ObjectId,
  
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Farm Information
  farm: {
    farmName: String,
    
    totalLandSize: {
      value: Number,                    // in hectares
      unit: {
        type: String,
        enum: ['hectares', 'acres'],
        default: 'hectares'
      }
    },
    
    soilInfo: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silty', 'mixed'],
      required: true
    },
    
    soilPH: {
      type: Number,
      min: 3,
      max: 10
    },
    
    soilFertility: {
      type: String,
      enum: ['low', 'medium', 'high', 'very-high']
    },
    
    soilLastTestDate: Date,
    soilTestReport: String,             // URL to cloud storage
    
    irrigationType: {
      type: String,
      enum: ['rainfed', 'surface', 'groundwater', 'drip', 'sprinkler', 'mixed']
    },
    
    waterSource: [String],              // Wells, borewells, canals, rivers
    waterAvailability: String,
    
    orgnicCertified: {
      type: Boolean,
      default: false
    },
    
    certificationNumber: String,
    certificationBody: String,
    certificationExpiry: Date
  },
  
  // Crops & Cultivation
  crops: [{
    cropId: ObjectId,
    cropName: {
      type: String,
      required: true
    },
    areaUnderCultivation: Number,       // in hectares
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'summer', 'perennial']
    },
    plantingDate: Date,
    expectedHarvestDate: Date,
    previousYield: {
      value: Number,
      unit: {
        type: String,
        enum: ['quintals', 'kg', 'tons']
      }
    },
    previousSellPrice: Number,           // per unit
    variety: String,
    seedSource: String,
    fertilizersUsed: [String],
    pesticidesUsed: [String],
    notes: String,
    _id: false
  }],
  
  // Agricultural Experience
  agricultural: {
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 80
    },
    
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed'],
      required: true
    },
    
    certifications: [String],           // e.g., "Organic Certification", "Farmer Training"
    
    trainingAttended: [{
      trainingName: String,
      provider: String,
      date: Date,
      certificate: String                // URL
    }],
    
    machineryOwned: [String],
    
    laborForceSize: {
      type: Number,
      default: 0
    },
    
    associatedWithCooperative: {
      type: Boolean,
      default: false
    },
    
    cooperativeDetails: {
      name: String,
      membershipNumber: String,
      joinDate: Date
    }
  },
  
  // Location & Geography
  location: {
    coordinates: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],              // [longitude, latitude]
    
    altitude: Number,
    
    rainZone: String,                   // e.g., "High Rainfall", "Medium Rainfall"
    agriClimate: String,                // e.g., "Sub-Humid", "Semi-Arid"
    
    weatherZone: String,
    climateZone: String
  },
  
  // Financial Information
  financial: {
    bankAccountHolder: String,
    bankAccountNumber: String,
    bankName: String,
    ifscCode: String,
    routingNumber: String,
    
    aadharNumber: String,               // Masked for security
    panNumber: String,
    
    hasLoanFromBank: Boolean,
    loanAmount: Number,
    loanProvider: String,
    
    businessTurnover: Number,
    annualIncome: Number
  },
  
  // Preferences
  preferences: {
    newsletterSubscribed: Boolean,
    
    preferredCommunication: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'sms'
    },
    
    bestContactTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening']
    },
    
    contentPreferences: {
      weatherAdvisory: Boolean,
      diseaseAlerts: Boolean,
      marketPrices: Boolean,
      schemeUpdates: Boolean,
      cropCalendar: Boolean
    },
    
    preferredLanguageForContent: {
      type: String,
      enum: ['en', 'hi', 'pa', 'ta', 'te', 'bn', 'mr', 'kn', 'ml']
    }
  },
  
  // Statistics
  statistics: {
    totalQueriesAsked: {
      type: Number,
      default: 0
    },
    
    totalQueriesResolved: {
      type: Number,
      default: 0
    },
    
    averageSatisfactionScore: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    
    questionsEscalated: {
      type: Number,
      default: 0
    },
    
    diseaseEncountered: [String]
  },
  
  // Activity Tracking
  activityLog: {
    lastQueryAt: Date,
    lastLoginAt: Date,
    totalLoginCount: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  deletedAt: Date
}
```

### Indexes
```javascript
db.farmerprofiles.createIndex({ userId: 1 }, { unique: true });
db.farmerprofiles.createIndex({ "location.coordinates": "2dsphere" });
db.farmerprofiles.createIndex({ createdAt: -1 });
db.farmerprofiles.createIndex({ "crops.cropName": 1 });
db.farmerprofiles.createIndex({ "farm.totalLandSize.value": 1 });
```

---

## Collection: OfficerProfile

### Purpose
Store agriculture officer profile and expertise information.

### Schema
```javascript
{
  _id: ObjectId,
  
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Department Information
  department: {
    type: String,
    required: true,
    enum: ['Agriculture', 'Horticulture', 'Animal Husbandry', 'Veterinary']
  },
  
  employeeId: String,
  
  // Assignment
  assignedRegion: {
    state: String,
    districts: [String],
    blocks: [String],
    villages: [String]
  },
  
  assignedCrops: [String],
  
  // Expertise
  expertise: {
    primaryFocus: [String],
    certifications: [String],
    yearsOfExperience: Number,
    specializations: [String],
    trainingCompleted: [{
      name: String,
      provider: String,
      date: Date,
      certificateUrl: String
    }]
  },
  
  // Contact & Work Info
  officeAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  officePhone: String,
  officeEmail: String,
  
  workingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  
  // Performance Metrics
  performance: {
    totalTicketsHandled: {
      type: Number,
      default: 0
    },
    
    averageResolutionTime: Number,     // in hours
    
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    
    totalFarmersAssigned: {
      type: Number,
      default: 0
    },
    
    escalationsResolved: {
      type: Number,
      default: 0
    }
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'away', 'offline'],
    default: 'offline'
  },
  
  lastStatusUpdate: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Indexes
```javascript
db.officerprofiles.createIndex({ userId: 1 }, { unique: true });
db.officerprofiles.createIndex({ department: 1 });
db.officerprofiles.createIndex({ "assignedRegion.state": 1 });
db.officerprofiles.createIndex({ "assignedRegion.districts": 1 });
db.officerprofiles.createIndex({ isAvailable: 1 });
```

---

## Collection: Queries

### Purpose
Store all farmer queries with context, AI responses, and metadata.

### Schema
```javascript
{
  _id: ObjectId,
  
  // Query Metadata
  farmerId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  queryType: {
    type: String,
    enum: ['text', 'voice', 'image'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['answered', 'pending', 'escalated', 'resolved', 'closed'],
    default: 'pending',
    index: true
  },
  
  // Original Query
  originalQuery: {
    type: String,
    required: true
  },
  
  // Language & Translation
  queryLanguage: {
    detectedLanguage: String,
    confidence: Number
  },
  
  translatedQuery: {
    english: String
  },
  
  // Query Context
  context: {
    cropType: {
      type: String,
      required: true,
      index: true
    },
    
    cropVariety: String,
    
    stage: {
      type: String,
      enum: ['germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'harvesting']
    },
    
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'summer', 'perennial']
    },
    
    symptomsDuration: {
      type: String,
      enum: ['1-3 days', '1-2 weeks', '2-4 weeks', '1+ months']
    },
    
    affectedAreaPercentage: Number,
    
    weatherCondition: String,
    soilCondition: String,
    previousTreatment: String,
    
    farmerId: ObjectId,
    farmerLocation: {
      state: String,
      district: String,
      village: String
    }
  },
  
  // Media Attachments
  media: {
    imageUrl: String,
    imagePublicId: String,              // Cloudinary ID
    imageMetadata: {
      uploadedAt: Date,
      size: Number,
      format: String,
      dimensions: {
        width: Number,
        height: Number
      }
    },
    
    voiceUrl: String,
    voicePublicId: String,
    transcription: String,
    transcriptionLanguage: String,
    
    imageAnalysis: {
      detectedDiseases: [String],
      confidence: Number,
      affectedArea: Number,
      symptoms: [String]
    }
  },
  
  // AI Response
  aiResponse: {
    status: {
      type: String,
      enum: ['generated', 'pending', 'failed'],
      default: 'pending'
    },
    
    primaryResponse: String,            // Main answer
    
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      index: true
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
      english: String
    },
    
    structuredResponse: {
      causeOfIssue: String,
      
      symptoms: [String],
      
      recommendedSolution: String,
      
      organicAlternatives: [{
        name: String,
        description: String,
        dosage: String,
        application: String
      }],
      
      chemicalTreatment: {
        pesticide: String,
        activeIngredient: String,
        dosage: String,
        dilutionRatio: String,
        frequency: String,
        precautions: String,
        safetyPeriod: String,
        phytotoxicity: String
      },
      
      preventiveMeasures: [String],
      
      governmentSupport: [ObjectId],    // refs to Schemes
      
      relatedDiseases: [String],
      
      referenceLinks: [String]
    },
    
    generatedAt: Date,
    modelUsed: String,                  // OpenAI/Gemini/etc
    modelVersion: String,
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number
    }
  },
  
  // Escalation
  escalation: {
    requiresEscalation: Boolean,
    escalatedAt: Date,
    escalationId: {
      type: ObjectId,
      ref: 'Escalation'
    },
    escalationReason: String,
    assignedToOfficerId: ObjectId,
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed']
    }
  },
  
  // Feedback & Rating
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    helpful: Boolean,
    
    farmerNotes: String,
    
    corrections: {
      wrongDiagnosis: Boolean,
      incorrectSolution: Boolean,
      missingInfo: Boolean,
      actualIssue: String
    },
    
    feedbackDate: Date,
    
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
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
    sharedAt: Date
  },
  
  // Activity Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  resolvedAt: Date,
  closedAt: Date
}
```

### Indexes
```javascript
db.queries.createIndex({ farmerId: 1, createdAt: -1 });
db.queries.createIndex({ status: 1, createdAt: -1 });
db.queries.createIndex({ "context.cropType": 1 });
db.queries.createIndex({ "aiResponse.confidence": 1 });
db.queries.createIndex({ "escalation.requiresEscalation": 1 });
db.queries.createIndex({ createdAt: -1 });
db.queries.createIndex({ "feedback.rating": 1 });
```

---

## Collection: Escalations

### Purpose
Store escalated queries and track officer responses.

### Schema
```javascript
{
  _id: ObjectId,
  
  queryId: {
    type: ObjectId,
    ref: 'Query',
    required: true,
    unique: true
  },
  
  farmerId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  assignedOfficerId: {
    type: ObjectId,
    ref: 'User',
    index: true
  },
  
  // Priority & Classification
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  category: {
    type: String,
    enum: ['disease-complex', 'pest-infestation', 'soil-issue', 'water-issue', 'financial', 'legal', 'other']
  },
  
  reason: String,
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'open',
    index: true
  },
  
  escalationDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  assignedDate: Date,
  startedDate: Date,
  resolvedDate: Date,
  closedDate: Date,
  
  // Context
  fullContext: {
    queryDetails: Object,
    farmerHistory: Object,
    aiRecommendation: Object,
    additionalNotes: String
  },
  
  // Officer Notes & Communication
  messages: [{
    messageId: ObjectId,
    senderId: ObjectId,
    senderRole: {
      type: String,
      enum: ['officer', 'farmer', 'admin']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice']
    },
    content: String,
    attachments: [{
      url: String,
      type: String
    }],
    readBy: [ObjectId],
    readAt: [Date],
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Resolution Details
  resolution: {
    resolvedBy: ObjectId,
    resolution: String,
    followUpRequired: Boolean,
    followUpDate: Date,
    notes: String,
    solution: String
  },
  
  // Activity Log
  activityLog: [{
    action: String,
    performedBy: ObjectId,
    timestamp: Date,
    details: Object
  }],
  
  // Metrics
  metrics: {
    timeToAssign: Number,               // in hours
    timeToResolution: Number,           // in hours
    numberOfMessages: Number,
    numberOfAttachments: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Indexes
```javascript
db.escalations.createIndex({ assignedOfficerId: 1, status: 1 });
db.escalations.createIndex({ priority: 1, createdAt: -1 });
db.escalations.createIndex({ farmerId: 1 });
db.escalations.createIndex({ status: 1 });
db.escalations.createIndex({ escalationDate: -1 });
```

---

## Collection: Schemes

### Purpose
Store government schemes and subsidies information.

### Schema
```javascript
{
  _id: ObjectId,
  
  // Basic Information
  schemeName: {
    type: String,
    required: true,
    index: true
  },
  
  schemeCode: {
    type: String,
    unique: true
  },
  
  schemeType: {
    type: String,
    enum: ['subsidy', 'loan', 'insurance', 'grant', 'others']
  },
  
  govtLevel: {
    type: String,
    enum: ['central', 'state', 'district'],
    index: true
  },
  
  governmentDepartment: String,
  
  description: String,
  
  objectives: [String],
  
  // Financial Benefits
  benefits: {
    subsidy: {
      amount: Number,
      currency: { type: String, default: 'INR' },
      percentage: Number
    },
    
    loan: {
      maxAmount: Number,
      interestRate: Number,
      moratoriumPeriod: Number,          // in months
      repaymentPeriod: Number             // in months
    },
    
    interestSubvention: {
      percentage: Number
    },
    
    insurance: {
      premium: Number,
      coverage: String,
      maxClaim: Number
    },
    
    otherBenefits: [String]
  },
  
  // Eligibility Criteria
  eligibility: {
    targetBeneficiaries: [String],      // e.g., "Small Farmers", "Marginal Farmers"
    
    cropTypes: [String],
    
    cropVarieties: [String],
    
    states: [String],
    
    districts: [String],
    
    landSize: {
      min: Number,                       // hectares
      max: Number
    },
    
    farmerType: {
      type: [String],
      enum: ['marginal', 'small', 'medium', 'large', 'all']
    },
    
    annualIncome: {
      max: Number
    },
    
    educationLevel: String,
    
    ageLimit: {
      min: Number,
      max: Number
    },
    
    otherCriteria: [String]
  },
  
  // Duration & Timeline
  duration: {
    launchDate: Date,
    endDate: Date,
    applicableSeasons: [String],
    applicableMonths: [Number]
  },
  
  // Application Process
  applicationProcess: {
    mode: {
      type: [String],
      enum: ['online', 'offline', 'mobile-app']
    },
    
    stepsToApply: [String],
    
    requiredDocuments: [String],
    
    applicationDeadline: String,
    
    processingTime: String,
    
    offlineLocation: {
      department: String,
      address: String,
      contactNumber: String,
      email: String
    },
    
    onlinePortal: {
      portalName: String,
      url: String,
      supportEmail: String,
      supportPhone: String
    },
    
    mobileApp: {
      appName: String,
      platform: [String],
      downloadUrl: String
    }
  },
  
  // Contact Information
  contactInfo: {
    department: String,
    office: String,
    phone: String,
    email: String,
    website: String,
    address: String
  },
  
  // Additional Resources
  resources: {
    guidelines: String,                 // URL
    applicationForm: String,            // URL
    faqUrl: String,
    videoLink: String,
    relatedSchemes: [ObjectId]
  },
  
  // Status & Management
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  
  featured: Boolean,
  
  // Statistics
  statistics: {
    totalApplications: Number,
    approvedApplications: Number,
    rejectedApplications: Number,
    fundDisbursed: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

### Indexes
```javascript
db.schemes.createIndex({ schemeName: 1 });
db.schemes.createIndex({ schemeCode: 1 }, { unique: true });
db.schemes.createIndex({ govtLevel: 1 });
db.schemes.createIndex({ active: 1 });
db.schemes.createIndex({ "eligibility.cropTypes": 1 });
db.schemes.createIndex({ "eligibility.states": 1 });
```

---

## Collection: Feedback

### Purpose
Store farmer feedback on AI responses for continuous learning.

### Schema
```javascript
{
  _id: ObjectId,
  
  queryId: {
    type: ObjectId,
    ref: 'Query',
    required: true,
    index: true
  },
  
  farmerId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Rating & Sentiment
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    
    clarity: {
      type: Number,
      min: 1,
      max: 5
    },
    
    actionability: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  sentiment: {
    type: String,
    enum: ['very-positive', 'positive', 'neutral', 'negative', 'very-negative']
  },
  
  // Feedback Details
  feedback: {
    wasHelpful: Boolean,
    helpful: Boolean,
    reasons: [String],
    comments: String,
    suggestions: String
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
    correctInformation: String
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
    yeildImprovement: Number
  },
  
  // Follow-up
  followUpNeeded: Boolean,
  followUpReason: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: Date
}
```

### Indexes
```javascript
db.feedback.createIndex({ queryId: 1 });
db.feedback.createIndex({ farmerId: 1, createdAt: -1 });
db.feedback.createIndex({ "rating.overall": 1 });
db.feedback.createIndex({ createdAt: -1 });
```

---

## Collection: WeatherLogs

### Purpose
Store weather data and farming-related weather advisories.

### Schema
```javascript
{
  _id: ObjectId,
  
  userId: {
    type: ObjectId,
    ref: 'User',
    index: true
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],              // [longitude, latitude]
    
    locationName: String,
    state: String,
    district: String,
    village: String
  },
  
  // Current Weather
  currentWeather: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: String,
    visibility: Number,
    description: String,
    icon: String,
    uvi: Number,
    clouds: Number
  },
  
  // Sunrise/Sunset
  times: {
    sunrise: Date,
    sunset: Date,
    moonrise: Date,
    moonset: Date,
    moonPhase: String
  },
  
  // Forecast
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: String,
    description: String,
    icon: String,
    rainProbability: Number,
    rainAmount: Number,
    snowAmount: Number,
    uvi: Number,
    clouds: Number
  }],
  
  // Farming Advisory
  farmingAdvisory: {
    advisoryText: String,
    
    pestingAdvisories: {
      disease: [String],
      pest: [String],
      recommendedAction: String,
      timing: String
    },
    
    irrigation: {
      needed: Boolean,
      frequency: String,
      quantity: String
    },
    
    fertilization: {
      needed: Boolean,
      type: String,
      timing: String
    },
    
    spraying: {
      recommended: Boolean,
      timing: String,
      precautions: String
    },
    
    harvesting: {
      readiness: String,
      timing: String,
      recommendations: String
    },
    
    alerts: [String]
  },
  
  // Data Source
  dataSource: {
    provider: String,                   // e.g., "OpenWeatherMap", "IMD"
    latitude: Number,
    longitude: Number,
    timezone: String
  },
  
  // Timestamps
  recordedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: Date
}
```

### Indexes
```javascript
db.weatherlogs.createIndex({ "location.coordinates": "2dsphere" });
db.weatherlogs.createIndex({ userId: 1, createdAt: -1 });
db.weatherlogs.createIndex({ createdAt: -1 });
db.weatherlogs.createIndex({ "location.state": 1 });
```

---

## Collection: MarketPrices

### Purpose
Store commodity prices from various mandis.

### Schema
```javascript
{
  _id: ObjectId,
  
  // Commodity
  cropName: {
    type: String,
    required: true,
    index: true
  },
  
  variety: {
    type: String,
    default: 'Mixed'
  },
  
  // Location
  state: {
    type: String,
    required: true,
    index: true
  },
  
  district: {
    type: String,
    index: true
  },
  
  mandi: {
    type: String,
    required: true,
    index: true
  },
  
  marketCode: String,
  
  // Price Information
  currentPrice: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    unit: { type: String, default: 'per quintal' }
  },
  
  priceDate: {
    type: Date,
    index: true
  },
  
  priceRange: {
    minPrice: Number,
    maxPrice: Number,
    avgPrice: Number
  },
  
  priceMovement: {
    trend: {
      type: String,
      enum: ['up', 'down', 'stable']
    },
    trendPercentage: Number,
    previousPrice: Number,
    priceChangeAmount: Number
  },
  
  // Volume & Quality
  volume: Number,
    volumeUnit: { type: String, default: 'quintals' },
  
  quality: {
    type: String,
    enum: ['grade-A', 'grade-B', 'grade-C', 'mixed']
  },
  
  arrivalQuantity: Number,
  
  // Historical Data
  historicalData: [{
    date: Date,
    price: Number,
    minPrice: Number,
    maxPrice: Number,
    volume: Number,
    _id: false
  }],
  
  // Forecast
  priceForecast: [{
    date: Date,
    expectedPrice: Number,
    confidence: Number,
    _id: false
  }],
  
  // Data Source
  dataSource: {
    provider: String,
    url: String,
    lastUpdatedBy: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Indexes
```javascript
db.marketprices.createIndex({ cropName: 1, state: 1, mandi: 1, priceDate: -1 });
db.marketprices.createIndex({ priceDate: -1 });
db.marketprices.createIndex({ cropName: 1, priceDate: -1 });
db.marketprices.createIndex({ state: 1, district: 1, mandi: 1 });
```

---

## Collection: DiseaseDetectionLogs

### Purpose
Track all disease detection operations for model improvement.

### Schema
```javascript
{
  _id: ObjectId,
  
  queryId: {
    type: ObjectId,
    ref: 'Query',
    index: true
  },
  
  farmerId: ObjectId,
  
  // Image Information
  imageUrl: String,
  imagePublicId: String,
  
  cropType: {
    type: String,
    required: true,
    index: true
  },
  
  // Detection Results
  detectionResults: [{
    detectionId: ObjectId,
    
    diseaseName: String,
    
    confidence: Number,                 // 0-100
    
    symptoms: [String],
    
    affectedArea: Number,               // percentage
    
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical']
    },
    
    treatment: {
      organic: String,
      chemical: String,
      integrated: String
    },
    
    organicAlternative: String,
    
    chemicalTreatment: String,
    
    preventiveMeasures: [String],
    
    _id: false
  }],
  
  // Model Information
  modelInfo: {
    modelVersion: String,
    modelProvider: String,              // e.g., "TensorFlow", "Custom"
    modelAccuracy: Number,
    processingTime: Number,             // milliseconds
    modelSize: String
  },
  
  // User Feedback
  userFeedback: {
    userCorrection: Boolean,
    correctionDate: Date,
    actualDisease: String,
    correctConfidenceScore: Number,
    feedback: String
  },
  
  // Accuracy Metrics
  accuracy: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}
```

### Indexes
```javascript
db.diseasedetectionlogs.createIndex({ queryId: 1 });
db.diseasedetectionlogs.createIndex({ cropType: 1, createdAt: -1 });
db.diseasedetectionlogs.createIndex({ "detectionResults.diseaseName": 1 });
db.diseasedetectionlogs.createIndex({ createdAt: -1 });
```

---

## Collection: Notifications

### Purpose
Store all user notifications.

### Schema
```javascript
{
  _id: ObjectId,
  
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['query_response', 'escalation', 'weather_alert', 'market_update', 'scheme_alert', 'system', 'message'],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  data: {
    queryId: ObjectId,
    escalationId: ObjectId,
    schemeId: ObjectId,
    relevantCrop: String,
    actionUrl: String
  },
  
  // Read Status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: Date,
  
  // Channels
  channel: {
    inApp: Boolean,
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  
  // Delivery Status
  deliveryStatus: {
    inApp: {
      type: String,
      enum: ['pending', 'delivered', 'failed']
    },
    email: {
      type: String,
      enum: ['pending', 'delivered', 'failed']
    },
    sms: {
      type: String,
      enum: ['pending', 'delivered', 'failed']
    },
    push: {
      type: String,
      enum: ['pending', 'delivered', 'failed']
    }
  },
  
  // Expiration
  expiresAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  sentAt: Date
}
```

### Indexes
```javascript
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: -1 });
```

---

## Database Configuration Best Practices

### Connection Pool
```
- Initial pool size: 10
- Maximum pool size: 100
- Connection timeout: 30 seconds
- Idle timeout: 60 seconds
```

### Backup Strategy
```
- Daily automated backups
- Weekly full backups
- Point-in-time recovery: 30 days
- Geographic redundancy
- Test restores monthly
```

### Monitoring
```
- Track query performance
- Monitor disk usage
- Alert on slow queries
- Monitor connection pool
- Track index usage
```

### Data Retention
```
- Active data: Indefinite
- Soft-deleted data: 90 days
- Logs: 30 days
- Analytics: 1 year
- Backup retention: 90 days
```

---

This comprehensive schema provides the foundation for the entire Farmer Query Support System with proper relationships, indexes, and data organization.
