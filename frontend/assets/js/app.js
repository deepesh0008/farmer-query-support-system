/**
 * Enhanced Frontend Application
 * Farmer Query Support System
 */

class FarmerApp {
  constructor() {
    this.api = new APIClient();
    this.currentUser = null;
    this.isLoading = false;
    this.currentLanguage = 'en';
    this.initializeApp();
  }

  initializeApp() {
    this.setupEventListeners();
    this.loadUserData();
    this.setupAutoRefresh();
  }

  setupEventListeners() {
    // Submit Query Form
    const queryForm = document.getElementById('queryForm');
    if (queryForm) {
      queryForm.addEventListener('submit', (e) => this.handleQuerySubmit(e));
    }

    // Tab switching
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Real-time form validation
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('change', (e) => this.validateField(e.target));
      field.addEventListener('input', (e) => this.validateField(e.target));
    });

    // Search and filter functionality
    document.querySelectorAll('[data-search]').forEach(input => {
      input.addEventListener('input', (e) => this.handleSearch(e));
    });
  }

  async loadUserData() {
    try {
      const user = this.api.getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.updateUserGreeting();
        this.loadDashboardData();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  updateUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    if (greeting && this.currentUser) {
      const firstName = this.currentUser.profile?.firstName || 'User';
      greeting.textContent = `👋 Welcome, ${firstName}!`;
    }
  }

  async loadDashboardData() {
    if (this.currentUser.role === 'farmer') {
      await this.loadFarmerQueries();
    } else if (this.currentUser.role === 'officer') {
      await this.loadEscalatedQueries();
    } else if (this.currentUser.role === 'admin') {
      await this.loadAdminMetrics();
    }
  }

  async handleQuerySubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm(e.target)) {
      this.showAlert('Please fill all required fields correctly', 'error');
      return;
    }

    this.isLoading = true;
    this.showLoadingState('queryForm', true);

    try {
      const formData = new FormData(e.target);
      const queryData = {
        queryType: formData.get('queryType'),
        originalQuery: formData.get('query'),
        context: {
          cropType: formData.get('cropType'),
          season: formData.get('season'),
          symptoms: formData.get('symptoms'),
          symptomsDuration: formData.get('symptomsDuration'),
          affectedArea: formData.get('affectedArea') || 'not-specified'
        }
      };

      // Handle file upload
      const imageFile = formData.get('image');
      if (imageFile) {
        const uploadedMedia = await this.api.uploadMedia(imageFile);
        queryData.media = {
          imageUrl: uploadedMedia.url,
          imagePublicId: uploadedMedia.public_id
        };
      }

      const response = await this.api.createQuery(queryData);
      
      this.showAlert('✅ Query submitted successfully! Our experts will respond soon.', 'success');
      e.target.reset();
      
      // Refresh queries list
      setTimeout(() => this.loadFarmerQueries(), 2000);
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.isLoading = false;
      this.showLoadingState('queryForm', false);
    }
  }

  async loadFarmerQueries() {
    try {
      const queries = await this.api.listQueries();
      const queriesList = document.getElementById('queriesList');
      
      if (!queries || queries.length === 0) {
        queriesList.innerHTML = '<p class="empty-state">📋 No queries yet. Submit your first query!</p>';
        return;
      }

      queriesList.innerHTML = queries.map(query => `
        <div class="query-card" data-query-id="${query._id}">
          <div class="query-header">
            <div class="query-info">
              <span class="query-type-badge ${query.queryType}">${query.queryType.toUpperCase()}</span>
              <span class="status-badge status-${query.status}">${query.status.toUpperCase()}</span>
            </div>
            <span class="query-date">${new Date(query.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div class="query-content">
            <p class="query-text">${query.originalQuery.substring(0, 100)}...</p>
            <div class="query-meta">
              <span><i class="fas fa-leaf"></i> ${query.context.cropType}</span>
              <span><i class="fas fa-calendar"></i> ${query.context.season || 'N/A'}</span>
            </div>
          </div>

          ${query.aiResponse?.primaryResponse ? `
            <div class="ai-response">
              <h4>💡 AI Response:</h4>
              <p>${query.aiResponse.primaryResponse.substring(0, 150)}...</p>
            </div>
          ` : '<p class="processing">⏳ Response being generated...</p>'}

          <div class="query-actions">
            <button class="btn btn-small" onclick="app.viewQueryDetails('${query._id}')">
              <i class="fas fa-eye"></i> View Details
            </button>
            ${query.status !== 'resolved' ? `
              <button class="btn btn-small btn-danger" onclick="app.escalateQuery('${query._id}')">
                <i class="fas fa-arrow-up"></i> Escalate
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading queries:', error);
    }
  }

  async loadEscalatedQueries() {
    try {
      const escalations = await this.api.listEscalations();
      const escalationsList = document.getElementById('escalationsList');
      
      if (!escalations || escalations.length === 0) {
        escalationsList.innerHTML = '<p class="empty-state">📌 No escalated queries</p>';
        return;
      }

      escalationsList.innerHTML = escalations.map(esc => `
        <div class="escalation-card" data-escalation-id="${esc._id}">
          <div class="escalation-header">
            <div class="priority-badge priority-${esc.priority}">${esc.priority.toUpperCase()}</div>
            <span class="status-badge status-${esc.status}">${esc.status.toUpperCase()}</span>
          </div>
          <p class="escalation-reason">${esc.reason}</p>
          <div class="escalation-actions">
            <button class="btn btn-small" onclick="app.respondToEscalation('${esc._id}')">
              <i class="fas fa-reply"></i> Respond
            </button>
            <button class="btn btn-small" onclick="app.updateEscalationStatus('${esc._id}')">
              <i class="fas fa-check"></i> Update Status
            </button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading escalations:', error);
    }
  }

  async handleWeatherSearch() {
    const city = document.getElementById('weatherCity')?.value;
    if (!city) {
      this.showAlert('Please enter a city name', 'error');
      return;
    }

    this.showLoadingState('weatherInfo', true);
    try {
      const response = await this.api.getCurrentWeather(city);
      const weather = response.data || response;
      this.lastWeather = weather;
      const weatherDetails = document.getElementById('weatherDetails');
      
      weatherDetails.innerHTML = `
        <div class="weather-grid">
          <div class="weather-item">
            <i class="fas fa-thermometer"></i>
            <span class="label">Temperature</span>
            <span class="value">${weather.main.temp}°C</span>
          </div>
          <div class="weather-item">
            <i class="fas fa-droplet"></i>
            <span class="label">Humidity</span>
            <span class="value">${weather.main.humidity}%</span>
          </div>
          <div class="weather-item">
            <i class="fas fa-wind"></i>
            <span class="label">Wind Speed</span>
            <span class="value">${weather.wind.speed} m/s</span>
          </div>
          <div class="weather-item">
            <i class="fas fa-cloud"></i>
            <span class="label">Condition</span>
            <span class="value">${weather.weather[0].description}</span>
          </div>
        </div>
      `;
      
      document.getElementById('weatherInfo').style.display = 'block';
      this.showAlert('✅ Weather data loaded', 'success');

      // Fetch and render forecast details
      const lat = weather.coord?.lat;
      const lon = weather.coord?.lon;
      if (lat && lon) {
        try {
          const forecastResponse = await this.api.getWeatherForecast(lat, lon);
          const forecastData = forecastResponse.data || forecastResponse;
          this.renderWeatherForecast(forecastData);
        } catch (fErr) {
          console.error("Forecast load failed:", fErr);
        }
      }
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.showLoadingState('weatherInfo', false);
    }
  }

  renderWeatherForecast(forecastData) {
    const list = forecastData.list || [];
    if (!list || list.length === 0) return;

    // Filter to get one forecast per day (e.g., around 12:00 PM)
    const dailyForecasts = [];
    const seenDates = new Set();
    const todayStr = new Date().toLocaleDateString();

    for (const item of list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.getHours();

      // Skip today and pick forecasts around midday (11am-2pm)
      if (dateStr !== todayStr && !seenDates.has(dateStr)) {
        if (timeStr >= 11 && timeStr <= 14) {
          dailyForecasts.push(item);
          seenDates.add(dateStr);
        }
      }
    }

    // Fallback: if no midday points, just pick every 8th item (24 hours apart)
    if (dailyForecasts.length === 0) {
      for (let i = 4; i < list.length; i += 8) {
        dailyForecasts.push(list[i]);
      }
    }

    // Render daily forecast cards
    const forecastDetails = document.getElementById('forecastDetails');
    const forecastInfo = document.getElementById('forecastInfo');
    
    if (forecastDetails && forecastInfo) {
      forecastDetails.innerHTML = dailyForecasts.slice(0, 5).map(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateNum = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        return `
          <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 1rem; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h4 style="margin: 0; color: var(--text-dark);">${dayName}</h4>
            <span style="font-size: 0.8rem; color: #7f8c8d;">${dateNum}</span>
            <div style="font-size: 2.2rem; margin: 0.4rem 0;">
              <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width: 50px; height: 50px; display: inline-block; vertical-align: middle;" />
            </div>
            <strong style="font-size: 1.25rem; color: #2c3e50;">${temp}°C</strong>
            <p style="font-size: 0.8rem; color: #7f8c8d; text-transform: capitalize; margin: 0.3rem 0 0;">${desc}</p>
          </div>
        `;
      }).join('');
      forecastInfo.style.display = 'block';
    }

    // Generate Agronomic Weather Guidelines
    const city = document.getElementById('weatherCity')?.value;
    this.generateWeatherGuidelines(dailyForecasts, city, this.lastWeather, forecastData);
  }

  async generateWeatherGuidelines(dailyForecasts, city, weatherData, forecastData) {
    let guidelinesList = null;

    // Try calling the backend AI weather advisory endpoint
    if (city && weatherData && forecastData) {
      try {
        const response = await this.api.getWeatherAdvisory(city, weatherData, forecastData);
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
          guidelinesList = response.data;
        }
      } catch (err) {
        console.warn("AI Weather Advisory failed, using hardcoded fallback:", err);
      }
    }

    // Fallback: If AI fails or has no key, use existing premium rules
    if (!guidelinesList) {
      let rainDays = 0;
      let highTempDays = 0;
      let highHumidityDays = 0;
      let highWindDays = 0;

      for (const item of dailyForecasts) {
        if (item.weather[0].main.toLowerCase().includes('rain')) rainDays++;
        if (item.main.temp > 35) highTempDays++;
        if (item.main.humidity > 80) highHumidityDays++;
        if (item.wind.speed > 5) highWindDays++;
      }

      guidelinesList = [];
      
      // Add specific recommendations
      if (rainDays > 0) {
        guidelinesList.push({
          icon: '🌧️',
          title: 'Rain Forecasted Advice',
          text: `Expect rain on ${rainDays} upcoming days. <strong>Postpone any planned fertilizer applications and chemical sprayings</strong> as they will get washed away. Ensure drainage channels in clayey fields are clear to prevent waterlogging.`,
          color: '#3498db'
        });
      } else {
        guidelinesList.push({
          icon: '☀️',
          title: 'Dry Weather Field Prep',
          text: `Clear, sunny skies forecasted. This is the <strong>perfect window for weeding, harvesting mature crops, and applying fertilizers</strong>. Ensure normal morning/evening irrigation.`,
          color: '#f1c40f'
        });
      }

      if (highTempDays > 0) {
        guidelinesList.push({
          icon: '🔥',
          title: 'High Heat Alert',
          text: `Temperatures above 35°C expected. <strong>Increase irrigation frequency</strong> to avoid heat stress, especially for young seedlings and leafy vegetables. Water only during early morning or late evening. Apply mulching to retain soil moisture.`,
          color: '#e74c3c'
        });
      }

      if (highHumidityDays > 0) {
        guidelinesList.push({
          icon: '🍄',
          title: 'Fungal Favorable Risk',
          text: `High humidity (>80%) expected. These conditions are highly favorable for fungal pathogens. <strong>Inspect crops closely for early signs of leaf spots, blights, or powdery mildew</strong>. Prune congested branches to allow airflow.`,
          color: '#9b59b6'
        });
      }

      if (highWindDays > 0) {
        guidelinesList.push({
          icon: '💨',
          title: 'Strong Winds Support',
          text: `Wind speeds exceeding 5 m/s forecasted. <strong>Secure tall crops like maize, sugarcane, and young saplings</strong> to prevent lodging/wind-snap. Avoid tall sprinkler irrigations.`,
          color: '#7f8c8d'
        });
      }

      // Default general advice
      guidelinesList.push({
        icon: '💡',
        title: 'General Crop Practice',
        text: `Monitor daily moisture levels. Keep a regular weeding schedule to prevent nutrient theft, and keep an eye on AgriBot for any pest alarms!`,
        color: '#2ecc71'
      });
    }

    // Injected Card container for Guidelines
    let guidelinesCard = document.getElementById('weatherGuidelinesCard');
    if (!guidelinesCard) {
      guidelinesCard = document.createElement('div');
      guidelinesCard.id = 'weatherGuidelinesCard';
      guidelinesCard.className = 'card';
      guidelinesCard.style.marginTop = '1rem';
      document.getElementById('weatherTab').appendChild(guidelinesCard);
    }

    guidelinesCard.innerHTML = `
      <h3 style="color: var(--text-dark); margin-bottom: 1.2rem;"><i class="fas fa-robot" style="color: #2ecc71;"></i> AI 7-Day Agronomy & Weather Guidelines</h3>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${guidelinesList.map(g => `
          <div style="display: flex; gap: 1rem; padding: 1.2rem; background: rgba(248, 249, 250, 0.9); border-radius: 12px; border-left: 5px solid ${g.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.01);">
            <div style="font-size: 2rem; display: flex; align-items: center;">${g.icon}</div>
            <div>
              <h4 style="margin: 0 0 0.3rem 0; color: #2c3e50; font-size: 1.05rem; font-weight: 700;">${g.title}</h4>
              <p style="margin: 0; font-size: 0.92rem; color: #555; line-height: 1.5;">${g.text}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    guidelinesCard.style.display = 'block';
  }

  async handleMarketPrices() {
    const crop = document.getElementById('marketCrop')?.value;
    const state = document.getElementById('marketState')?.value;

    if (!crop) {
      this.showAlert('Please enter crop name', 'error');
      return;
    }

    this.showLoadingState('marketInfo', true);
    try {
      const response = await this.api.getMarketPrices({ crop, state });
      const list = response.data || (Array.isArray(response) ? response : []);
      const marketInfo = document.getElementById('marketInfo');
      
      if (!list || list.length === 0) {
        marketInfo.innerHTML = '<p class="empty-state">No prices found matching your search.</p>';
      } else {
        marketInfo.innerHTML = `
          <div class="prices-table">
            ${list.map(p => `
              <div class="price-row">
                <span class="crop-name" style="text-transform: capitalize;">🌾 ${p.crop}</span>
                <span class="price-info">
                  <strong>₹${p.price || p.pricePerQuintal}</strong> <small>/ ${p.unit || 'INR/Quintal'}</small>
                </span>
                <span class="market-info"><i class="fas fa-map-marker-alt"></i> ${p.market} (${p.state || ''})</span>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      document.getElementById('marketInfo').style.display = 'block';
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.showLoadingState('marketInfo', false);
    }
  }

  async handleSearchSchemes() {
    const query = document.getElementById('schemeSearch')?.value;
    
    if (!query || query.length < 2) {
      this.showAlert('Enter at least 2 characters', 'info');
      return;
    }

    this.showLoadingState('schemesList', true);
    try {
      const schemes = await this.api.searchSchemes(query);
      const schemesList = document.getElementById('schemesList');
      
      schemesList.innerHTML = schemes.map(scheme => `
        <div class="scheme-card">
          <h3>${scheme.schemeName}</h3>
          <p>${scheme.description}</p>
          <div class="scheme-badges">
            <span class="badge">${scheme.govtLevel}</span>
            <span class="badge">${scheme.schemeType}</span>
          </div>
          <button class="btn btn-small" onclick="app.viewSchemeDetails('${scheme._id}')">
            Learn More
          </button>
        </div>
      `).join('');
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.showLoadingState('schemesList', false);
    }
  }

  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    // Remove active class from sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });

    // Convert kebab-case (e.g., image-analysis) to camelCase (e.g., imageAnalysis)
    const camelTabName = tabName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    // Show selected tab
    const tabId = `${camelTabName}Tab`;
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.style.display = 'block';
    }

    // Add active class to clicked item safely
    document.querySelector(`.sidebar-item[data-tab="${tabName}"]`)?.classList.add('active');

    // Load tab data
    if (tabName === 'queries') this.loadFarmerQueries();
    if (tabName === 'escalations') this.loadEscalatedQueries();
  }

  validateField(field) {
    const rules = {
      email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      password: (val) => val.length >= 8,
      phoneNumber: (val) => /^\d{10}$/.test(val),
      query: (val) => val.length >= 10,
      cropType: (val) => val.length >= 2,
    };

    if (rules[field.name]) {
      const isValid = rules[field.name](field.value);
      field.classList.toggle('is-valid', isValid);
      field.classList.toggle('is-invalid', !isValid && field.value);
      return isValid;
    }
    return true;
  }

  validateForm(form) {
    const fields = form.querySelectorAll('[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;

    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.style.display='none'" class="close-btn">&times;</button>
    `;
    alertDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 5000);
  }

  showLoadingState(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (isLoading) {
      element.classList.add('loading');
      element.style.opacity = '0.6';
    } else {
      element.classList.remove('loading');
      element.style.opacity = '1';
    }
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll('[data-searchable]');

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? 'block' : 'none';
    });
  }

  async viewQueryDetails(queryId) {
    try {
      const query = await this.api.getQuery(queryId);
      this.showModal('queryModal', this.renderQueryDetails(query));
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    }
  }

  renderQueryDetails(query) {
    return `
      <div class="modal-header">
        <h2>Query Details</h2>
      </div>
      <div class="modal-content">
        <div class="detail-section">
          <h3>Query Information</h3>
          <p><strong>Type:</strong> ${query.queryType}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${query.status}">${query.status}</span></p>
          <p><strong>Date:</strong> ${new Date(query.createdAt).toLocaleString()}</p>
          <p><strong>Crop:</strong> ${query.context.cropType}</p>
          <p><strong>Season:</strong> ${query.context.season || 'N/A'}</p>
        </div>

        ${query.aiResponse?.primaryResponse ? `
          <div class="detail-section">
            <h3>AI Response</h3>
            <p>${query.aiResponse.primaryResponse}</p>
            ${query.aiResponse.multilingualResponse?.hindi ? `
              <p><strong>हिंदी में:</strong> ${query.aiResponse.multilingualResponse.hindi}</p>
            ` : ''}
          </div>
        ` : ''}

        ${query.feedback ? `
          <div class="detail-section">
            <h3>Feedback</h3>
            <p><strong>Rating:</strong> ${'⭐'.repeat(query.feedback.rating)}</p>
            <p><strong>Notes:</strong> ${query.feedback.farmerNotes || 'N/A'}</p>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Close</button>
      </div>
    `;
  }

  async escalateQuery(queryId) {
    const reason = prompt('Why do you need to escalate this query?');
    if (!reason) return;

    try {
      await this.api.escalateQuery(queryId, { reason });
      this.showAlert('✅ Query escalated successfully', 'success');
      this.loadFarmerQueries();
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    }
  }

  setupAutoRefresh() {
    // Refresh data every 30 seconds
    setInterval(() => {
      if (this.currentUser?.role === 'farmer') {
        this.loadFarmerQueries();
      }
    }, 30000);
  }

  showModal(modalId, content) {
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal-content-wrapper">
        ${content}
      </div>
    `;
    modal.style.display = 'block';
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FarmerApp();
});

// Helper functions for HTML onclick handlers
function switchTab(tab) {
  window.app?.switchTab(tab);
}

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
    window.app.api.logout();
    window.location.href = 'login-enhanced.html';
  });
}

function refreshQueries() {
  window.app?.loadFarmerQueries();
}

function getWeather() {
  window.app?.handleWeatherSearch();
}

function getMarketPrices() {
  window.app?.handleMarketPrices();
}

function searchSchemes() {
  window.app?.handleSearchSchemes();
}
