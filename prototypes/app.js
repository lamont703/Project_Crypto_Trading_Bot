/**
 * Crypto Trading Bot - Shared Application Logic
 * This file contains shared functionality for all prototype screens
 */

class CryptoBotApp {
  constructor() {
    this.sampleData = null;
    this.currentScreen = null;
    this.init();
  }

  async init() {
    try {
      await this.loadSampleData();
      this.setupEventListeners();
      this.setupNavigation();
      this.setupTheme();
      this.setupAccessibility();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load application data');
    }
  }

  async loadSampleData() {
    try {
      const response = await fetch('./sample-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.sampleData = await response.json();
      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Error loading sample data:', error);
      // Fallback to empty data structure
      this.sampleData = {
        user: { name: 'Demo User', riskProfile: 'moderate' },
        portfolio: { totalValue: 0, totalPnl: 0 },
        positions: [],
        trades: [],
        strategies: [],
        marketData: { tickers: [], priceHistory: {} },
        news: [],
        sentiment: []
      };
    }
  }

  setupEventListeners() {
    // Tab bar navigation
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = tab.dataset.screen;
        if (screen) {
          this.navigateToScreen(screen);
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e.target);
    });

    // Button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        this.handleAction(e.target.dataset.action, e.target);
      }
    });
  }

  setupNavigation() {
    // Update active tab based on current page
    const currentPath = window.location.pathname;
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach(tab => {
      tab.classList.remove('active');
      const screen = tab.dataset.screen;
      if (currentPath.includes(screen)) {
        tab.classList.add('active');
      }
    });
  }

  setupTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  setupAccessibility() {
    // Add skip links
    this.addSkipLinks();
    
    // Setup ARIA live regions
    this.setupLiveRegions();
    
    // Setup focus management
    this.setupFocusManagement();
  }

  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.addEventListener('focus', () => {
      skipLink.classList.remove('sr-only');
    });
    skipLink.addEventListener('blur', () => {
      skipLink.classList.add('sr-only');
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  setupFocusManagement() {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('.modal.show');
        if (modal) {
          this.trapFocus(modal, e);
        }
      }
    });
  }

  trapFocus(modal, e) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  navigateToScreen(screen) {
    const screens = {
      'dashboard': 'dashboard.html',
      'market': 'market-watch.html',
      'strategy': 'strategy-builder.html',
      'backtest': 'backtesting.html',
      'trade': 'trade-execution.html',
      'news': 'news-sentiment.html',
      'settings': 'settings.html'
    };

    if (screens[screen]) {
      window.location.href = screens[screen];
    }
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate form
    if (this.validateForm(form)) {
      this.processFormData(form.dataset.formType, data);
    }
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error text-danger';
    errorElement.textContent = message;
    
    field.classList.add('is-invalid');
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  processFormData(formType, data) {
    switch (formType) {
      case 'strategy':
        this.saveStrategy(data);
        break;
      case 'order':
        this.placeOrder(data);
        break;
      case 'settings':
        this.saveSettings(data);
        break;
      default:
        console.log('Unknown form type:', formType);
    }
  }

  saveStrategy(data) {
    try {
      const strategies = this.getStrategies();
      const strategy = {
        id: `strategy_${Date.now()}`,
        name: data.name,
        description: data.description,
        riskLevel: data.riskLevel,
        maxPositionSize: parseFloat(data.maxPositionSize),
        rules: JSON.parse(data.rules || '[]'),
        isActive: false,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      strategies.push(strategy);
      localStorage.setItem('strategies', JSON.stringify(strategies));
      
      this.showToast('Strategy saved successfully', 'success');
      this.announce('Strategy saved successfully');
    } catch (error) {
      console.error('Error saving strategy:', error);
      this.showToast('Failed to save strategy', 'danger');
    }
  }

  placeOrder(data) {
    // Mock order placement
    const order = {
      id: `order_${Date.now()}`,
      asset: data.asset,
      side: data.side,
      type: data.type,
      size: parseFloat(data.size),
      price: parseFloat(data.price) || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.showToast('Order placed successfully (Mock)', 'success');
    this.announce('Order placed successfully');
    
    // Add to activity feed
    this.addToActivityFeed(`Order placed: ${order.side} ${order.size} ${order.asset}`);
  }

  saveSettings(data) {
    try {
      const settings = {
        notifications: {
          priceAlerts: data.priceAlerts === 'on',
          orderUpdates: data.orderUpdates === 'on',
          newsAlerts: data.newsAlerts === 'on',
          strategyAlerts: data.strategyAlerts === 'on',
          riskWarnings: data.riskWarnings === 'on'
        },
        trading: {
          defaultPositionSize: parseFloat(data.defaultPositionSize),
          maxPositionSize: parseFloat(data.maxPositionSize),
          defaultStopLoss: parseFloat(data.defaultStopLoss),
          defaultTakeProfit: parseFloat(data.defaultTakeProfit),
          defaultTimeInTrade: parseInt(data.defaultTimeInTrade)
        },
        theme: data.theme || 'auto'
      };

      localStorage.setItem('settings', JSON.stringify(settings));
      
      if (data.theme) {
        document.documentElement.setAttribute('data-theme', data.theme);
      }
      
      this.showToast('Settings saved successfully', 'success');
      this.announce('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('Failed to save settings', 'danger');
    }
  }

  handleAction(action, element) {
    switch (action) {
      case 'save-strategy':
        this.saveStrategyFromForm(element);
        break;
      case 'test-strategy':
        this.testStrategy(element);
        break;
      case 'activate-strategy':
        this.activateStrategy(element);
        break;
      case 'delete-strategy':
        this.deleteStrategy(element);
        break;
      case 'run-backtest':
        this.runBacktest(element);
        break;
      case 'export-results':
        this.exportResults(element);
        break;
      case 'execute-order':
        this.executeOrder(element);
        break;
      case 'preview-order':
        this.previewOrder(element);
        break;
      case 'add-api-key':
        this.addApiKey(element);
        break;
      case 'test-api-key':
        this.testApiKey(element);
        break;
      case 'delete-api-key':
        this.deleteApiKey(element);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  saveStrategyFromForm(element) {
    const form = element.closest('form');
    if (form) {
      this.handleFormSubmit(form);
    }
  }

  testStrategy(element) {
    this.showToast('Strategy testing not implemented in demo', 'info');
  }

  activateStrategy(element) {
    const strategyId = element.dataset.strategyId;
    if (strategyId) {
      this.showToast('Strategy activated (Mock)', 'success');
      this.announce('Strategy activated');
    }
  }

  deleteStrategy(element) {
    const strategyId = element.dataset.strategyId;
    if (strategyId && confirm('Are you sure you want to delete this strategy?')) {
      this.showToast('Strategy deleted', 'success');
      this.announce('Strategy deleted');
    }
  }

  runBacktest(element) {
    this.showToast('Running backtest...', 'info');
    
    // Simulate backtest
    setTimeout(() => {
      this.showToast('Backtest completed', 'success');
      this.announce('Backtest completed');
    }, 2000);
  }

  exportResults(element) {
    this.showToast('Exporting results...', 'info');
    
    // Simulate export
    setTimeout(() => {
      this.showToast('Results exported successfully', 'success');
    }, 1000);
  }

  executeOrder(element) {
    const form = element.closest('form');
    if (form) {
      this.handleFormSubmit(form);
    }
  }

  previewOrder(element) {
    this.showToast('Order preview updated', 'info');
  }

  addApiKey(element) {
    this.showToast('Add API key form would open', 'info');
  }

  testApiKey(element) {
    this.showToast('API key test successful', 'success');
  }

  deleteApiKey(element) {
    if (confirm('Are you sure you want to delete this API key?')) {
      this.showToast('API key deleted', 'success');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-title">${this.getToastTitle(type)}</div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  getToastTitle(type) {
    const titles = {
      success: 'Success',
      warning: 'Warning',
      danger: 'Error',
      info: 'Info'
    };
    return titles[type] || 'Notification';
  }

  showError(message) {
    this.showToast(message, 'danger');
  }

  announce(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  addToActivityFeed(message) {
    const activityFeed = document.querySelector('.activity-feed');
    if (activityFeed) {
      const feedItem = document.createElement('div');
      feedItem.className = 'feed-item';
      feedItem.innerHTML = `
        <div class="feed-header">
          <div class="feed-action">${message}</div>
          <div class="feed-time">Just now</div>
        </div>
      `;
      
      activityFeed.insertBefore(feedItem, activityFeed.firstChild);
      
      // Remove old items if too many
      const items = activityFeed.querySelectorAll('.feed-item');
      if (items.length > 10) {
        items[items.length - 1].remove();
      }
    }
  }

  closeModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      modal.classList.remove('show');
    });
  }

  // Data access methods
  getPortfolio() {
    return this.sampleData?.portfolio || { totalValue: 0, totalPnl: 0 };
  }

  getPositions() {
    return this.sampleData?.positions || [];
  }

  getTrades() {
    return this.sampleData?.trades || [];
  }

  getStrategies() {
    const saved = localStorage.getItem('strategies');
    return saved ? JSON.parse(saved) : (this.sampleData?.strategies || []);
  }

  getMarketData() {
    return this.sampleData?.marketData || { tickers: [], priceHistory: {} };
  }

  getNews() {
    return this.sampleData?.news || [];
  }

  getSentiment() {
    return this.sampleData?.sentiment || [];
  }

  getSettings() {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      notifications: {
        priceAlerts: true,
        orderUpdates: true,
        newsAlerts: false,
        strategyAlerts: true,
        riskWarnings: true
      },
      trading: {
        defaultPositionSize: 0.1,
        maxPositionSize: 0.25,
        defaultStopLoss: 0.05,
        defaultTakeProfit: 0.10,
        defaultTimeInTrade: 24
      },
      theme: 'auto'
    };
  }

  // Utility methods
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatPercentage(value, decimals = 2) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  // Chart utilities
  createCanvasChart(container, data, options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || 300;
    
    // Clear container and add canvas
    container.innerHTML = '';
    container.appendChild(canvas);
    
    // Basic chart rendering
    this.renderChart(ctx, canvas.width, canvas.height, data, options);
    
    return canvas;
  }

  renderChart(ctx, width, height, data, options) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) {
      // Draw placeholder
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }
    
    // Basic line chart implementation
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find min/max values
    const values = data.map(d => d.close || d.value || d);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;
    
    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((point.close || point.value || point) - minValue) / valueRange * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }
}

// Markdown viewer for documentation
class MarkdownViewer {
  constructor() {
    this.markdownRules = [
      { pattern: /^# (.*$)/gim, replacement: '<h1>$1</h1>' },
      { pattern: /^## (.*$)/gim, replacement: '<h2>$1</h2>' },
      { pattern: /^### (.*$)/gim, replacement: '<h3>$1</h3>' },
      { pattern: /^#### (.*$)/gim, replacement: '<h4>$1</h4>' },
      { pattern: /^##### (.*$)/gim, replacement: '<h5>$1</h5>' },
      { pattern: /^###### (.*$)/gim, replacement: '<h6>$1</h6>' },
      { pattern: /\*\*(.*)\*\*/gim, replacement: '<strong>$1</strong>' },
      { pattern: /\*(.*)\*/gim, replacement: '<em>$1</em>' },
      { pattern: /`(.*)`/gim, replacement: '<code>$1</code>' },
      { pattern: /^\- (.*$)/gim, replacement: '<li>$1</li>' },
      { pattern: /^\* (.*$)/gim, replacement: '<li>$1</li>' },
      { pattern: /^\d+\. (.*$)/gim, replacement: '<li>$1</li>' },
      { pattern: /\[([^\]]+)\]\(([^)]+)\)/gim, replacement: '<a href="$2">$1</a>' }
    ];
  }

  render(markdown) {
    let html = markdown;
    
    // Apply markdown rules
    this.markdownRules.forEach(rule => {
      html = html.replace(rule.pattern, rule.replacement);
    });
    
    // Wrap list items in ul/ol
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    
    // Convert line breaks to paragraphs
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && !paragraph.match(/^<[h1-6]|<ul|<ol|<li/)) {
        return `<p>${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');
    
    return html;
  }

  async loadMarkdownFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const markdown = await response.text();
      return this.render(markdown);
    } catch (error) {
      console.error('Error loading markdown file:', error);
      return '<p>Error loading documentation</p>';
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cryptoBotApp = new CryptoBotApp();
  window.markdownViewer = new MarkdownViewer();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CryptoBotApp, MarkdownViewer };
}
