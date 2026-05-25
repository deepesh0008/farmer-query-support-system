/**
 * AgriBot Floating Chatbot Widget
 * Injects a floating glassmorphic AI agricultural helper in the bottom-right corner
 */

class AgriChatbotWidget {
  constructor() {
    this.history = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    // 1. Check if elements already exist
    if (document.getElementById('agriChatTrigger')) return;

    // 2. Inject CSS styles
    this.injectStyles();

    // 3. Inject HTML markup
    const container = document.createElement('div');
    container.id = 'agriChatbotContainer';
    container.innerHTML = `
      <!-- Floating Trigger Button -->
      <div id="agriChatTrigger" class="agri-chat-trigger" title="Chat with AgriBot AI">
        <div class="trigger-pulse"></div>
        <i class="fas fa-comment-dots"></i>
      </div>
      
      <!-- Glassmorphic Chat Window -->
      <div id="agriChatWindow" class="agri-chat-window">
        <div class="agri-chat-header">
          <div class="agri-chat-header-avatar">
            <i class="fas fa-robot"></i>
            <div class="online-indicator"></div>
          </div>
          <div class="agri-chat-header-info">
            <h4>AgriBot AI Assistant</h4>
            <span>Grounded Web Advisor • Online</span>
          </div>
          <div class="agri-chat-header-actions" id="agriChatClose" title="Minimize">
            <i class="fas fa-times"></i>
          </div>
        </div>
        
        <div class="agri-chat-body" id="agriChatBody">
          <div class="agri-chat-message bot">
            Hello Farmer! I am <strong>AgriBot</strong>, your AI assistant. Grounded in live web searches, I can help you with crop advice, weather summaries, market prices, and disease preventions! 🌾
          </div>
          
          <!-- Suggested Quick FAQs -->
          <div class="faq-chips-container" id="faqChipsContainer">
            <div class="faq-chip" data-q="Best fertilizer for wheat crop?">🌾 Wheat Fertilizer?</div>
            <div class="faq-chip" data-q="How to treat tomato leaf spot early blight?">🍅 Tomato Leaf Spot?</div>
            <div class="faq-chip" data-q="What crops to plant in Rabi season in North India?">🌱 Rabi Crops?</div>
            <div class="faq-chip" data-q="Explain benefits of crop rotation">🔄 Crop Rotation?</div>
          </div>
        </div>
        
        <div class="agri-chat-input-area">
          <input type="text" id="agriChatInput" placeholder="Type your farming question..." />
          <button id="agriChatSend"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // 4. Bind event listeners
    this.bindEvents();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .agri-chat-trigger {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.6rem;
        box-shadow: 0 4px 20px rgba(46, 204, 113, 0.4);
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .agri-chat-trigger:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px rgba(46, 204, 113, 0.5);
      }
      .trigger-pulse {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 50%;
        border: 2px solid #2ecc71;
        animation: triggerRipple 2s infinite ease-out;
        pointer-events: none;
      }
      @keyframes triggerRipple {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      .agri-chat-window {
        position: fixed;
        bottom: 95px;
        right: 25px;
        width: 360px;
        height: 480px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 10000;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: widgetSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
      }
      @keyframes widgetSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .agri-chat-header {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        color: white;
        padding: 0.9rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      .agri-chat-header-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }
      .online-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #2ecc71;
        border: 2px solid white;
        border-radius: 50%;
      }
      .agri-chat-header-info h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.2px;
      }
      .agri-chat-header-info span {
        font-size: 0.75rem;
        opacity: 0.85;
      }
      .agri-chat-header-actions {
        margin-left: auto;
        cursor: pointer;
        font-size: 1.1rem;
        opacity: 0.9;
        transition: opacity 0.2s;
      }
      .agri-chat-header-actions:hover { opacity: 1; }
      .agri-chat-body {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        background: #f8f9fa;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .agri-chat-message {
        padding: 0.75rem 0.95rem;
        border-radius: 12px;
        max-width: 82%;
        font-size: 0.88rem;
        line-height: 1.45;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
        word-wrap: break-word;
      }
      .agri-chat-message.bot {
        background: white;
        color: #2c3e50;
        align-self: flex-start;
        border-bottom-left-radius: 2px;
        border: 1px solid rgba(0,0,0,0.04);
      }
      .agri-chat-message.user {
        background: #2ecc71;
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 2px;
      }
      .faq-chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.4rem;
      }
      .faq-chip {
        background: white;
        color: #27ae60;
        border: 1px solid rgba(46, 204, 113, 0.2);
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 550;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }
      .faq-chip:hover {
        background: rgba(46, 204, 113, 0.08);
        transform: translateY(-1px);
      }
      .agri-chat-input-area {
        padding: 0.75rem;
        background: white;
        display: flex;
        border-top: 1px solid #f1f2f6;
        gap: 0.5rem;
        align-items: center;
      }
      .agri-chat-input-area input {
        flex: 1;
        padding: 0.7rem 0.95rem;
        border: 1px solid #e1e8ed;
        border-radius: 24px;
        font-size: 0.88rem;
        outline: none;
        transition: border 0.2s;
      }
      .agri-chat-input-area input:focus {
        border-color: #2ecc71;
      }
      .agri-chat-input-area button {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #2ecc71;
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
        transition: transform 0.2s;
      }
      .agri-chat-input-area button:hover {
        transform: scale(1.05);
      }
      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 0.95rem;
        background: white;
        border: 1px solid rgba(0,0,0,0.04);
        border-radius: 12px;
        border-bottom-left-radius: 2px;
        align-self: flex-start;
        box-shadow: 0 2px 6px rgba(0,0,0,0.02);
      }
      .typing-dot {
        width: 6px;
        height: 6px;
        background: #7f8c8d;
        border-radius: 50%;
        animation: dotPulse 1.4s infinite ease-in-out;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes dotPulse {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    const trigger = document.getElementById('agriChatTrigger');
    const closeBtn = document.getElementById('agriChatClose');
    const sendBtn = document.getElementById('agriChatSend');
    const input = document.getElementById('agriChatInput');

    trigger.onclick = () => this.toggleWindow();
    closeBtn.onclick = () => this.toggleWindow();
    
    sendBtn.onclick = () => this.sendMessage();
    input.onkeypress = (e) => {
      if (e.key === 'Enter') this.sendMessage();
    };

    // FAQ Chips click handler
    document.getElementById('agriChatBody').addEventListener('click', (e) => {
      const chip = e.target.closest('.faq-chip');
      if (chip) {
        const questionText = chip.getAttribute('data-q');
        this.sendMessage(questionText);
        chip.remove(); // remove chips after click
      }
    });
  }

  toggleWindow() {
    const chatWin = document.getElementById('agriChatWindow');
    this.isOpen = !this.isOpen;
    chatWin.style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen) {
      document.getElementById('agriChatInput').focus();
    }
  }

  appendMessage(text, sender) {
    const body = document.getElementById('agriChatBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = `agri-chat-message ${sender}`;
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(msgDiv);
    
    // Auto-scroll
    body.scrollTop = body.scrollHeight;
  }

  showTypingIndicator() {
    const body = document.getElementById('agriChatBody');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'agriChatTyping';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    body.appendChild(indicator);
    body.scrollTop = body.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('agriChatTyping');
    if (indicator) indicator.remove();
  }

  async sendMessage(qText = null) {
    const input = document.getElementById('agriChatInput');
    const text = qText || input.value.trim();
    if (!text) return;

    if (!qText) input.value = '';

    // Append user message
    this.appendMessage(text, 'user');
    
    // Show typing
    this.showTypingIndicator();

    try {
      const response = await fetch('http://localhost:5000/api/v1/queries/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: this.history
        })
      });

      const data = await response.json();
      this.removeTypingIndicator();

      if (response.ok && data.reply) {
        this.appendMessage(data.reply, 'bot');
        // Record in chat history
        this.history.push({ sender: 'user', text });
        this.history.push({ sender: 'bot', text: data.reply });
      } else {
        this.appendMessage('⚠️ I apologize, there was an issue processing your query. Please try again shortly.', 'bot');
      }

    } catch (err) {
      console.error('Chatbot error:', err);
      this.removeTypingIndicator();
      this.appendMessage('⚠️ I apologize, I am unable to connect to the AgriBot server. Please ensure the backend is running.', 'bot');
    }
  }
}

// Instantiate when script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AgriChatbotWidget());
} else {
  new AgriChatbotWidget();
}
