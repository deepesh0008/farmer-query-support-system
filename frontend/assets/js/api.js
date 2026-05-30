// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || 'API request failed' };
    }

    if (!response.ok) {
      if (response.status === 401 || data.message === 'Token has expired') {
        localStorage.clear();
        const isSubPage = window.location.pathname.includes('/pages/');
        window.location.href = isSubPage ? 'login-enhanced.html' : 'pages/login-enhanced.html';
        return new Promise(() => {}); // Halt execution to prevent showing raw alert
      }
      const err = new Error(data.message || 'API request failed');
      err.errors = data.errors;
      throw err;
    }
    return data;
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response && response.data) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    return response;
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Query endpoints
  async createQuery(queryData) {
    return this.request('/queries', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  }

  async listQueries(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/queries?${params}`);
  }

  async getQuery(queryId) {
    return this.request(`/queries/${queryId}`);
  }

  async addFeedback(queryId, feedbackData) {
    return this.request(`/queries/${queryId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async escalateQuery(queryId, escalationData) {
    return this.request(`/queries/${queryId}/escalate`, {
      method: 'POST',
      body: JSON.stringify(escalationData),
    });
  }

  // Media endpoints
  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/media/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }

  // Weather endpoints
  async getCurrentWeather(lat, lon, city, state) {
    // Robust check: if city name is passed as the first parameter (e.g., getCurrentWeather(city))
    if (typeof lat === 'string' && lon === undefined && city === undefined) {
      city = lat;
      lat = null;
    }

    const params = new URLSearchParams();
    if (lat && lon) {
      params.append('lat', lat);
      params.append('lon', lon);
    } else if (city) {
      params.append('city', city);
    } else if (state) {
      params.append('state', state);
    }
    return this.request(`/weather/current?${params}`);
  }

  async getWeatherForecast(lat, lon) {
    const params = new URLSearchParams({ lat, lon });
    return this.request(`/weather/forecast?${params}`);
  }

  async getWeatherAdvisory(city, weatherData, forecastData) {
    return this.request('/weather/advisory', {
      method: 'POST',
      body: JSON.stringify({ city, weatherData, forecastData })
    });
  }

  // Market endpoints
  async getMarketPrices(crop, state, market) {
    // If first argument is an object, extract parameters from it
    if (typeof crop === 'object' && crop !== null) {
      state = crop.state;
      market = crop.market;
      crop = crop.crop;
    }

    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (state) params.append('state', state);
    if (market) params.append('market', market);
    return this.request(`/market/prices?${params}`);
  }

  // Scheme endpoints
  async listSchemes(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/schemes?${params}`);
  }

  async getScheme(schemeId) {
    return this.request(`/schemes/${schemeId}`);
  }

  async searchSchemes(query) {
    const params = new URLSearchParams({ q: query });
    return this.request(`/schemes/search?${params}`);
  }

  // Escalation endpoints
  async createEscalation(escalationData) {
    return this.request('/escalations', {
      method: 'POST',
      body: JSON.stringify(escalationData),
    });
  }

  async listEscalations(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/escalations?${params}`);
  }

  async assignOfficer(escalationId, officerId) {
    return this.request(`/escalations/${escalationId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ officerId }),
    });
  }

  async updateEscalationStatus(escalationId, status) {
    return this.request(`/escalations/${escalationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async sendExpertMessage(expertName, specialty, message, history = []) {
    return this.request('/queries/expert-chat', {
      method: 'POST',
      body: JSON.stringify({ expertName, specialty, message, history }),
    });
  }
}

// Create global API client instance
const api = new APIClient();

// Helper function to check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

// Helper function to get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to logout
function showCustomConfirm(message, callback) {
  // Create modal container if not exists
  let modal = document.getElementById('customConfirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customConfirmModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      animation: confirmFadeIn 0.2s ease-out;
    `;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2.2rem 2rem;
      border-radius: 16px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      text-align: center;
      animation: confirmZoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.15);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    ">
      <div style="width: 64px; height: 64px; background: rgba(231, 76, 60, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; color: #e74c3c; font-size: 2rem;">
        <i class="fas fa-sign-out-alt"></i>
      </div>
      <h3 style="margin-top: 0; margin-bottom: 0.6rem; color: #2c3e50; font-size: 1.4rem; font-weight: 700;">Log Out?</h3>
      <p style="color: #7f8c8d; font-size: 1rem; line-height: 1.5; margin-top: 0; margin-bottom: 2rem;">${message}</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="confirmCancelBtn" style="
          padding: 0.8rem 1.5rem;
          border: 1px solid #dcdde1;
          background: #f8f9fa;
          color: #2f3640;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          font-size: 0.95rem;
        " onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='#f8f9fa'">Cancel</button>
        <button id="confirmOkBtn" style="
          padding: 0.8rem 1.5rem;
          border: none;
          background: #e74c3c;
          color: white;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
        " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Logout</button>
      </div>
    </div>
  `;

  if (!document.getElementById('confirmModalStyles')) {
    const style = document.createElement('style');
    style.id = 'confirmModalStyles';
    style.textContent = `
      @keyframes confirmFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes confirmZoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  modal.style.display = 'flex';

  const closeConfirm = () => {
    modal.style.display = 'none';
  };

  document.getElementById('confirmCancelBtn').onclick = closeConfirm;
  document.getElementById('confirmOkBtn').onclick = () => {
    closeConfirm();
    callback();
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeConfirm();
  };
}

function logout() {
  showCustomConfirm('Are you sure you want to logout of your session?', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'login-enhanced.html';
  });
}

// Protect pages - redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}
