# AI-Based Farmer Query Support and Advisory System - Complete Architecture

## Table of Contents
1. Project Overview
2. System Architecture
3. Technology Stack
4. Database Design
5. API Architecture
6. Frontend Architecture
7. Security Architecture
8. Deployment Strategy
9. Scalability Considerations

---

## 1. PROJECT OVERVIEW

### Vision
"Digital Krishi Officer" - An AI-powered agricultural advisory platform providing real-time expert guidance to farmers through multiple interaction channels (text, voice, image).

### Core Value Proposition
- **Instant Expert Guidance** - 24/7 availability
- **Local Language Support** - 9 Indian languages
- **Context-Aware Recommendations** - Location, season, crop-specific
- **Multi-Modal Input** - Text, voice, image uploads
- **Human Escalation** - Agriculture officers for complex issues

---

## 2. SYSTEM ARCHITECTURE

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Browser │  │ Mobile  │  │ PWA     │  │ Voice   │        │
│  │ (HTML)  │  │ Responsive  │ Support │  │ Support │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │             │            │            │            │
│       └─────────────┼────────────┼────────────┘            │
│                     │ HTTPS API  │                         │
└─────────────────────┼────────────┼───────────────────────────┘
                      │            │
┌─────────────────────┴────────────┴───────────────────────────┐
│                    API GATEWAY / LOAD BALANCER               │
└─────────────────────┬──────────────────────────────────────┬─┘
                      │                                      │
┌─────────────────────▼─────────────────────────────────────┐ │
│                   BACKEND LAYER (Node.js + Express)       │ │
│                                                           │ │
│  ┌────────────────────────────────────────────────────┐  │ │
│  │              Authentication Service                │  │ │
│  │  - JWT Token Generation/Validation                │  │ │
│  │  - Role-Based Access Control (RBAC)               │  │ │
│  │  - OTP Management                                 │  │ │
│  └────────────────────────────────────────────────────┘  │ │
│                                                           │ │
│  ┌────────────────────────────────────────────────────┐  │ │
│  │            Query Processing Service                │  │ │
│  │  - Text Query Handler                             │  │ │
│  │  - Voice to Text Conversion                       │  │ │
│  │  - Image Processing & OCR                         │  │ │
│  │  - Context Enrichment                             │  │ │
│  └────────────────────────────────────────────────────┘  │ │
│                                                           │ │
│  ┌────────────────────────────────────────────────────┐  │ │
│  │             AI Engine Service                      │  │ │
│  │  - OpenAI/Gemini Integration                      │  │ │
│  │  - Disease Detection ML Model                     │  │ │
│  │  - Recommendation Engine                          │  │ │
│  │  - Confidence Scoring & Validation                │  │ │
│  └────────────────────────────────────────────────────┘  │ │
│                                                           │ │
│  ┌────────────────────────────────────────────────────┐  │ │
│  │         External Integration Services             │  │ │
│  │  - Weather API Integration                        │  │ │
│  │  - Market Price APIs                              │  │ │
│  │  - Translation Services (Google Translate)        │  │ │
│  │  - Geocoding & Location Services                  │  │ │
│  └────────────────────────────────────────────────────┘  │ │
│                                                           │ │
│  ┌────────────────────────────────────────────────────┐  │ │
│  │        Escalation & Support Service               │  │ │
│  │  - Escalation Logic & Routing                     │  │ │
│  │  - Real-time Chat (Socket.io)                     │  │ │
│  │  - Notification Service                           │  │ │
│  └────────────────────────────────────────────────────┘  │ │
│                                                           │ │
└───────────────────────┬───────────────────────────────────┘ │
                        │                                      │
┌───────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   MongoDB Atlas  │  │   Redis Cache    │                │
│  │                  │  │  (Session/Cache) │                │
│  │  - Collections   │  │                  │                │
│  │  - Indexes       │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                        │                      │
            ┌───────────┴──────────────────────┴─────────┐
            │                                            │
