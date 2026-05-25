# AI-Based Farmer Query Support and Advisory System

## 🌾 Overview

A production-ready, full-stack web application that provides AI-powered agricultural advisory services to farmers across India. The system offers instant expert guidance for crop diseases, pest management, soil health, weather-based farming, market prices, and government schemes.

## 🎯 Key Features

### For Farmers
- **Multi-Modal Query Support**: Text, voice, and image-based queries
- **AI-Powered Responses**: Instant answers using OpenAI/Gemini
- **Disease Detection**: Upload crop images for AI-powered disease identification
- **Weather Advisory**: Real-time weather data with farming recommendations
- **Market Prices**: Live commodity prices from nearby mandis
- **Government Schemes**: Personalized scheme recommendations based on crop and location
- **Expert Escalation**: Direct communication with agriculture officers for complex issues
- **Query History**: Track all previous queries and responses
- **Multilingual Support**: 9 Indian languages (Hindi, Punjabi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, English)

### For Agriculture Officers
- **Farmer Support Dashboard**: Manage assigned farmers and escalations
- **Real-time Chat**: Direct communication with farmers
- **Regional Analytics**: District and state-level insights
- **Performance Metrics**: Track resolution time and farmer satisfaction

### For Administrators
- **System Analytics**: Monitor system performance and usage
- **Disease Heatmap**: Visualize disease distribution across regions
- **User Management**: Manage farmers, officers, and admins
- **Scheme Management**: Update government schemes and benefits
- **System Reports**: Generate comprehensive analytics reports

## 📋 Technology Stack

### Frontend
- **HTML5** | **CSS3** | **Vanilla JavaScript (ES6+)**
- **Web APIs**: Speech, Geolocation, Camera, Service Workers
- **PWA Support**: Offline functionality
- **Dark Mode**: Theme switching

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.18
- **Language**: JavaScript (ES6+ modules)

### Database
- **MongoDB Atlas**: Primary database
- **Redis**: Caching & sessions
- **Mongoose v8**: ODM for MongoDB

### AI & External Services
- **OpenAI/Google Gemini**: Natural language understanding
- **TensorFlow.js**: Image processing & disease detection
- **Google Cloud Vision**: Advanced image analysis
- **OpenWeatherMap API**: Weather data
- **Cloudinary**: Image storage & optimization
- **Google Translate**: Multilingual support

### Security & DevOps
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **MongoDB Indexing**: Query optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- API keys for:
  - OpenAI or Google Gemini
  - Cloudinary
  - Google Cloud APIs
  - OpenWeatherMap

### Installation

1. **Clone and Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

2. **Configure Environment**
   - Edit `.env` with your API keys and database credentials
   - Set `NODE_ENV=development`

3. **Start Backend Server**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:5000`
   - Database connects automatically
   - Check logs for connection status

4. **Setup Frontend**
   ```bash
   cd frontend
   # Open index.html in browser or use live server
   ```

### API Testing
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # API version
   curl http://localhost:5000/api/version
   
   # Register (POST)
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "farmer@example.com",
       "password": "SecurePass123!",
       "firstName": "John",
       "lastName": "Doe",
       "role": "farmer",
       "state": "Punjab"
     }'
   ```

## 📁 Project Structure

```
FARMER QUERY SUPPORT SYSTEM/
├── docs/                           # Documentation
│   ├── PROJECT_ARCHITECTURE.md     # System design
│   ├── DATABASE_SCHEMA.md          # MongoDB schemas
│   └── API_DOCUMENTATION.md        # API details
│
├── frontend/                        # Frontend app
│   ├── index.html                  # Entry point
│   ├── pages/                      # HTML pages
│   ├── assets/                     # CSS, JS, images
│   └── manifest.json               # PWA manifest
│
└── backend/                         # Backend API
    ├── server.js                   # Entry point
    ├── app.js                      # Express setup
    ├── models/                     # MongoDB schemas
    ├── routes/                     # API endpoints
    ├── controllers/                # Request handlers
    ├── services/                   # Business logic
    ├── middlewares/                # Custom middleware
    ├── utils/                      # Helper functions
    └── config/                     # Configuration
```

## 🔑 Authentication

### How It Works
1. **User Registration**: Creates account, sends OTP
2. **Email Verification**: Verify OTP to activate account
3. **Login**: Returns JWT access & refresh tokens
4. **Token Refresh**: Get new access token using refresh token
5. **Protected Routes**: All routes check JWT validity

