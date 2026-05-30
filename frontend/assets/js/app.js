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

    // Expert Chat Form
    const expertChatForm = document.getElementById('expertChatForm');
    if (expertChatForm) {
      expertChatForm.addEventListener('submit', (e) => this.handleExpertChatSubmit(e));
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

    // Global window click to close profile dropdown
    window.addEventListener('click', (e) => {
      const card = document.getElementById('profileDropdownCard');
      const btn = document.getElementById('profileDropdownBtn');
      if (card && btn && !btn.contains(e.target) && !card.contains(e.target)) {
        card.style.display = 'none';
      }
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
    if (this.currentUser) {
      const profile = this.currentUser.profile || {};
      const firstName = profile.firstName || 'User';
      const lastName = profile.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Farmer User';
      const email = this.currentUser.email || 'farmer@email.com';
      const initials = ((profile.firstName?.[0] || 'F') + (profile.lastName?.[0] || 'U')).toUpperCase();

      // Update navbar greeting & avatar initials
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = firstName;

      const navAvatar = document.getElementById('navAvatar');
      if (navAvatar) navAvatar.textContent = initials;

      const dropdownAvatar = document.getElementById('dropdownAvatar');
      if (dropdownAvatar) dropdownAvatar.textContent = initials;

      const dropdownFullName = document.getElementById('dropdownFullName');
      if (dropdownFullName) dropdownFullName.textContent = fullName;

      const dropdownEmail = document.getElementById('dropdownEmail');
      if (dropdownEmail) dropdownEmail.textContent = email;
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
    const market = document.getElementById('marketCity')?.value;

    if (!crop) {
      this.showAlert('Please enter crop name', 'error');
      return;
    }

    this.showLoadingState('marketInfo', true);
    try {
      const response = await this.api.getMarketPrices({ crop, state, market });
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

  handleStateChange() {
    const state = document.getElementById('marketState')?.value;
    const citySelect = document.getElementById('marketCity');
    if (!citySelect) return;

    // Reset options
    citySelect.innerHTML = '<option value="">All Cities / Mandis</option>';

    const mandiMap = {
      'Delhi': ['Narela', 'Najafgarh', 'Ghazipur'],
      'Punjab': ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar', 'Bathinda'],
      'Haryana': ['Karnal', 'Ambala', 'Rohtak', 'Hisar', 'Sirsa'],
      'Uttar Pradesh': ['Kanpur', 'Hapur', 'Agra', 'Bareilly', 'Lucknow'],
      'Rajasthan': ['Jaipur', 'Alwar', 'Kota', 'Jodhpur', 'Sri Ganganagar'],
      'West Bengal': ['Kolkata', 'Siliguri', 'Burdwan'],
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara'],
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Belgaum'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy'],
      'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam']
    };

    if (state && mandiMap[state]) {
      mandiMap[state].forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = `${city} Mandi`;
        citySelect.appendChild(opt);
      });
    }
  }

  handleSchemeDropdownChange() {
    const select = document.getElementById('schemeSelect');
    const customContainer = document.getElementById('customSchemeSearchContainer');
    if (!select || !customContainer) return;

    if (select.value === 'custom_search') {
      customContainer.style.display = 'block';
    } else {
      customContainer.style.display = 'none';
      if (select.value) {
        this.handleSearchSchemes();
      }
    }
  }

  async handleSearchSchemes() {
    const select = document.getElementById('schemeSelect');
    if (!select) return;

    let query = '';
    if (select.value === 'custom_search') {
      query = document.getElementById('schemeSearchInput')?.value;
      if (!query || query.length < 2) {
        this.showAlert('Please enter at least 2 characters for custom scheme search', 'info');
        return;
      }
    } else {
      query = select.value;
    }

    if (!query) {
      this.showAlert('Please select or search for a government scheme', 'info');
      return;
    }

    this.showLoadingState('schemesList', true);
    try {
      const response = await this.api.searchSchemes(query);
      const schemes = response.data || (Array.isArray(response) ? response : []);
      const schemesList = document.getElementById('schemesList');
      
      if (!schemes || schemes.length === 0) {
        schemesList.innerHTML = `
          <div style="text-align: center; padding: 3rem 1.5rem; background: #fdfefe; border: 1px dashed var(--border); border-radius: 12px; width: 100%;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h4 style="color: var(--text-dark); margin-bottom: 0.5rem;">No direct matching scheme found</h4>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Click below to trigger a live AI search around the internet for "${query}"!</p>
            <button class="btn btn-primary" onclick="app.forceLiveSchemeHarvest('${query}')" style="margin: 0 auto; display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; border-radius: 8px;">
              <i class="fas fa-satellite-dish"></i> Try Deep Live AI Harvesting
            </button>
          </div>
        `;
        return;
      }

      schemesList.innerHTML = schemes.map(scheme => `
        <div class="scheme-card" style="position: relative; border-left: 5px solid var(--primary); padding: 1.5rem; border-radius: 8px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.06)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.03)';">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem; gap: 1rem; flex-wrap: wrap;">
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-dark);">${scheme.schemeName}</h3>
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 750; padding: 0.3rem 0.6rem; border-radius: 20px; background: rgba(46, 204, 113, 0.1); color: var(--primary); border: 1px solid rgba(46, 204, 113, 0.2); display: inline-flex; align-items: center; gap: 0.3rem;">
              <i class="fas fa-check-circle"></i> Live Status Verified
            </span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.2rem;">${scheme.description || 'No description available.'}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.2rem;">
            <span class="badge" style="background: rgba(52, 152, 219, 0.1); color: #2980b9; border: 1px solid rgba(52, 152, 219, 0.2); font-weight: 600;"><i class="fas fa-globe"></i> ${scheme.govtLevel?.toUpperCase() || 'CENTRAL'}</span>
            <span class="badge" style="background: rgba(155, 89, 182, 0.1); color: #8e44ad; border: 1px solid rgba(155, 89, 182, 0.2); font-weight: 600;"><i class="fas fa-tag"></i> ${scheme.schemeType?.toUpperCase() || 'BENEFIT'}</span>
            ${scheme.governmentDepartment ? `<span class="badge" style="background: rgba(241, 196, 15, 0.1); color: #d35400; border: 1px solid rgba(241, 196, 15, 0.2); font-weight: 500; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="fas fa-building"></i> ${scheme.governmentDepartment}</span>` : ''}
          </div>
          <button class="btn btn-primary" onclick="app.viewSchemeDetails('${scheme._id}')" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem;">
            <i class="fas fa-file-invoice"></i> Learn More & Apply
          </button>
        </div>
      `).join('');
    } catch (error) {
      this.showAlert(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.showLoadingState('schemesList', false);
    }
  }

  async forceLiveSchemeHarvest(queryText) {
    this.showAlert('🔍 Launching live AI scheme grounders...', 'info');
    this.showLoadingState('schemesList', true);
    try {
      const response = await this.api.request(`/schemes/search?q=${encodeURIComponent(queryText)}&live=true`);
      const schemes = response.data || (Array.isArray(response) ? response : []);
      const schemesList = document.getElementById('schemesList');
      
      if (!schemes || schemes.length === 0) {
        schemesList.innerHTML = `<p class="empty-state">❌ No schemes found even after deep harvest.</p>`;
        return;
      }
      this.handleSearchSchemes();
      this.showAlert('✅ Live harvesting complete! Scheme loaded successfully.', 'success');
    } catch (error) {
      this.showAlert(`❌ Live harvesting failed: ${error.message}`, 'error');
      this.showLoadingState('schemesList', false);
    }
  }

  async viewSchemeDetails(schemeId) {
    this.showAlert('Fetching live details from official sources...', 'info');
    try {
      const response = await this.api.getScheme(schemeId);
      const scheme = response.data || response;
      
      const formatBenefits = () => {
        let items = [];
        if (scheme.benefits?.subsidy?.amount) {
          items.push(`
            <div style="background: #fdfefe; border: 1px solid var(--border); border-radius: 8px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.01);">
              <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Subsidy Amount</span>
              <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary); margin-top: 0.2rem;">₹${scheme.benefits.subsidy.amount}</div>
              ${scheme.benefits.subsidy.percentage ? `<div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.1rem;">Percentage: ${scheme.benefits.subsidy.percentage}%</div>` : ''}
            </div>
          `);
        }
        if (scheme.benefits?.loan?.maxAmount) {
          items.push(`
            <div style="background: #fdfefe; border: 1px solid var(--border); border-radius: 8px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.01);">
              <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Loan Details</span>
              <div style="font-size: 1.3rem; font-weight: 700; color: #2980b9; margin-top: 0.2rem;">Up to ₹${scheme.benefits.loan.maxAmount}</div>
              <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.1rem;">Interest Rate: ${scheme.benefits.loan.interestRate || 'N/A'}% p.a.</div>
            </div>
          `);
        }
        if (scheme.benefits?.insurance?.maxClaim) {
          items.push(`
            <div style="background: #fdfefe; border: 1px solid var(--border); border-radius: 8px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.01);">
              <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Insurance Coverage</span>
              <div style="font-size: 1.3rem; font-weight: 700; color: #9b59b6; margin-top: 0.2rem;">${scheme.benefits.insurance.coverage || 'Full Coverage'}</div>
              <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.1rem;">Max Claim: ₹${scheme.benefits.insurance.maxClaim}</div>
            </div>
          `);
        }
        return items.length > 0 ? items.join('') : `
          <div style="background: #fdfefe; border: 1px solid var(--border); border-radius: 8px; padding: 1rem; width: 100%;">
            <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Financial Perks</span>
            <div style="font-size: 1.15rem; font-weight: 600; color: var(--text-dark); margin-top: 0.2rem;">Verified Government Aid</div>
          </div>
        `;
      };

      const formatListItems = (list) => {
        if (!list || list.length === 0) return '';
        return list.map(item => `<li style="margin-bottom: 0.4rem;">${item}</li>`).join('');
      };

      const modalContent = `
        <div class="modal-header" style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 1.8rem 1.5rem; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0 0 0.5rem 0; font-size: 1.6rem; display: flex; align-items: center; gap: 0.6rem; color: white;">
            <i class="fas fa-landmark"></i> ${scheme.schemeName}
          </h2>
          <div style="font-size: 0.88rem; opacity: 0.95; display: flex; gap: 1rem; flex-wrap: wrap;">
            <span><strong>Code:</strong> ${scheme.schemeCode || 'N/A'}</span>
            <span>|</span>
            <span><strong>Level:</strong> ${scheme.govtLevel?.toUpperCase() || 'CENTRAL'}</span>
            <span>|</span>
            <span><strong>Department:</strong> ${scheme.governmentDepartment || 'Agriculture Dept'}</span>
          </div>
        </div>
        
        <div class="modal-body" style="padding: 1.8rem 1.5rem; max-height: 65vh; overflow-y: auto; font-family: inherit;">
          <div style="background: rgba(46, 204, 113, 0.04); border-left: 4px solid var(--primary); padding: 1.2rem; border-radius: 0 10px 10px 0; margin-bottom: 1.8rem; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--primary); font-size: 1.1rem; font-weight: 700;"><i class="fas fa-info-circle"></i> About the Scheme</h4>
            <p style="margin: 0 0 0.8rem 0; line-height: 1.6; color: var(--text-dark); font-size: 0.98rem;">${scheme.description || 'No description available.'}</p>
            ${scheme.applicationProcess?.onlinePortal?.url ? `
              <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed rgba(46, 204, 113, 0.2); font-size: 0.92rem; color: #333; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <i class="fas fa-external-link-alt" style="color: var(--primary-dark);"></i> 
                <strong>Official Registration Link:</strong> 
                <a href="${scheme.applicationProcess.onlinePortal.url}" target="_blank" style="color: var(--primary-dark); font-weight: 600; text-decoration: underline; word-break: break-all;">
                  ${scheme.applicationProcess.onlinePortal.url}
                </a>
              </div>
            ` : ''}
          </div>

          ${scheme.objectives && scheme.objectives.length > 0 ? `
            <div style="margin-bottom: 1.8rem;">
              <h4 style="margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-bullseye" style="color: #e74c3c; margin-right: 0.4rem;"></i> Objectives & Goals</h4>
              <ul style="margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; color: #555; font-size: 0.95rem;">
                ${formatListItems(scheme.objectives)}
              </ul>
            </div>
          ` : ''}

          <!-- Financial Benefits Section -->
          <div style="margin-bottom: 1.8rem;">
            <h4 style="margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-hand-holding-usd" style="color: #f1c40f; margin-right: 0.4rem;"></i> Financial Benefits & Subsidies</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              ${formatBenefits()}
            </div>
            ${scheme.benefits?.otherBenefits && scheme.benefits.otherBenefits.length > 0 ? `
              <div style="background: #fafafa; border-radius: 8px; padding: 1.2rem; border: 1px solid #f0f0f0;">
                <span style="font-size: 0.88rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Additional Benefits & Perks</span>
                <ul style="margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; color: #555; font-size: 0.92rem;">
                  ${formatListItems(scheme.benefits.otherBenefits)}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- Eligibility Section -->
          <div style="margin-bottom: 1.8rem; background: #fafbfc; border: 1px solid var(--border); border-radius: 10px; padding: 1.2rem;">
            <h4 style="margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-user-check" style="color: #3498db; margin-right: 0.4rem;"></i> Eligibility Criteria</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; font-size: 0.95rem; color: #555;">
              ${scheme.eligibility?.targetBeneficiaries && scheme.eligibility.targetBeneficiaries.length > 0 ? `
                <div><strong>Target Beneficiaries:</strong><br>${scheme.eligibility.targetBeneficiaries.join(', ')}</div>
              ` : ''}
              ${scheme.eligibility?.farmerType && scheme.eligibility.farmerType.length > 0 ? `
                <div><strong>Farmer Type:</strong><br>${scheme.eligibility.farmerType.join(', ')}</div>
              ` : ''}
              ${scheme.eligibility?.states && scheme.eligibility.states.length > 0 ? `
                <div><strong>Applicable States:</strong><br>${scheme.eligibility.states.join(', ')}</div>
              ` : ''}
            </div>
            ${scheme.eligibility?.otherCriteria && scheme.eligibility.otherCriteria.length > 0 ? `
              <div style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 0.8rem;">
                <strong style="display: block; margin-bottom: 0.4rem; color: #2c3e50;">General Verification Rules:</strong>
                <ul style="margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.92rem; color: #555;">
                  ${formatListItems(scheme.eligibility.otherCriteria)}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- Application Steps & Required Documents -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 1.8rem;">
            ${scheme.applicationProcess?.stepsToApply && scheme.applicationProcess.stepsToApply.length > 0 ? `
              <div>
                <h4 style="margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-list-ol" style="color: #e67e22; margin-right: 0.4rem;"></i> Application Steps</h4>
                <ol style="margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; color: #555; font-size: 0.92rem; line-height: 1.4;">
                  ${scheme.applicationProcess.stepsToApply.map(s => `<li style="margin-bottom: 0.4rem;">${s}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
            ${scheme.applicationProcess?.requiredDocuments && scheme.applicationProcess.requiredDocuments.length > 0 ? `
              <div>
                <h4 style="margin: 0 0 0.8rem 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-folder-open" style="color: #1abc9c; margin-right: 0.4rem;"></i> Required Documents</h4>
                <ul style="margin: 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 0.4rem; color: #555; font-size: 0.92rem;">
                  ${scheme.applicationProcess.requiredDocuments.map(d => `<li style="display: flex; align-items: center; gap: 0.5rem;"><i class="far fa-file-alt" style="color: #27ae60; font-size: 1rem;"></i> ${d}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- Portal Access -->
          ${scheme.applicationProcess?.onlinePortal?.url ? `
            <div style="background: rgba(46, 204, 113, 0.05); border: 1.5px dashed rgba(46, 204, 113, 0.3); border-radius: 12px; padding: 1.5rem; text-align: center; margin-top: 1rem;">
              <h4 style="margin: 0 0 0.4rem 0; color: #27ae60; font-size: 1.15rem; font-weight: 700;"><i class="fas fa-globe-asia"></i> Direct Official Application Link</h4>
              <p style="margin: 0 0 1.2rem 0; font-size: 0.92rem; color: #666; line-height: 1.4;">This link has been verified around the internet as the live portal. Please click below to access the registration pages.</p>
              <a href="${scheme.applicationProcess.onlinePortal.url}" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; text-decoration: none; padding: 0.8rem 2.2rem; font-weight: 700; border-radius: 30px; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.25); font-size: 0.95rem; font-family: inherit;">
                <i class="fas fa-external-link-alt"></i> Apply via ${scheme.applicationProcess.onlinePortal.portalName || 'Government Portal'}
              </a>
            </div>
          ` : ''}
        </div>
        
        <div class="modal-footer" style="background: #fafafa; border-top: 1px solid var(--border); padding: 1rem 1.5rem; border-radius: 0 0 12px 12px; display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'" style="border-radius: 8px; padding: 0.6rem 1.5rem; font-size: 0.9rem;">Close Details</button>
        </div>
      `;
      this.showModal('schemeModal', modalContent);
    } catch (error) {
      this.showAlert(`❌ Error retrieving details: ${error.message}`, 'error');
    }
  }

  async loadFeaturedSchemes() {
    const schemesList = document.getElementById('schemesList');
    if (!schemesList) return;

    this.showLoadingState('schemesList', true);
    try {
      const response = await this.api.listSchemes(1, 4, { active: true });
      const schemes = response.items || (Array.isArray(response) ? response : []);
      
      if (!schemes || schemes.length === 0) {
        schemesList.innerHTML = '<p class="empty-state">📋 Select a government scheme above to discover benefits and live registration status.</p>';
        return;
      }

      schemesList.innerHTML = schemes.map(scheme => `
        <div class="scheme-card" style="border-left: 5px solid var(--primary); padding: 1.2rem; border-radius: 8px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">${scheme.schemeName}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; margin-bottom: 0.8rem;">${scheme.description}</p>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
              <span class="badge" style="font-size: 0.75rem; background: rgba(52, 152, 219, 0.1); color: #2980b9; border: 1px solid rgba(52, 152, 219, 0.2); font-weight: 600;">${scheme.govtLevel?.toUpperCase() || 'CENTRAL'}</span>
              <span class="badge" style="font-size: 0.75rem; background: rgba(155, 89, 182, 0.1); color: #8e44ad; border: 1px solid rgba(155, 89, 182, 0.2); font-weight: 600;">${scheme.schemeType?.toUpperCase() || 'BENEFIT'}</span>
            </div>
          </div>
          <button class="btn btn-small" onclick="app.viewSchemeDetails('${scheme._id}')" style="align-self: flex-start; border-radius: 6px;">
            Learn More
          </button>
        </div>
      `).join('');
    } catch (error) {
      console.warn('Featured schemes load failed:', error);
      schemesList.innerHTML = '<p class="empty-state">📋 Select a government scheme above to discover benefits and live registration status.</p>';
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
    if (tabName === 'schemes') this.loadFeaturedSchemes();
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

  startExpertChat(expertName, specialty, greeting) {
    this.currentExpert = { name: expertName, specialty: specialty };
    this.expertChatHistory = [];

    // Select theme colors based on expert
    let gradient = 'linear-gradient(135deg, #27ae60 0%, #219a52 100%)'; // Rajesh Kumar Green
    let avatar = '👨‍🌾';
    let btnColor = '#27ae60';
    let userBg = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';

    if (expertName === 'Priya Singh') {
      gradient = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'; // Priya Singh Blue
      avatar = '👩‍🌾';
      btnColor = '#3498db';
      userBg = 'linear-gradient(135deg, #5dade2 0%, #3498db 100%)';
    } else if (expertName === 'Deepak Patel') {
      gradient = 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'; // Deepak Patel Purple
      avatar = '👨‍🌾';
      btnColor = '#9b59b6';
      userBg = 'linear-gradient(135deg, #af7ac5 0%, #9b59b6 100%)';
    }

    this.currentExpertColors = {
      gradient,
      btnColor,
      userBg
    };

    // Update Header
    const header = document.getElementById('expertChatHeader');
    const avatarContainer = document.getElementById('expertChatAvatar');
    const nameContainer = document.getElementById('expertChatName');
    const specialtyContainer = document.getElementById('expertChatSpecialty');
    const formButton = document.querySelector('#expertChatForm button[type="submit"]');
    const textInput = document.getElementById('expertChatInput');

    if (header) header.style.background = gradient;
    if (avatarContainer) avatarContainer.textContent = avatar;
    if (nameContainer) nameContainer.textContent = expertName;
    if (specialtyContainer) specialtyContainer.textContent = specialty;
    if (formButton) {
      formButton.style.background = btnColor;
      formButton.style.boxShadow = `0 4px 10px ${btnColor}4d`;
    }
    if (textInput) {
      textInput.style.borderColor = '#ddd';
      textInput.onfocus = () => { textInput.style.borderColor = btnColor; };
      textInput.onblur = () => { textInput.style.borderColor = '#ddd'; };
      textInput.value = '';
    }

    // Inject chat styles dynamically if not loaded
    if (!document.getElementById('expertChatStyles')) {
      const style = document.createElement('style');
      style.id = 'expertChatStyles';
      style.textContent = `
        .expert-bubble {
          align-self: flex-start;
          background: white;
          color: #2c3e50;
          border: 1px solid #eef0f2;
          border-radius: 18px 18px 18px 0px;
          padding: 0.8rem 1.2rem;
          max-width: 80%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          line-height: 1.5;
          font-size: 0.95rem;
          animation: bubbleFadeIn 0.25s ease-out;
          text-align: left;
        }
        .user-bubble {
          align-self: flex-end;
          color: white;
          border-radius: 18px 18px 0px 18px;
          padding: 0.8rem 1.2rem;
          max-width: 80%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          line-height: 1.5;
          font-size: 0.95rem;
          animation: bubbleFadeIn 0.25s ease-out;
          text-align: left;
        }
        .typing-bubble {
          align-self: flex-start;
          background: #eef0f2;
          border-radius: 18px 18px 18px 0px;
          padding: 0.8rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          width: fit-content;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background: #7f8c8d;
          border-radius: 50%;
          animation: typingPulse 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Clear Body & Add Greeting
    const chatBody = document.getElementById('expertChatBody');
    if (chatBody) {
      chatBody.innerHTML = '';
      this.appendExpertChatMessage('expert', greeting);
    }

    // Show Modal
    const modal = document.getElementById('expertChatModal');
    if (modal) modal.style.display = 'block';
  }

  appendExpertChatMessage(sender, text) {
    const chatBody = document.getElementById('expertChatBody');
    if (!chatBody) return;

    const bubble = document.createElement('div');
    if (sender === 'user') {
      bubble.className = 'user-bubble';
      bubble.style.background = this.currentExpertColors?.userBg || '#27ae60';
    } else {
      bubble.className = 'expert-bubble';
    }

    // Parse clean bullet lists and bold text
    const formattedText = text
      .replace(/\n/g, '<br>')
      .replace(/\* (.*?)(?:<br>|$)/g, '• $1<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    bubble.innerHTML = formattedText;
    chatBody.appendChild(bubble);

    // Auto-scroll
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  showExpertTypingIndicator(show) {
    const chatBody = document.getElementById('expertChatBody');
    if (!chatBody) return;

    const existing = document.getElementById('expertTypingBubble');
    if (existing) existing.remove();

    if (show) {
      const bubble = document.createElement('div');
      bubble.id = 'expertTypingBubble';
      bubble.className = 'typing-bubble';
      bubble.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  async handleExpertChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('expertChatInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    // Render user message
    this.appendExpertChatMessage('user', text);

    // Show typing loader
    this.showExpertTypingIndicator(true);

    try {
      // Send API call to backend
      const response = await this.api.sendExpertMessage(
        this.currentExpert.name,
        this.currentExpert.specialty,
        text,
        this.expertChatHistory
      );

      // Hide typing loader
      this.showExpertTypingIndicator(false);

      if (response && response.success && response.reply) {
        this.appendExpertChatMessage('expert', response.reply);
        // Save to chat history
        this.expertChatHistory.push({ sender: 'user', text: text });
        this.expertChatHistory.push({ sender: 'expert', text: response.reply });
      } else {
        this.appendExpertChatMessage('expert', 'I apologize, my cellular connection in the fields is acting up. Could you try asking again?');
      }
    } catch (error) {
      this.showExpertTypingIndicator(false);
      console.error('Expert chat API failed:', error);
      this.appendExpertChatMessage('expert', 'I apologize, I am temporarily having trouble connecting. Let me check the connection and try again shortly!');
    }
  }

  toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    const card = document.getElementById('profileDropdownCard');
    if (!card) return;
    card.style.display = card.style.display === 'flex' ? 'none' : 'flex';
  }

  handleDashboardLink() {
    const card = document.getElementById('profileDropdownCard');
    if (card) card.style.display = 'none';
    this.switchTab('submit');
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