┌───────────▼───────────────┐      ┌───────────────────▼──┐
│  External Services        │      │  Monitoring &      │
│                           │      │  Analytics         │
│ - OpenAI/Gemini API      │      │                    │
│ - OpenWeather API         │      │ - Application      │
│ - Google Maps API         │      │   Performance      │
│ - Translation API         │      │ - Error Tracking   │
│ - Mandi Price Feeds      │      │ - User Analytics   │
└───────────────────────────┘      └────────────────────┘
```

### Microservices Architecture (Future Scalability)
```
┌─────────────────────────────────────────────────────────┐
│  Auth Service      │  Query Service     │  AI Service    │
│  (Port 3001)       │  (Port 3002)       │  (Port 3003)   │
└─────────────────────────────────────────────────────────┘
         │                    │                   │
         └────────────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Message Queue   │
                    │   (RabbitMQ/      │
                    │    Kafka)         │
                    └───────────────────┘
```

---

## 3. TECHNOLOGY STACK

### Frontend
- **Framework**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Custom CSS with grid/flexbox + Tailwind CSS
- **APIs**:
  - Web Speech API (Voice input/output)
  - Geolocation API
  - Camera API (Image capture)
  - Service Workers (PWA)
  - IndexedDB (Offline storage)

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Language**: JavaScript (ES6+)
- **Task Queue**: Bull (for async processing)
- **Real-time**: Socket.io (for chat and notifications)

### Database
- **Primary**: MongoDB Atlas
- **Caching**: Redis (Session, rate limiting, cache)
- **Search**: MongoDB Full-Text Search

### AI/ML
- **Primary API**: OpenAI GPT-4 / Google Gemini
- **Image Processing**: TensorFlow.js / Tesseract.js (OCR)
- **Disease Detection**: Custom ML model / Teachable Machine
- **NLP**: Natural language processing library

### External APIs
- **Weather**: OpenWeatherMap API
- **Geocoding**: Google Maps API
- **Market Prices**: AGMARKNET/Mandi API
- **Translation**: Google Translate API
- **SMS/Email**: Twilio / SendGrid

### Security
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Security**: Helmet, Express-rate-limit
- **CORS**: Cross-Origin Resource Sharing enabled
- **Input Validation**: Joi / express-validator

### DevOps & Deployment
- **Version Control**: Git / GitHub
- **Frontend Hosting**: Vercel / Netlify
- **Backend Hosting**: Render / Railway
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare
- **Monitoring**: Sentry, LogRocket
- **CI/CD**: GitHub Actions

---

## 4. DATABASE DESIGN

### MongoDB Collections

#### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  role: Enum ["farmer", "officer", "admin"],
  profile: {
    firstName: String,
    lastName: String,
    profilePic: String,
    language: String,
    state: String,
    district: String,
    village: String,
    createdAt: Date,
    updatedAt: Date
  },
  authentication: {
    isEmailVerified: Boolean,
    isPhoneVerified: Boolean,
    otpCode: String,
    otpExpiry: Date,
    lastLoginAt: Date,
    loginAttempts: Number,
    isLocked: Boolean,
    lockedUntil: Date
  },
  status: Enum ["active", "inactive", "suspended"],
  indexes: [email, phoneNumber, role]
}
```

