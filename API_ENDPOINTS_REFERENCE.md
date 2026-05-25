# 🔌 API Endpoints Reference - Frontend Integration

## Backend API Endpoints Used by Enhanced Frontend

### Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register New User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "farmer@example.com",
  "password": "SecurePass123",
  "phoneNumber": "9876543210",
  "role": "farmer",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "address": {
    "state": "Punjab"
  }
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "64f3c...",
    "email": "farmer@example.com",
    "role": "farmer"
  }
}
```

### 2. Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "farmer@example.com",
  "password": "FarmerPass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "userId": "64f3c...",
      "email": "farmer@example.com",
      "role": "farmer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

### 3. Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 4. Get Current User
```
GET /auth/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "userId": "64f3c...",
    "email": "farmer@example.com",
    "role": "farmer",
    "profile": {...}
  }
}
```

---

## 📝 Query Endpoints

### 1. Create Query
```
POST /queries
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "queryType": "text",           // text, voice, or image
  "originalQuery": "My crop has brown spots",
  "context": {
    "cropType": "Wheat",
    "season": "Winter",
    "symptoms": "Brown spots on leaves",
    "symptomDuration": "2 weeks"
  },
  "media": {
    "imageUrl": "https://cloudinary.com/...",  // optional
    "voiceUrl": "https://cloudinary.com/..."   // optional
  }
}

Response (201):
{
  "success": true,
  "data": {
    "queryId": "64f3c...",
    "farmerId": "64f3c...",
    "queryType": "text",
    "originalQuery": "My crop has brown spots",
    "status": "pending",
    "createdAt": "2026-05-24T10:30:00Z"
  }
}
```

### 2. List User Queries
```
GET /queries
Authorization: Bearer {token}
Query Parameters:
  - status: pending, answered, escalated, resolved (optional)
  - page: 1 (optional)
  - limit: 10 (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "queryId": "64f3c...",
      "queryType": "text",
      "originalQuery": "My crop has brown spots",
      "status": "answered",
      "createdAt": "2026-05-24T10:30:00Z",
      "aiResponse": {
        "status": "completed",
        "primaryResponse": "This appears to be leaf spot disease...",
        "confidence": 0.95
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2
  }
}
```

### 3. Get Query Details
```
GET /queries/:queryId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "queryId": "64f3c...",
    "farmerId": "64f3c...",
    "queryType": "text",
    "originalQuery": "My crop has brown spots",
    "context": {
      "cropType": "Wheat",
      "season": "Winter",
      "symptoms": "Brown spots on leaves",
      "symptomDuration": "2 weeks"
    },
    "status": "answered",
    "aiResponse": {
      "status": "completed",
      "primaryResponse": "This appears to be leaf spot disease...",
      "confidence": 0.95,
      "recommendations": ["Spray fungicide", "Remove infected leaves"],
      "multilingualResponse": {
        "hi": "यह पत्ती धब्बा रोग प्रतीत होता है...",
        "pa": "ਇਹ ਪੱਤੀ ਦਾ ਕਲੇਗ ਰੋਗ ਲਗਦਾ ਹੈ..."
      }
    },
    "createdAt": "2026-05-24T10:30:00Z"
  }
}
```

### 4. Add Query Feedback
```
POST /queries/:queryId/feedback
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "rating": 5,                    // 1-5 stars
  "helpful": true,
  "corrections": "Very helpful advice, worked well"
}

Response (200):
{
  "success": true,
  "message": "Feedback added successfully"
}
```

### 5. Escalate Query
```
POST /queries/:queryId/escalate
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "reason": "Need expert opinion on disease",
  "priority": "high"              // low, medium, high, urgent
}

Response (201):
{
  "success": true,
  "data": {
    "escalationId": "64f3c...",
    "queryId": "64f3c...",
    "status": "open"
  }
}
```

---

## 🌤️ Weather Endpoints

### 1. Get Current Weather
```
GET /weather/current
Query Parameters:
  - city: "Ludhiana"              (required)
  - state: "Punjab"               (optional)