### Token Structure
```
Access Token: 15 minutes validity
Refresh Token: 7 days validity
```

### Example Auth Flow
```javascript
// 1. Register
POST /api/v1/auth/register
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer",
  "state": "Punjab"
}

// 2. Verify OTP
POST /api/v1/auth/verify-otp
{
  "userId": "...",
  "otp": "123456"
}

// 3. Login
POST /api/v1/auth/login
{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}

// Response includes accessToken & refreshToken

// 4. Use in requests
GET /api/v1/queries
Authorization: Bearer <accessToken>

// 5. Refresh token
POST /api/v1/auth/refresh-token
{
  "refreshToken": "..."
}
```

## 📊 Database Schema

### 12 Collections
1. **User** - Authentication & basic profile
2. **FarmerProfile** - Farmer-specific data
3. **OfficerProfile** - Agriculture officer data
4. **Query** - Farmer queries with AI responses
5. **Response** - Officer & AI responses
6. **Escalation** - Complex issue escalations
7. **Scheme** - Government schemes
8. **Feedback** - Quality feedback on responses
9. **WeatherLog** - Weather data
10. **MarketPrice** - Commodity prices
11. **Notification** - User notifications
12. **AdminAnalytics** - System metrics

See `docs/DATABASE_SCHEMA.md` for complete schema details.

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ bcryptjs password hashing
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ Helmet security headers
- ✅ MongoDB injection prevention
- ✅ Account lockout after failed attempts
- ✅ OTP-based email verification

## 📈 Scalability

The architecture supports:
- **Horizontal Scaling**: Stateless design, multiple server instances
- **Database Sharding**: Partition data by geography
- **Caching Layer**: Redis for high-frequency queries
- **CDN Distribution**: Static asset delivery
- **Microservices**: Can split into independent services
- **Load Balancing**: Distribute traffic across servers

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test -- --coverage

# Specific test file
npm test -- auth.test.js
```

## 📝 API Documentation

### Authentication Endpoints
```
POST   /api/v1/auth/register           - Register new user
POST   /api/v1/auth/login              - Login
POST   /api/v1/auth/refresh-token      - Refresh access token
POST   /api/v1/auth/forgot-password    - Request password reset
POST   /api/v1/auth/reset-password     - Reset password
POST   /api/v1/auth/verify-otp         - Verify OTP
GET    /api/v1/auth/me                 - Get current user
POST   /api/v1/auth/logout             - Logout
```

### Query Endpoints (Coming in Phase 2)
```
POST   /api/v1/queries                 - Create query
GET    /api/v1/queries                 - Get queries
GET    /api/v1/queries/:id             - Get query details
POST   /api/v1/queries/:id/image       - Upload disease image
```

### Other Endpoints (Coming in later phases)
```
Weather, Market Prices, Schemes, Escalations, Feedback, Admin, Officer
```

Complete API documentation: `docs/API_DOCUMENTATION.md`

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (COMPLETED)
- Project architecture & documentation
- Database schema design
- Backend configuration & utilities
- MongoDB models (8 core models)
- Authentication system
- Express app setup with middleware

### 🔄 Phase 2: Core Features (NEXT)
- Query processing system
- AI response generation (OpenAI/Gemini)
- Image upload & disease detection
- Voice processing & transcription
- Response generation & storage

### 📍 Phase 3: Integrations
- Weather API integration
- Market prices synchronization
- Translation services
- Email & SMS notifications
- Escalation system

### 🎨 Phase 4: Frontend
- Responsive UI components
- Dashboard implementations
- PWA features
- Dark mode

### 🔬 Phase 5: Advanced Features
- Analytics & reporting
- Feedback learning loop
- Disease heatmaps
- Advanced recommendations

### 🧪 Phase 6: Testing & Deployment
- Unit & integration tests
- Performance testing
- Security audit
- Production deployment

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open pull request

See `docs/CONTRIBUTING.md` for detailed guidelines.

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: support@farmerquery.com
- Documentation: Check `/docs` folder

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

**Development Team**
- Senior Full-Stack Developer
- Backend Engineer
- Frontend Engineer
- DevOps Engineer
- QA Engineer

## 🎓 Acknowledgments

- Built with Node.js, Express, MongoDB, and modern web technologies
- Inspired by successful agricultural tech platforms
- Dedicated to improving lives of Indian farmers

---

**Version**: 1.0.0  
**Status**: Phase 1 Complete, Phase 2 In Development  
**Last Updated**: 2024  

**For detailed documentation, see the `/docs` folder**