#### FarmerProfile Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  farm: {
    totalLandSize: Number, // in hectares
    soilType: String,
    soilPH: Number,
    soilFertility: String,
    irrigationType: String,
    waterSource: String,
    crops: [{
      cropName: String,
      areaUnder: Number,
      season: String,
      plantingDate: Date,
      expectedHarvestDate: Date,
      previousYield: Number
    }]
  },
  agricultural: {
    experience: Number, // in years
    certifications: [String],
    farmingType: Enum ["organic", "conventional", "mixed"],
    machineryOwned: [String],
    laborForceSize: Number
  },
  location: {
    latitude: Number,
    longitude: Number,
    altitude: Number,
    rainZone: String,
    agriClimate: String
  },
  preferences: {
    newsLetterSubscribed: Boolean,
    preferredCommunication: String,
    bestContactTime: String
  },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    routingNumber: String
  },
  indexes: [userId]
}
```

#### Query Collection
```javascript
{
  _id: ObjectId,
  farmerId: ObjectId (ref: User),
  queryType: Enum ["text", "voice", "image"],
  originalQuery: String,
  queryTranslation: {
    detectedLanguage: String,
    translatedToEnglish: String,
    confidence: Number
  },
  context: {
    cropType: String,
    season: String,
    stageOfCrop: String,
    symptomsDuration: String,
    weatherCondition: String,
    soilCondition: String,
    previousTreatment: String
  },
  media: {
    imageUrl: String,
    imagePublicId: String, // Cloudinary
    voiceUrl: String,
    transcription: String,
    imageAnalysis: {
      detectedDiseases: [String],
      confidence: Number,
      affectedArea: Number
    }
  },
  aiResponse: {
    primaryResponse: String,
    multilingualResponse: {
      hindi: String,
      punjabi: String,
      tamil: String,
      // ... other languages
    },
    structuredResponse: {
      causeOfIssue: String,
      symptoms: [String],
      recommendedSolution: String,
      organicAlternatives: [String],
      chemicalTreatment: {
        pesticide: String,
        dosage: String,
        frequency: String,
        precautions: String,
        safetyPeriod: String
      },
      preventiveMeasures: [String],
      governmentSupport: [ObjectId] // refs to Schemes
    },
    confidenceScore: Number,
    requiresEscalation: Boolean
  },
  escalation: {
    escalatedAt: Date,
    escalatedToOfficerId: ObjectId,
    reason: String,
    status: Enum ["pending", "assigned", "resolved", "closed"]
  },
  feedback: {
    rating: Number, // 1-5
    helpful: Boolean,
    farmerNotes: String,
    corrections: String,
    feedbackDate: Date
  },
  status: Enum ["answered", "pending", "escalated", "resolved"],
  createdAt: Date,
  updatedAt: Date,
  indexes: [farmerId, createdAt, status, cropType]
}
```

#### Response Collection
```javascript
{
  _id: ObjectId,
  queryId: ObjectId (ref: Query),
  farmerId: ObjectId,
  responderId: ObjectId, // Officer or AI system
  responseType: Enum ["ai", "officer"],
  message: String,
  multilingualResponse: {
    hindi: String,
    english: String,
    // ... other languages
  },
  attachments: [{
    type: Enum ["video", "pdf", "image", "link"],
    url: String,
    title: String,
    description: String
  }],
  voiceResponse: {
    url: String,
    language: String
  },
  createdAt: Date,
  indexes: [queryId, responderId]
}
```

#### Escalation Collection
```javascript
{
  _id: ObjectId,
  queryId: ObjectId (ref: Query),
  farmerId: ObjectId,
  assignedOfficerId: ObjectId,
  priority: Enum ["low", "medium", "high", "urgent"],
  reason: String,
  fullContext: {
    queryDetails: Object,
    farmerHistory: Object,
    aiRecommendation: Object,
    additionalNotes: String
  },
  status: Enum ["open", "in_progress", "resolved", "closed"],
  notes: [{
    officerId: ObjectId,
    message: String,
    timestamp: Date
  }],
  resolutionDetails: {
    resolvedAt: Date,
    resolution: String,
    followUpRequired: Boolean,
    followUpDate: Date
  },
  createdAt: Date,
  updatedAt: Date,
  indexes: [assignedOfficerId, status, priority, createdAt]
}
```

#### Scheme Collection
```javascript
{
  _id: ObjectId,
  schemeName: String,
  schemeCode: String,
  govtLevel: Enum ["central", "state"],
  description: String,
  benefits: {
    subsidy: Number,
    loanAmount: Number,
    interestSubvention: Number,
    insuranceCoverage: String
  },
  eligibility: {
    cropTypes: [String],
    states: [String],
    farmerType: [String],
    minLandSize: Number,
    maxLandSize: Number,
    income: String
  },
  duration: {
    launchDate: Date,
    endDate: Date,
    applicableSeasons: [String]
  },
  applicationProcess: {
    stepsToApply: [String],
    requiredDocuments: [String],
    offlineLocation: String,
    onlinePortal: String
  },
  contactInfo: {
    department: String,
    phone: String,
    email: String,
    website: String
  },
  active: Boolean,
  indexes: [schemeName, govtLevel, cropTypes, states]
}
```

#### Feedback Collection
```javascript
{
  _id: ObjectId,
  queryId: ObjectId (ref: Query),
  farmerId: ObjectId,
  rating: Number, // 1-5
  feedback: {
    wasHelpful: Boolean,
    accuracyRating: Number, // 1-5
    clarityRating: Number, // 1-5
    actionabilityRating: Number, // 1-5
    comments: String
  },
  corrections: {
    mislabeledDisease: Boolean,
    incorrectSolution: Boolean,
    missingInfo: Boolean,
    correctInformation: String
  },
  sentiment: Enum ["positive", "neutral", "negative"],
  createdAt: Date,
  indexes: [queryId, farmerId, createdAt]
}
```

#### WeatherLog Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  location: {
    coordinates: {
      type: String, // "Point"
      coordinates: [Number] // [longitude, latitude]
    },
    city: String,
    state: String
  },
  currentWeather: {
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: String,
    description: String,
    icon: String,
    sunrise: Date,
    sunset: Date
  },
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    description: String,
    rainProbability: Number,
    rainAmount: Number
  }],
  farmingAdvisory: String,
  createdAt: Date,
  indexes: [userId, createdAt, "location.coordinates"]
}
```

