# 🌾 Farmer Query Support System - Enhanced Frontend

## Overview

This is a complete, production-ready frontend for the Farmer Query Support and Advisory System. It provides an intuitive interface for farmers, agricultural officers, and administrators to manage agricultural queries, weather information, market prices, and government schemes.

## ✨ Enhanced Features

### 🎯 User-Friendly Interface
- **Modern, Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Sidebar menu with clear icons and labels
- **Real-time Feedback**: Instant validation, loading states, and success/error messages
- **Smooth Animations**: Professional transitions and interactions

### 🔐 Authentication System
- **Secure Login/Register**: Email-based authentication with JWT tokens
- **Role-Based Access**: Different interfaces for farmers, officers, and admins
- **Remember Me Option**: Convenient login experience
- **Password Strength Validation**: Security requirements during registration

### 📝 Query Management
- **Multiple Input Types**: Text, voice, and image-based queries
- **Rich Context Information**: Crop type, season, symptoms, duration tracking
- **Image Upload**: Direct photo upload for disease detection
- **Query History**: View all submitted queries with status tracking
- **Real-time Status Updates**: Monitor query progress and AI responses

### 🌤️ Weather Integration
- **Real-time Weather Data**: Current temperature, humidity, wind speed, conditions
- **5-Day Forecast**: Plan farming activities based on predictions
- **Location Search**: Get weather for any city/state
- **Agriculture-Specific Information**: Weather insights for farming decisions

### 📊 Market Price Tracking
- **Live Commodity Prices**: Real-time agricultural market data
- **Regional Filtering**: Get prices by state/district
- **Historical Trends**: Compare price changes over time
- **Price Alerts**: Get notifications for price movements

### 📄 Government Schemes
- **Comprehensive Database**: Browse all available agricultural schemes
- **Advanced Search**: Filter by eligibility, benefits, government level
- **Detailed Information**: Full scheme descriptions, application process, contacts
- **Eligibility Checker**: See which schemes you qualify for

### 👨‍⚠️ Officer Dashboard
- **Escalation Management**: Handle escalated queries with priority levels
- **Response Tracking**: Manage and respond to farmer escalations
- **Assignment System**: Track assigned cases and workload
- **Performance Metrics**: Monitor response times and satisfaction ratings

### 👨‍💼 Admin Dashboard
- **System Overview**: Monitor total users, queries, and system health
- **Scheme Management**: Create, edit, and manage government schemes
- **Analytics**: Query statistics, device breakdowns, satisfaction ratings
- **System Settings**: Configuration and maintenance options

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API server running on http://localhost:5000
- MongoDB database connection

### Installation

1. **Clone/Extract the Frontend Files**
   ```bash
   cd frontend
   ```

2. **Configure API Endpoint** (if different from default)
   Edit `assets/js/api.js` and update the `BASE_URL`:
   ```javascript
   const BASE_URL = 'http://localhost:5000/api';
   ```

3. **Start Local Server** (optional, for production deployment)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

4. **Access the Application**
   - Landing Page: `index.html`
   - Login: `pages/login-enhanced.html`
   - Register: `pages/register-enhanced.html`

## 📱 Pages & Features

### Landing Page (`index.html`)
- Feature overview with icons and descriptions
- Call-to-action buttons for login/register
- Statistics and benefits highlights
- Responsive layout

### Authentication Pages
- **Login** (`pages/login-enhanced.html`): Email/password authentication
- **Register** (`pages/register-enhanced.html`): Multi-step registration with validation

### Farmer Dashboard (`pages/farmer-dashboard-enhanced.html`)
#### Submit Query Tab
- Query type selection (text, voice, image)
- Detailed context capture
- Image upload for analysis
- Real-time character counter

#### My Queries Tab
- Paginated query list
- Status filtering and search
- AI response display
- Escalation options

#### Weather Tab
- City/state weather search
- Current weather grid display
- 5-day forecast view
- Agricultural-specific insights

#### Market Prices Tab
- Crop and region search
- Real-time price table
- Price comparison

#### Schemes Tab
- Scheme search functionality
- Featured schemes display
- Detailed scheme information

### Officer Dashboard (`pages/officer-dashboard.html`)
- Escalation list with priority indicators
- Response submission modal
- Status update functionality
- Assignment tracking

### Admin Dashboard (`pages/admin-dashboard.html`)
- System metrics and KPIs
- Scheme management interface
- Analytics and reports
- Configuration settings

## 🎨 Design System

### Color Scheme
- **Primary Green**: `#2ecc71` - Main actions and highlights
- **Secondary Blue**: `#3498db` - Secondary actions
- **Danger Red**: `#e74c3c` - Error states
- **Warning Orange**: `#f39c12` - Warnings

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Responsive Sizes**: Scales from mobile to desktop

### Components
- Buttons with hover states
- Form inputs with validation feedback
- Cards with shadow effects
- Alerts with automatic dismissal
- Modals for detailed views
- Loading spinners and states

## 🔌 API Integration

### Key API Endpoints Used

```javascript
// Authentication
POST   /auth/register              // Create new account
POST   /auth/login                 // Login user
POST   /auth/refresh-token         // Refresh token
GET    /auth/me                    // Get current user

// Queries
POST   /queries                    // Submit new query
GET    /queries                    // List user queries
GET    /queries/:id                // Get query details
POST   /queries/:id/escalate       // Escalate query
POST   /queries/:id/feedback       // Add feedback

// Media
POST   /media/upload               // Upload images/audio

// Weather
GET    /weather/current            // Current weather
GET    /weather/forecast           // 5-day forecast

// Market
GET    /market/prices              // Get commodity prices

// Schemes
GET    /schemes                    // List schemes
GET    /schemes/:id                // Get scheme details
GET    /schemes/search             // Search schemes

// Escalations
GET    /escalations                // List escalations
POST   /escalations                // Create escalation
PATCH  /escalations/:id/status     // Update status
```