Response (200):
{
  "success": true,
  "data": {
    "city": "Ludhiana",
    "state": "Punjab",
    "temperature": 28.5,
    "humidity": 65,
    "windSpeed": 12.3,
    "condition": "Partly Cloudy",
    "conditionIcon": "partly-cloudy",
    "feelsLike": 27.8,
    "pressure": 1013,
    "visibility": 10,
    "uvIndex": 7,
    "timestamp": "2026-05-24T10:30:00Z"
  }
}
```

### 2. Get Weather Forecast
```
GET /weather/forecast
Query Parameters:
  - city: "Ludhiana"              (required)
  - days: 5                       (optional, default 5)

Response (200):
{
  "success": true,
  "data": {
    "city": "Ludhiana",
    "forecast": [
      {
        "date": "2026-05-25",
        "maxTemp": 32,
        "minTemp": 22,
        "condition": "Sunny",
        "humidity": 50,
        "windSpeed": 10,
        "precipitationChance": 10,
        "agriculturalAdvice": "Good day for planting"
      },
      {
        "date": "2026-05-26",
        "maxTemp": 30,
        "minTemp": 21,
        "condition": "Rainy",
        "humidity": 75,
        "windSpeed": 15,
        "precipitationChance": 80,
        "agriculturalAdvice": "Delay irrigation"
      }
    ]
  }
}
```

---

## 💰 Market Endpoints

### 1. Get Market Prices
```
GET /market/prices
Query Parameters:
  - crop: "Wheat"                 (optional)
  - state: "Punjab"               (optional)
  - limit: 10                     (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "priceId": "64f3c...",
      "crop": "Wheat",
      "state": "Punjab",
      "market": "Ludhiana Mandi",
      "price": 2450,
      "unit": "₹/quintal",
      "minPrice": 2400,
      "maxPrice": 2500,
      "date": "2026-05-24T10:30:00Z",
      "trend": "up",
      "change": 50
    },
    {
      "priceId": "64f3c...",
      "crop": "Rice",
      "state": "Punjab",
      "market": "Amritsar Mandi",
      "price": 3200,
      "unit": "₹/quintal",
      "minPrice": 3150,
      "maxPrice": 3250,
      "date": "2026-05-24T10:30:00Z",
      "trend": "stable",
      "change": 0
    }
  ]
}
```

---

## 📄 Scheme Endpoints

### 1. List Schemes
```
GET /schemes
Query Parameters:
  - govtLevel: "national"         (optional: national, state, district)
  - page: 1                       (optional)
  - limit: 10                     (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "schemeId": "64f3c...",
      "schemeName": "PM-KISAN",
      "description": "Direct income support to farmers",
      "govtLevel": "national",
      "schemeType": "income-support",
      "benefits": {
        "monthlyAmount": 2000,
        "eligibility": "All farmers"
      },
      "applicationProcess": "Online at pmkisan.gov.in",
      "contactInfo": "1800-181-3022",
      "active": true
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

### 2. Get Scheme Details
```
GET /schemes/:schemeId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "schemeId": "64f3c...",
    "schemeName": "PM-KISAN",
    "description": "Direct income support to farmers",
    "govtLevel": "national",
    "schemeType": "income-support",
    "benefits": {
      "monthlyAmount": 2000,
      "eligibility": "All farmers"
    },
    "applicationProcess": "Online at pmkisan.gov.in",
    "documents": ["Aadhar", "Land deed", "Bank account"],
    "contactInfo": "1800-181-3022",
    "officialWebsite": "https://pmkisan.gov.in",
    "active": true,
    "createdAt": "2026-05-24T10:30:00Z"
  }
}
```

### 3. Search Schemes
```
GET /schemes/search
Query Parameters:
  - query: "income"               (optional)
  - schemeType: "income-support"  (optional)

Response (200):
{
  "success": true,
  "data": [
    // Scheme objects matching query
  ]
}
```

---

## 📤 Media Upload Endpoint

### 1. Upload Image/Audio
```
POST /media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
- file: {file object}             (required, max 10MB)
- type: "image" or "audio"        (required)

Response (201):
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/image/upload/...",
    "publicId": "farmer-query-support/...",
    "format": "jpg",
    "size": 2048576,
    "uploadedAt": "2026-05-24T10:30:00Z"
  }
}
```

---

## 👨‍⚖️ Escalation Endpoints (Officer)

### 1. List Escalations
```
GET /escalations
Authorization: Bearer {token}
Query Parameters:
  - status: "open"                (optional)
  - priority: "high"              (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "escalationId": "64f3c...",
      "queryId": "64f3c...",
      "farmerId": "64f3c...",
      "reason": "Need expert opinion",
      "priority": "high",
      "status": "open",
      "createdAt": "2026-05-24T10:30:00Z"
    }
  ]
}
```

### 2. Assign Escalation
```
PATCH /escalations/:escalationId/assign
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "officerId": "64f3c..."
}

Response (200):
{
  "success": true,
  "data": {
    "escalationId": "64f3c...",
    "status": "assigned",
    "assignedOfficerId": "64f3c..."
  }
}
```

### 3. Update Escalation Status
```
PATCH /escalations/:escalationId/status
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "resolved",           // open, assigned, in_progress, resolved, closed
  "resolution": "Advised to use fungicide treatment"
}

Response (200):
{
  "success": true,
  "data": {
    "escalationId": "64f3c...",
    "status": "resolved"
  }
}
```

---

## ✅ Verification Checklist for Backend Team

### Authentication
- [ ] POST /auth/register works
- [ ] POST /auth/login returns token
- [ ] POST /auth/refresh-token refreshes token
- [ ] GET /auth/me returns current user
- [ ] JWT token validation working

### Queries
- [ ] POST /queries creates query
- [ ] GET /queries lists user queries
- [ ] GET /queries/:id returns details
- [ ] POST /queries/:id/feedback accepts feedback
- [ ] POST /queries/:id/escalate escalates query

### Weather
- [ ] GET /weather/current returns weather
- [ ] GET /weather/forecast returns forecast
- [ ] Handles missing city gracefully

### Market
- [ ] GET /market/prices returns prices
- [ ] Filtering by crop/state works
- [ ] Returns correct data format

### Schemes
- [ ] GET /schemes lists schemes
- [ ] GET /schemes/:id returns details
- [ ] GET /schemes/search searches by query
- [ ] Pagination works

### Media
- [ ] POST /media/upload accepts files
- [ ] File size validation works
- [ ] Returns Cloudinary URL

### Escalations
- [ ] GET /escalations lists escalations
- [ ] PATCH /escalations/:id/assign works
- [ ] PATCH /escalations/:id/status updates status

---

## 🧪 Sample Test Requests

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "farmer",
    "profile": {"firstName": "Test", "lastName": "User"},
    "address": {"state": "Punjab"}
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123"}'

# Get Weather
curl -X GET "http://localhost:5000/api/weather/current?city=Ludhiana"

# Get Market Prices
curl -X GET "http://localhost:5000/api/market/prices?crop=Wheat&state=Punjab"

# List Schemes
curl -X GET "http://localhost:5000/api/schemes"
```

---

## 📊 Response Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

## 🔑 Authentication Headers

All protected endpoints require:
```
Authorization: Bearer {token}
```

Where `{token}` is the JWT token received from login endpoint.

---

## 📝 Notes for Backend Team

1. **CORS Configuration**: Frontend runs on different port, ensure CORS is enabled
2. **Token Expiration**: Default 15 minutes, refresh token 7 days
3. **File Upload**: Max size 10MB, only images and audio
4. **Database**: All queries indexed for fast retrieval
5. **Error Messages**: Return user-friendly messages
6. **Validation**: Both client-side and server-side validation

---

## 🎯 Integration Status

✅ All endpoints referenced by frontend
✅ Request/response formats documented
✅ Sample requests provided
✅ Status codes documented
✅ Error handling guidelines included

**Frontend is ready for integration with verified backend!**

---

**Last Updated**: May 24, 2026
**Version**: 2.0
**Status**: ✅ Complete