#### MarketPrice Collection
```javascript
{
  _id: ObjectId,
  cropName: String,
  variety: String,
  state: String,
  district: String,
  mandi: String,
  currentPrice: Number,
  priceUnit: String, // "per_quintal"
  priceDate: Date,
  priceRange: {
    minPrice: Number,
    maxPrice: Number,
    avgPrice: Number
  },
  trend: Enum ["up", "down", "stable"],
  trendPercentage: Number,
  volume: Number,
  quality: String,
  historicalData: [{
    date: Date,
    price: Number,
    volume: Number
  }],
  createdAt: Date,
  updatedAt: Date,
  indexes: [cropName, state, district, mandi, priceDate]
}
```

#### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: Enum ["query_response", "escalation", "weather_alert", "market_update", "scheme_alert", "system"],
  title: String,
  message: String,
  data: {
    queryId: ObjectId,
    escalationId: ObjectId,
    relevantCrop: String
  },
  read: Boolean,
  readAt: Date,
  channel: [Enum ["in_app", "email", "sms", "push"]],
  createdAt: Date,
  indexes: [userId, read, createdAt]
}
```

#### DiseaseDetectionLog Collection
```javascript
{
  _id: ObjectId,
  queryId: ObjectId,
  imageUrl: String,
  cropType: String,
  detectionResults: [{
    diseaseName: String,
    confidence: Number,
    symptoms: [String],
    treatment: String,
    organicAlternative: String,
    chemicalTreatment: String
  }],
  modelVersion: String,
  processingTime: Number, // in milliseconds
  accuracy: Number,
  userCorrection: Boolean,
  actualDisease: String,
  createdAt: Date,
  indexes: [cropType, createdAt]
}
```

#### Admin Analytics Collection
```javascript
{
  _id: ObjectId,
  date: Date,
  metrics: {
    totalUsers: Number,
    activeUsers: Number,
    totalQueries: Number,
    escalatedQueries: Number,
    averageResolutionTime: Number,
    aiAccuracyScore: Number,
    userSatisfactionScore: Number,
    topDiseases: [{
      disease: String,
      count: Number
    }],
    topCrops: [{
      crop: String,
      count: Number
    }],
    topStates: [{
      state: String,
      count: Number
    }]
  },
  indexes: [date]
}
```

### Database Indexing Strategy
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 });
db.users.createIndex({ role: 1 });

// Queries
db.queries.createIndex({ farmerId: 1, createdAt: -1 });
db.queries.createIndex({ status: 1 });
db.queries.createIndex({ cropType: 1 });
db.queries.createIndex({ aiResponse.confidenceScore: 1 });
db.queries.createIndex({ aiResponse.requiresEscalation: 1 });

// Escalations
db.escalations.createIndex({ assignedOfficerId: 1, status: 1 });
db.escalations.createIndex({ priority: 1, createdAt: -1 });
db.escalations.createIndex({ farmerId: 1 });

// Market Prices
db.marketPrices.createIndex({ cropName: 1, state: 1, mandi: 1 });
db.marketPrices.createIndex({ priceDate: -1 });
db.marketPrices.createIndex({ cropName: 1, priceDate: -1 });

// Notifications
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });

// Weather Logs (Geospatial)
db.weatherLogs.createIndex({ "location.coordinates": "2dsphere" });
db.weatherLogs.createIndex({ userId: 1, createdAt: -1 });

// Disease Detection
db.diseaseDetectionLogs.createIndex({ cropType: 1, createdAt: -1 });
db.diseaseDetectionLogs.createIndex({ queryId: 1 });
```

---

## 5. API ARCHITECTURE

### RESTful API Design