## 🛠️ JavaScript Files

### `api.js`
Complete API client wrapper with methods for all endpoints:
- Handles authentication and token management
- Automatic Bearer token injection
- Error handling and retry logic
- FormData support for file uploads

### `app.js`
Main application controller:
- Tab switching and navigation
- Form validation and submission
- Data loading and refresh
- Modal management
- Alert display
- Event listeners setup

### `enhanced-styles.css`
Comprehensive styling system:
- Responsive grid layouts
- Component styles (cards, buttons, forms)
- Animation keyframes
- Mobile breakpoints
- Theme variables

## 💾 Local Storage

The app uses browser localStorage for:
- **token**: JWT authentication token
- **refreshToken**: Token refresh credentials
- **rememberEmail**: Saved email for login convenience
- **userPreferences**: Language and notification settings

## 🔐 Security Features

✅ **Password Security**
- Minimum 8 characters required
- Upper/lowercase validation
- Number validation
- Real-time strength indicator

✅ **Token Management**
- JWT tokens with expiration
- Automatic token refresh
- Secure token storage

✅ **Input Validation**
- Client-side validation
- Email format validation
- Phone number validation
- File type restrictions

✅ **Error Handling**
- Graceful error messages
- User-friendly notifications
- Automatic retry logic

## 📊 Data Flow

```
User Input
    ↓
Form Validation
    ↓
API Request
    ↓
Authentication Check
    ↓
Loading State
    ↓
API Response
    ↓
UI Update
    ↓
Success/Error Alert
```

## 🎯 Demo Account Credentials

Test the system with these demo accounts:

```
👨‍🌾 FARMER
Email: farmer@example.com
Password: FarmerPass123

👮 OFFICER
Email: officer@example.com
Password: OfficerPass123

👨‍💼 ADMIN
Email: admin@example.com
Password: AdminPass123
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (full grid)

## 🚀 Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)
1. Build is static HTML/CSS/JS - no compilation needed
2. Update `BASE_URL` in `api.js` to production backend URL
3. Deploy the `frontend` folder
4. Configure CORS on backend to accept frontend origin

### Custom Server
1. Serve files from a web server (nginx, Apache)
2. Update API endpoint configuration
3. Enable gzip compression for performance
4. Set cache headers appropriately

### Environment Variables (Optional)
Create `config.js`:
```javascript
const CONFIG = {
  API_URL: process.env.API_URL || 'http://localhost:5000/api',
  LANGUAGE: 'en',
  DEFAULT_REGION: 'Punjab'
};
```

## 🐛 Troubleshooting

### **Login not working**
- ✅ Check backend is running on port 5000
- ✅ Verify credentials in demo section
- ✅ Check browser console for CORS errors
- ✅ Clear localStorage and try again

### **Images not uploading**
- ✅ Check file size (max 10MB for images)
- ✅ Verify Cloudinary credentials on backend
- ✅ Check browser file upload permissions

### **Weather/Market data not loading**
- ✅ Verify OpenWeatherMap API key on backend
- ✅ Check city name spelling
- ✅ Ensure internet connection

### **Responsive layout issues**
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Hard refresh (Ctrl+F5)
- ✅ Check browser zoom level (should be 100%)

## 📚 Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome | ✅ Full | 90+ |
| Firefox | ✅ Full | 88+ |
| Safari | ✅ Full | 14+ |
| Edge | ✅ Full | 90+ |
| Mobile Chrome | ✅ Full | Latest |
| Mobile Safari | ✅ Full | Latest |

## 🔄 Auto-Refresh Features

- **Query List**: Refreshes every 30 seconds
- **Weather Data**: Manual refresh available
- **Market Prices**: Manual refresh available
- **Token**: Auto-refreshes 1 minute before expiry

## 🎓 Learning Resources

- HTML5 & CSS3 Modern Practices
- Responsive Design Principles
- JavaScript ES6+ Async/Await
- RESTful API Integration
- Form Validation Patterns
- UX/UI Best Practices

## 📞 Support & Issues

For issues or feature requests:
1. Check the troubleshooting section
2. Review console errors (F12 → Console)
3. Check backend API logs
4. Verify network requests in DevTools (Network tab)

## 📝 Notes

- **Language Support**: Currently configured for English, ready for multilingual expansion
- **Accessibility**: WCAG 2.1 Level AA compliance in progress
- **Performance**: Optimized bundle size, lazy loading ready
- **PWA Ready**: Can be converted to Progressive Web App
- **Offline Support**: Foundation ready for service worker integration

## 🎉 Version History

### v2.0 - Enhanced UI/UX (Current)
- ✨ Complete redesign with modern styling
- 🔄 Real-time validation and feedback
- 📱 Full mobile responsiveness
- 🚀 Performance optimizations
- 🎯 Improved user onboarding

### v1.0 - Initial Release
- Basic authentication
- Query submission
- Dashboard views
- API integration

---

**Last Updated**: May 24, 2026  
**Status**: ✅ Production Ready  
**Maintenance**: Active Development
