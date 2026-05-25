# Project Folder Structure

## Complete Project Directory Layout

```
FARMER QUERY SUPPORT SYSTEM/
│
├── docs/                                    # Documentation folder
│   ├── API_DOCUMENTATION.md                # API endpoint documentation
│   ├── DATABASE_SCHEMA.md                  # Database design details
│   ├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
│   ├── TESTING_STRATEGY.md                 # Testing approach
│   └── CONTRIBUTING.md                     # Contribution guidelines
│
├── frontend/                                # Frontend application
│   │
│   ├── index.html                          # Main entry point
│   ├── manifest.json                       # PWA manifest file
│   ├── service-worker.js                   # Service worker for offline
│   ├── .env.example                        # Environment variables template
│   │
│   ├── assets/
│   │   │
│   │   ├── css/
│   │   │   ├── variables.css               # CSS custom properties & colors
│   │   │   ├── reset.css                   # CSS reset/normalize
│   │   │   ├── responsive.css              # Media queries & breakpoints
│   │   │   ├── components.css              # Reusable component styles
│   │   │   ├── layout.css                  # Layout & grid styles
│   │   │   ├── animations.css              # Animations & transitions
│   │   │   ├── dark-mode.css               # Dark mode theme
│   │   │   ├── print.css                   # Print styles
│   │   │   └── index.css                   # Main stylesheet (imports all)
│   │   │
│   │   ├── js/
│   │   │   │
│   │   │   ├── main.js                     # Application entry point
│   │   │   ├── config.js                   # App configuration
│   │   │   ├── constants.js                # Global constants & enums
│   │   │   ├── app.js                      # Core app logic
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── client.js               # HTTP client wrapper (fetch)
│   │   │   │   ├── auth.js                 # Authentication API endpoints
│   │   │   │   ├── queries.js              # Query API endpoints
│   │   │   │   ├── weather.js              # Weather API endpoints
│   │   │   │   ├── market.js               # Market price API endpoints
│   │   │   │   ├── schemes.js              # Schemes API endpoints
│   │   │   │   ├── escalations.js          # Escalation API endpoints
│   │   │   │   ├── feedback.js             # Feedback API endpoints
│   │   │   │   └── admin.js                # Admin API endpoints
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── authService.js          # Auth state management
│   │   │   │   ├── storageService.js       # LocalStorage/SessionStorage
│   │   │   │   ├── voiceService.js         # Web Speech API wrapper
│   │   │   │   ├── geolocationService.js   # Geolocation API wrapper
│   │   │   │   ├── notificationService.js  # Push notifications
│   │   │   │   ├── translatorService.js    # Translation service
│   │   │   │   ├── cacheService.js         # Caching layer
│   │   │   │   ├── themeService.js         # Theme management
│   │   │   │   ├── socketService.js        # WebSocket for real-time chat
│   │   │   │   └── syncService.js          # Offline sync service
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── navbar.js               # Navigation bar component
│   │   │   │   ├── sidebar.js              # Sidebar navigation
│   │   │   │   ├── chatbot.js              # Query chatbot UI
│   │   │   │   ├── weatherCard.js          # Weather display card
│   │   │   │   ├── marketDashboard.js      # Market prices dashboard
│   │   │   │   ├── imageUpload.js          # Image upload component
│   │   │   │   ├── voiceRecorder.js        # Voice recording component
│   │   │   │   ├── footer.js               # Footer component
│   │   │   │   ├── notificationBell.js     # Notification popup
│   │   │   │   ├── modal.js                # Modal component
│   │   │   │   ├── loader.js               # Loading spinner
│   │   │   │   └── tabs.js                 # Tab component
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── helpers.js              # General utility functions
│   │   │   │   ├── validators.js           # Form validation functions
│   │   │   │   ├── dateUtils.js            # Date/time utilities
│   │   │   │   ├── fileHandlers.js         # File upload utilities
│   │   │   │   ├── formatters.js           # Data formatting utilities
│   │   │   │   ├── logger.js               # Client-side logging
│   │   │   │   └── errorHandler.js         # Error handling
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── auth/
│   │   │       │   ├── login.js            # Login page logic
│   │   │       │   ├── register.js         # Registration page logic
│   │   │       │   └── forgotPassword.js   # Password reset logic
│   │   │       │
│   │   │       ├── farmer/
│   │   │       │   ├── dashboard.js        # Farmer dashboard logic
│   │   │       │   ├── queryInterface.js   # Query creation interface
│   │   │       │   ├── queryHistory.js     # Query history page
│   │   │       │   ├── diseaseDetection.js # Disease detection UI
│   │   │       │   ├── weatherAdvisory.js  # Weather-based advisory
│   │   │       │   ├── marketPrices.js     # Market prices view
│   │   │       │   ├── schemes.js          # Government schemes view
│   │   │       │   ├── cropCalendar.js     # Crop calendar view
│   │   │       │   └── profile.js          # Farmer profile management
│   │   │       │
│   │   │       ├── officer/
│   │   │       │   ├── dashboard.js        # Officer dashboard
│   │   │       │   ├── escalations.js      # Escalation list & chat
│   │   │       │   ├── farmerSupport.js    # Farmer support interface
│   │   │       │   ├── analytics.js        # Officer analytics
│   │   │       │   └── regionInsights.js   # Region-specific data
│   │   │       │
│   │   │       ├── admin/
│   │   │       │   ├── dashboard.js        # Admin dashboard
│   │   │       │   ├── userManagement.js   # User management
│   │   │       │   ├── analytics.js        # System analytics
│   │   │       │   ├── diseaseHeatmap.js   # Disease distribution map
│   │   │       │   ├── schemeManagement.js # Manage schemes
│   │   │       │   └── reports.js          # Analytics reports
│   │   │       │
│   │   │       └── common/
│   │   │           ├── settings.js         # User settings
│   │   │           ├── notifications.js    # Notification center
│   │   │           ├── help.js             # Help/FAQ
│   │   │           └── about.js            # About page
│   │   │
│   │   └── images/
│   │       ├── logo.svg                    # Application logo
│   │       ├── favicon.ico                 # Browser favicon
│   │       │
│   │       ├── icons/
│   │       │   ├── query.svg
│   │       │   ├── voice.svg
│   │       │   ├── image.svg
│   │       │   ├── weather.svg
│   │       │   ├── market.svg
│   │       │   ├── schemes.svg
│   │       │   ├── settings.svg
│   │       │   └── menu.svg
│   │       │
│   │       ├── illustrations/
│   │       │   ├── hero-farmer.svg
│   │       │   ├── disease-detection.svg
│   │       │   ├── weather-advisory.svg
│   │       │   └── success.svg
│   │       │
│   │       └── backgrounds/
│   │           ├── gradient-green.svg
│   │           ├── pattern-wheat.svg
│   │           └── farm-landscape.svg
│   │
│   └── pages/
│       ├── index.html                      # Home page
│       ├── login.html                      # Login page
│       ├── register.html                   # Registration page
│       ├── forgot-password.html            # Password reset page
│       │
│       ├── farmer/
│       │   ├── dashboard.html              # Farmer dashboard
│       │   ├── query.html                  # Query interface
│       │   ├── history.html                # Query history
│       │   ├── disease-detection.html      # Disease detection
│       │   ├── weather.html                # Weather advisory
│       │   ├── market.html                 # Market prices
│       │   ├── schemes.html                # Government schemes
│       │   ├── crop-calendar.html          # Crop calendar
│       │   └── profile.html                # Profile management
│       │
│       ├── officer/
│       │   ├── dashboard.html              # Officer dashboard
│       │   ├── escalations.html            # Escalations list
│       │   ├── farmer-support.html         # Support interface
│       │   ├── analytics.html              # Analytics
│       │   └── region-insights.html        # Region data
│       │
│       ├── admin/
│       │   ├── dashboard.html              # Admin dashboard
│       │   ├── users.html                  # User management
│       │   ├── analytics.html              # System analytics
│       │   ├── disease-heatmap.html        # Disease map
│       │   ├── schemes.html                # Scheme management
│       │   └── reports.html                # Reports
│       │
│       └── common/
│           ├── settings.html               # Settings page
│           ├── notifications.html          # Notifications page
│           ├── help.html                   # Help/FAQ
│           └── about.html                  # About page
│
├── backend/                                 # Backend (Node.js + Express)
│   │
│   ├── server.js                           # Server entry point
│   ├── app.js                              # Express app setup
│   ├── package.json                        # Dependencies
│   ├── package-lock.json                   # Lock file
│   ├── .env.example                        # Environment variables
│   ├── .gitignore                          # Git ignore rules
│   │
│   ├── config/
│   │   ├── database.js                     # MongoDB connection
│   │   ├── env.js                          # Environment variables
│   │   ├── constants.js                    # Backend constants
│   │   ├── api-keys.js                     # External API keys
│   │   └── email-config.js                 # Email configuration
│   │
│   ├── models/
│   │   ├── User.js                         # User schema
│   │   ├── FarmerProfile.js                # Farmer profile schema
│   │   ├── OfficerProfile.js               # Officer profile schema
│   │   ├── Query.js                        # Query schema
│   │   ├── Response.js                     # Response schema
│   │   ├── Escalation.js                   # Escalation schema
│   │   ├── Scheme.js                       # Scheme schema
│   │   ├── Feedback.js                     # Feedback schema
│   │   ├── WeatherLog.js                   # Weather log schema
│   │   ├── MarketPrice.js                  # Market price schema
│   │   ├── Notification.js                 # Notification schema
│   │   ├── DiseaseDetectionLog.js          # Disease detection log
│   │   └── AdminAnalytics.js               # Analytics schema
│   │
│   ├── routes/
│   │   ├── index.js                        # Route aggregator
│   │   ├── auth.js                         # Authentication routes
│   │   ├── queries.js                      # Query routes
│   │   ├── images.js                       # Image processing routes
│   │   ├── voices.js                       # Voice processing routes
│   │   ├── weather.js                      # Weather routes
│   │   ├── market.js                       # Market price routes
│   │   ├── schemes.js                      # Schemes routes
│   │   ├── escalations.js                  # Escalation routes
│   │   ├── feedback.js                     # Feedback routes
│   │   ├── officer.js                      # Officer routes
│   │   ├── admin.js                        # Admin routes
│   │   └── notifications.js                # Notification routes
│   │
│   ├── controllers/
│   │   ├── authController.js               # Auth logic
│   │   ├── queryController.js              # Query processing logic
│   │   ├── imageController.js              # Image processing
│   │   ├── voiceController.js              # Voice processing
│   │   ├── weatherController.js            # Weather logic
│   │   ├── marketController.js             # Market logic
│   │   ├── schemeController.js             # Scheme logic
│   │   ├── escalationController.js         # Escalation logic
│   │   ├── feedbackController.js           # Feedback logic
│   │   ├── officerController.js            # Officer dashboard logic
│   │   ├── adminController.js              # Admin logic
│   │   └── notificationController.js       # Notification logic
│   │
│   ├── middlewares/
│   │   ├── auth.js                         # JWT verification
│   │   ├── rbac.js                         # Role-based access control
│   │   ├── errorHandler.js                 # Error handling middleware
│   │   ├── validation.js                   # Input validation
│   │   ├── rateLimit.js                    # Rate limiting
│   │   ├── requestLogger.js                # Request logging
│   │   ├── cors.js                         # CORS configuration
│   │   └── securityHeaders.js              # Security headers (Helmet)
│   │
│   ├── services/
│   │   ├── authService.js                  # Auth business logic
│   │   ├── queryService.js                 # Query processing logic
│   │   ├── aiService.js                    # AI/ML integration
│   │   ├── imageService.js                 # Image processing service
│   │   ├── voiceService.js                 # Voice processing
│   │   ├── weatherService.js               # Weather data service
│   │   ├── marketService.js                # Market price service
│   │   ├── schemeService.js                # Scheme recommendation
│   │   ├── escalationService.js            # Escalation logic
│   │   ├── notificationService.js          # Notification sending
│   │   ├── emailService.js                 # Email sending
│   │   ├── smsService.js                   # SMS sending
│   │   ├── translationService.js           # Translation service
│   │   ├── cacheService.js                 # Caching service
│   │   └── analyticsService.js             # Analytics processing
│   │
│   ├── utils/
│   │   ├── helpers.js                      # General helpers
│   │   ├── validators.js                   # Validation utilities
│   │   ├── errorMessages.js                # Standardized error messages
│   │   ├── httpStatus.js                   # HTTP status codes
│   │   ├── logger.js                       # Logging utility
│   │   ├── jwt.js                          # JWT utilities
│   │   ├── password.js                     # Password hashing utilities
│   │   ├── fileUpload.js                   # File upload utilities
│   │   ├── dateUtils.js                    # Date utilities
│   │   └── formatters.js                   # Data formatting
│   │
│   ├── ml-models/
│   │   ├── diseaseDetection.js             # Disease detection model
│   │   ├── cropClassification.js           # Crop classification
│   │   └── recommendation.js               # Recommendation engine
│   │
│   ├── scripts/
│   │   ├── seed-db.js                      # Database seeding
│   │   ├── create-admin.js                 # Create admin user
│   │   ├── sync-market-prices.js           # Sync market prices
│   │   ├── sync-weather.js                 # Sync weather data
│   │   └── cleanup-expired-otps.js         # Cleanup expired OTPs
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── authService.test.js         # Auth service tests
│   │   │   ├── queryService.test.js        # Query service tests
│   │   │   └── validators.test.js          # Validation tests
│   │   │
│   │   ├── integration/
│   │   │   ├── auth.integration.test.js    # Auth API tests
│   │   │   ├── queries.integration.test.js # Query API tests
│   │   │   └── weather.integration.test.js # Weather API tests
│   │   │
│   │   └── e2e/
│   │       ├── farmer-flow.e2e.test.js     # Farmer workflow
│   │       ├── officer-flow.e2e.test.js    # Officer workflow
│   │       └── admin-flow.e2e.test.js      # Admin workflow
│   │
│   └── logs/
│       ├── error.log                       # Error logs
│       ├── combined.log                    # Combined logs
│       └── app.log                         # Application logs
│
├── .github/
│   └── workflows/
│       ├── ci.yml                          # CI pipeline
│       ├── deploy-staging.yml              # Staging deployment
│       └── deploy-production.yml           # Production deployment
│
├── docs/
│   ├── PROJECT_ARCHITECTURE.md             # Architecture documentation
│   ├── PROJECT_STRUCTURE.md                # This file
│   ├── API_DOCUMENTATION.md                # API details
│   ├── DATABASE_SCHEMA.md                  # Database schema
│   ├── DEPLOYMENT_GUIDE.md                 # Deployment steps
│   ├── TESTING_STRATEGY.md                 # Testing approach
│   ├── SECURITY.md                         # Security guidelines
│   ├── CONTRIBUTING.md                     # Contributing guidelines
│   └── TROUBLESHOOTING.md                  # Common issues & solutions
│
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── README.md                               # Project README
├── INSTALLATION.md                         # Installation guide
└── LICENSE                                 # License file
```

## Summary Statistics
- **Frontend Files**: ~50 HTML/CSS/JS files
- **Backend Files**: ~40 Node.js files
- **Models/Schemas**: 12 MongoDB collections
- **API Endpoints**: 70+ REST endpoints
- **Total Lines of Code**: ~15,000+ (production-ready)

## Key Directories

### Frontend (`/frontend`)
Handles user interface, client-side logic, and offline support.

### Backend (`/backend`)
Handles business logic, database operations, external integrations, and security.

### Documentation (`/docs`)
Complete API, deployment, and architectural documentation.

### Configuration
- `.env.example`: Template for environment variables
- `package.json`: Dependencies and scripts
- `.gitignore`: Git configuration

## Development Workflow

1. **Local Development**
   - Frontend development on `localhost:3000`
   - Backend development on `localhost:5000`
   - MongoDB local instance

2. **Git Workflow**
   - Feature branches from `develop`
   - Pull requests for code review
   - Automated tests on PR

3. **Deployment**
   - Staging deployment on commit to `staging` branch
   - Production deployment on commit to `main` branch
   - Automatic rollback on failure

---

This structure ensures:
- Clear separation of concerns
- Easy navigation and maintenance
- Scalability for future features
- Professional organization
- Best practices compliance