#### Authentication Endpoints
```
POST   /api/v1/auth/register          - User registration
POST   /api/v1/auth/login             - User login
POST   /api/v1/auth/logout            - User logout
POST   /api/v1/auth/refresh-token     - Refresh JWT token
POST   /api/v1/auth/forgot-password   - Request password reset
POST   /api/v1/auth/verify-otp        - Verify OTP
POST   /api/v1/auth/reset-password    - Reset password
GET    /api/v1/auth/me                - Get current user
```

#### Farmer Query Endpoints
```
POST   /api/v1/queries                - Create new query
GET    /api/v1/queries                - Get all queries (paginated)
GET    /api/v1/queries/:id            - Get query details
POST   /api/v1/queries/:id/voice      - Submit voice query
POST   /api/v1/queries/:id/image      - Upload disease image
PUT    /api/v1/queries/:id            - Update query
DELETE /api/v1/queries/:id            - Delete query
GET    /api/v1/queries/history/all    - Get query history
```

#### AI Response Endpoints
```
POST   /api/v1/queries/:id/get-response    - Get AI response
GET    /api/v1/queries/:id/response        - Retrieve stored response
POST   /api/v1/responses/:id/translate     - Translate response
GET    /api/v1/responses/:id/voice         - Get voice response
```

#### Image Processing Endpoints
```
POST   /api/v1/image/detect-disease   - Detect disease from image
POST   /api/v1/image/ocr              - Extract text from image
POST   /api/v1/image/upload           - Upload image to cloud
GET    /api/v1/image/:id              - Get image details
```

#### Escalation Endpoints
```
POST   /api/v1/escalations            - Create escalation
GET    /api/v1/escalations            - Get all escalations (officer)
GET    /api/v1/escalations/:id        - Get escalation details
PUT    /api/v1/escalations/:id        - Update escalation
POST   /api/v1/escalations/:id/chat   - Add message to escalation
GET    /api/v1/escalations/:id/history- Get escalation history
```

#### Weather & Location Endpoints
```
GET    /api/v1/weather/current        - Get current weather
GET    /api/v1/weather/forecast       - Get weather forecast
GET    /api/v1/weather/advisory       - Get farming advisory
GET    /api/v1/location/search        - Search location by coordinates
POST   /api/v1/location/set-primary   - Set primary farm location
```

#### Market Price Endpoints
```
GET    /api/v1/market/prices          - Get market prices
GET    /api/v1/market/prices/:crop    - Get crop-specific prices
GET    /api/v1/market/trends          - Get price trends
GET    /api/v1/market/nearby-mandis   - Get nearby mandi rates
```

#### Government Schemes Endpoints
```
GET    /api/v1/schemes                - Get all schemes
GET    /api/v1/schemes/recommended    - Get schemes for farmer
GET    /api/v1/schemes/:id            - Get scheme details
GET    /api/v1/schemes/search         - Search schemes
```

#### Feedback Endpoints
```
POST   /api/v1/feedback               - Submit feedback
GET    /api/v1/feedback/:queryId      - Get feedback for query
PUT    /api/v1/feedback/:id           - Update feedback
```

#### Officer Dashboard Endpoints
```
GET    /api/v1/officer/dashboard      - Officer dashboard metrics
GET    /api/v1/officer/escalations    - Get assigned escalations
GET    /api/v1/officer/farmers        - Get assigned farmers
GET    /api/v1/officer/analytics      - Officer-specific analytics
```

#### Admin Dashboard Endpoints
```
GET    /api/v1/admin/dashboard        - Admin metrics
GET    /api/v1/admin/users            - Manage users
PUT    /api/v1/admin/users/:id        - Update user
DELETE /api/v1/admin/users/:id        - Delete user
GET    /api/v1/admin/analytics        - System analytics
GET    /api/v1/admin/query-trends     - Query trends analysis
POST   /api/v1/admin/schemes          - Manage schemes
GET    /api/v1/admin/disease-heatmap  - Disease distribution map
```

### API Response Format
```javascript
{
  success: Boolean,
  statusCode: Number,
  message: String,
  data: Object|Array|null,
  errors: [{
    field: String,
    message: String
  }],
  pagination: {
    page: Number,
    limit: Number,
    total: Number,
    pages: Number
  },
  timestamp: Date
}
```

### API Rate Limiting
- Public endpoints: 10 requests/minute
- Authenticated endpoints: 100 requests/minute
- Admin endpoints: 500 requests/minute

---

