/**
 * 🎨 PAIECASHFAN WALLET WIDGET - WEB COMPONENT
 * SDK JavaScript pour intégrer le wallet PaieCashFan sur n'importe quel site
 * 
 * Usage:
 * <paiecashfan-wallet 
 *   client-id="YOUR_CLIENT_ID"
 *   club-id="angers-sco"
 *   theme="light"
 *   language="fr"
 * ></paiecashfan-wallet>
 */

class PaieCashFanWallet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.config = {
      clientId: this.getAttribute('client-id') || '',
      clubId: this.getAttribute('club-id') || '',
      theme: this.getAttribute('theme') || 'light',
      language: this.getAttribute('language') || 'fr',
      apiUrl: this.getAttribute('api-url') || 'https://api.paiecashfan.com',
      thirdwebClientId: this.getAttribute('thirdweb-client-id') || ''
    };
    
    // État
    this.state = {
      isConnected: false,
      walletAddress: null,
      balance: '0',
      loading: false,
      error: null
    };
  }
  
  connectedCallback() {
    this.render();
    this.loadThirdwebSDK();
    this.checkExistingConnection();
  }
  
  async loadThirdwebSDK() {
    if (window.thirdweb) return;
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/thirdweb@5/dist/thirdweb.umd.js';
    script.onload = () => {
      console.log('✅ Thirdweb SDK loaded');
      this.initializeThirdweb();
    };
    document.head.appendChild(script);
  }
  
  async initializeThirdweb() {
    try {
      const { createThirdwebClient, inAppWallet } = window.thirdweb;
      
      this.thirdwebClient = createThirdwebClient({
        clientId: this.config.thirdwebClientId
      });
      
      this.wallet = inAppWallet({ client: this.thirdwebClient });
      
      console.log('✅ Thirdweb initialized');
    } catch (error) {
      console.error('❌ Error initializing Thirdweb:', error);
      this.setState({ error: error.message });
    }
  }
  
  async checkExistingConnection() {
    const savedAddress = localStorage.getItem('paiecashfan_wallet_address');
    if (savedAddress) {
      this.setState({ 
        isConnected: true, 
        walletAddress: savedAddress 
      });
      await this.loadBalance();
    }
  }
  
  async connectWallet(strategy = 'email', credential = '') {
    this.setState({ loading: true, error: null });
    
    try {
      await this.wallet.connect({ strategy, [strategy]: credential });
      const address = await this.wallet.getAddress();
      
      // Sauvegarder la connexion
      localStorage.setItem('paiecashfan_wallet_address', address);
      
      this.setState({ 
        isConnected: true, 
        walletAddress: address,
        loading: false
      });
      
      await this.loadBalance();
      this.dispatchEvent(new CustomEvent('wallet-connected', { 
        detail: { address } 
      }));
      
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      this.setState({ 
        loading: false, 
        error: error.message 
      });
    }
  }
  
  async loadBalance() {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/wallet/${this.state.walletAddress}/balance?clubId=${this.config.clubId}`
      );
      const data = await response.json();
      
      this.setState({ balance: data.balance });
    } catch (error) {
      console.error('❌ Error loading balance:', error);
    }
  }
  
  async disconnectWallet() {
    localStorage.removeItem('paiecashfan_wallet_address');
    this.setState({ 
      isConnected: false, 
      walletAddress: null, 
      balance: '0' 
    });
    
    this.dispatchEvent(new CustomEvent('wallet-disconnected'));
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render() {
    const isDark = this.config.theme === 'dark';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .wallet-container {
          background: ${isDark ? '#1a1a1a' : '#ffffff'};
          color: ${isDark ? '#ffffff' : '#000000'};
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, ${isDark ? '0.5' : '0.1'});
          max-width: 400px;
        }
        
        .wallet-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .wallet-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }
        
        .wallet-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        
        .wallet-content {
          margin-top: 20px;
        }
        
        .connect-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        label {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.8;
        }
        
        input {
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid ${isDark ? '#333' : '#ddd'};
          background: ${isDark ? '#2a2a2a' : '#f9f9f9'};
          color: ${isDark ? '#fff' : '#000'};
          font-size: 16px;
          transition: border-color 0.2s;
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .btn {
          padding: 14px 24px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-secondary {
          background: ${isDark ? '#333' : '#f0f0f0'};
          color: ${isDark ? '#fff' : '#000'};
        }
        
        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .info-card {
          background: ${isDark ? '#2a2a2a' : '#f9f9f9'};
          padding: 16px;
          border-radius: 12px;
        }
        
        .info-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.6;
          margin-bottom: 8px;
        }
        
        .info-value {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }
        
        .wallet-address {
          font-size: 14px;
          font-family: monospace;
          background: ${isDark ? '#333' : '#f0f0f0'};
          padding: 8px 12px;
          border-radius: 6px;
          word-break: break-all;
        }
        
        .error-message {
          background: #ff4444;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .branding {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid ${isDark ? '#333' : '#eee'};
          text-align: center;
          font-size: 12px;
          opacity: 0.6;
        }
      </style>
      
      <div class="wallet-container">
        <div class="wallet-header">
          <div class="wallet-logo">💳</div>
          <h3 class="wallet-title">PaieCash Wallet</h3>
        </div>
        
        ${this.state.error ? `
          <div class="error-message">
            ⚠️ ${this.state.error}
          </div>
        ` : ''}
        
        <div class="wallet-content">
          ${this.state.isConnected ? this.renderConnectedState() : this.renderDisconnectedState()}
        </div>
        
        <div class="branding">
          Powered by PaieCashFan × Thirdweb
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderDisconnectedState() {
    return `
      <form class="connect-form" id="connect-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="votre@email.com"
            ${this.state.loading ? 'disabled' : ''}
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary"
          ${this.state.loading ? 'disabled' : ''}
        >
          ${this.state.loading ? '<span class="loading-spinner"></span>' : 'Se connecter'}
        </button>
      </form>
    `;
  }
  
  renderConnectedState() {
    return `
      <div class="wallet-info">
        <div class="info-card">
          <div class="info-label">Solde</div>
          <div class="info-value">${this.state.balance} €</div>
        </div>
        
        <div class="info-card">
          <div class="info-label">Adresse Wallet</div>
          <div class="wallet-address">
            ${this.state.walletAddress.slice(0, 8)}...${this.state.walletAddress.slice(-6)}
          </div>
        </div>
        
        <button class="btn btn-secondary" id="disconnect-btn">
          Déconnexion
        </button>
      </div>
    `;
  }
  
  attachEventListeners() {
    const form = this.shadowRoot.getElementById('connect-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = this.shadowRoot.getElementById('email').value;
        if (email) {
          await this.connectWallet('email', email);
        }
      });
    }
    
    const disconnectBtn = this.shadowRoot.getElementById('disconnect-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        this.disconnectWallet();
      });
    }
  }
}

// Enregistrer le Web Component
customElements.define('paiecashfan-wallet', PaieCashFanWallet);

console.log('✅ PaieCashFan Wallet Widget loaded');