## 6. FRONTEND ARCHITECTURE

### Component Structure
```
frontend/
├── index.html                    # Main entry point
├── manifest.json                 # PWA manifest
├── service-worker.js             # Service worker for offline
│
├── assets/
│   ├── css/
│   │   ├── variables.css         # CSS variables & theme
│   │   ├── responsive.css        # Media queries
│   │   ├── components.css        # Reusable components
│   │   ├── layout.css            # Layout styles
│   │   ├── animations.css        # Animations & transitions
│   │   └── dark-mode.css         # Dark mode styles
│   │
│   ├── js/
│   │   ├── main.js               # Application entry point
│   │   ├── config.js             # App configuration
│   │   ├── constants.js          # Constants & enums
│   │   │
│   │   ├── api/
│   │   │   ├── client.js         # HTTP client wrapper
│   │   │   ├── auth.js           # Auth API calls
│   │   │   ├── queries.js        # Query API calls
│   │   │   ├── weather.js        # Weather API calls
│   │   │   └── market.js         # Market API calls
│   │   │
│   │   ├── services/
│   │   │   ├── storage.js        # Local/Session storage
│   │   │   ├── voice.js          # Voice recognition/synthesis
│   │   │   ├── geolocation.js    # Geolocation service
│   │   │   ├── notification.js   # Push notifications
│   │   │   ├── translator.js     # Translation service
│   │   │   └── theme.js          # Theme management
│   │   │
│   │   ├── components/
│   │   │   ├── navbar.js         # Navigation bar
│   │   │   ├── sidebar.js        # Sidebar navigation
│   │   │   ├── chatbot.js        # Query chatbot UI
│   │   │   ├── weather-card.js   # Weather display
│   │   │   ├── market-dashboard.js # Market prices
│   │   │   ├── footer.js         # Footer
│   │   │   └── notifications.js  # Notification popup
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.js        # Utility functions
│   │   │   ├── validators.js     # Form validation
│   │   │   ├── date-utils.js     # Date formatting
│   │   │   └── file-handlers.js  # File upload helpers
│   │   │
│   │   └── pages/
│   │       ├── login.js          # Login page logic
│   │       ├── register.js       # Registration logic
│   │       ├── dashboard.js      # Farmer dashboard logic
│   │       ├── query-interface.js# Query UI logic
│   │       ├── history.js        # Query history logic
│   │       ├── officer-dashboard.js # Officer dashboard
│   │       ├── admin-dashboard.js# Admin dashboard
│   │       └── settings.js       # User settings
│   │
│   └── images/
│       ├── logo.svg
│       ├── icons/
│       ├── illustrations/
│       └── backgrounds/
│
└── pages/
    ├── index.html                # Home page
    ├── login.html                # Login page
    ├── register.html             # Registration page
    ├── dashboard.html            # Farmer dashboard
    ├── query.html                # Query interface
    ├── history.html              # Query history
    ├── officer-dashboard.html    # Officer dashboard
    ├── admin-dashboard.html      # Admin dashboard
    └── settings.html             # User settings
```

### State Management (LocalStorage + Session)
```javascript
// App State Structure
{
  auth: {
    isAuthenticated: Boolean,
    user: User,
    token: String,
    refreshToken: String,
    expiresAt: Date
  },
  ui: {
    isDarkMode: Boolean,
    language: String,
    sidebarOpen: Boolean,
    notificationCount: Number
  },
  farmer: {
    profile: FarmerProfile,
    farm: Farm,
    recentQueries: Query[],
    favoriteSchemes: Scheme[],
    lastLocation: Coordinates
  },
  cache: {
    weather: Weather,
    marketPrices: MarketPrice[],
    schemes: Scheme[],
    cachedAt: Date
  }
}
```

### Responsive Design Breakpoints
```css
/* Mobile First */
/* Small devices (320px and up) */
@media (min-width: 320px) { }

/* Medium devices (576px and up) */
@media (min-width: 576px) { }

/* Tablets (768px and up) */
@media (min-width: 768px) { }

/* Small desktops (992px and up) */
@media (min-width: 992px) { }

/* Large desktops (1200px and up) */
@media (min-width: 1200px) { }

/* Extra large desktops (1400px and up) */
@media (min-width: 1400px) { }
```

---

## 7. SECURITY ARCHITECTURE

### Authentication Flow
```
1. User Registration
   - Email/Phone verification
   - OTP generation
   - Password hashing (bcrypt)
   - User creation

2. User Login
   - Credential validation
   - JWT token generation (access + refresh)
   - Session creation
   - LastLoginAt update

3. Request Authorization
   - JWT validation in headers
   - Token expiry check
   - Role-based access control
   - Rate limiting check

4. Token Refresh
   - Refresh token validation
   - New access token generation
   - Old token blacklisting
```

### Security Measures
- **HTTPS/TLS**: All communications encrypted
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds 10
- **CORS**: Configured for specific domains
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Rate Limiting**: Brute force protection
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Mongoose prevents NoSQL injection
- **XSS Protection**: HTML escaping, CSP headers
- **CSRF Protection**: SameSite cookies
- **File Upload Security**: Type validation, size limits, virus scanning
- **Environment Variables**: Sensitive data in .env
- **API Key Rotation**: Regular key updates
- **Audit Logging**: All critical operations logged

### Session Management
```javascript
// JWT Payload
{
  userId: ObjectId,
  email: String,
  role: Enum,
  iat: Number,
  exp: Number,
  iss: "farmer-query-system"
}

// Token Lifetime
accessToken: 15 minutes
refreshToken: 7 days
```

---

## 8. DEPLOYMENT STRATEGY

### Development Environment
- Local development with Docker
- MongoDB local instance
- Environment variables via .env

### Staging Environment
- Cloud staging servers
- MongoDB Atlas (staging cluster)
- Feature testing & QA
- Load testing

### Production Environment

#### Frontend Deployment (Vercel/Netlify)
```
- Build optimization
- Automatic deployments from main branch
- CDN distribution
- SSL/TLS certificates
- Environment-specific configs
```

#### Backend Deployment (Render/Railway)
```
- Node.js server instances
- Auto-scaling based on traffic
- Environment configuration
- Database credentials management
- Log aggregation
```

#### Database (MongoDB Atlas)
```
- Cluster with replica set
- Automated backups
- Point-in-time recovery
- Encryption at rest
- IP whitelisting
```

#### CI/CD Pipeline
```
GitHub Repository
    ↓
Trigger on Push
    ↓
Run Tests & Linting
    ↓
Build Application
    ↓
Deploy to Staging (if pass)
    ↓
Run Smoke Tests
    ↓
Deploy to Production (on approval)
    ↓
Health Checks & Monitoring
```

---

## 9. SCALABILITY CONSIDERATIONS

### Horizontal Scaling
- **Load Balancer**: Distribute traffic across multiple servers
- **Microservices**: Independent deployment of services
- **Database Sharding**: Partition data by geography/user_id
- **Caching Layer**: Redis for session & query cache

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Database optimization & indexing
- CDN for static assets

### Performance Optimization
- **Image Optimization**: Compression, lazy loading
- **Code Splitting**: Modular JavaScript loading
- **Minification**: CSS & JS compression
- **Caching Strategy**: Browser cache, CDN cache, Redis cache
- **Database Query Optimization**: Indexes, aggregation pipelines
- **API Response Compression**: Gzip compression

### Monitoring & Alerts
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- User analytics (Mixpanel, Google Analytics)
- Infrastructure monitoring (DataDog, New Relic)
- Custom dashboards & alerts

---

## PROJECT PHASES

### Phase 1: Foundation (Week 1-2)
- Project setup & configuration
- Database schema & models
- Authentication system
- Basic API structure

### Phase 2: Core Features (Week 3-5)
- Query processing system
- AI integration
- Image processing
- Voice integration

### Phase 3: Integration (Week 6-7)
- Weather API integration
- Market prices integration
- Translation services
- Escalation system

### Phase 4: Frontend Development (Week 8-10)
- Responsive UI implementation
- Interactive components
- Dark mode support
- PWA features

### Phase 5: Advanced Features (Week 11-12)
- Dashboard implementations
- Analytics & reporting
- Feedback system
- Learning feedback loop

### Phase 6: Testing & Deployment (Week 13-14)
- Unit testing
- Integration testing
- Performance testing
- Security testing
- Deployment setup

---

## CONCLUSION

This architecture provides a scalable, secure, and maintainable foundation for the AI-Based Farmer Query Support System. It follows industry best practices and modern software engineering principles, ensuring the system can handle growth while maintaining code quality and security.
