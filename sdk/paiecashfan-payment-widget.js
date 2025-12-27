/**
 * 💳 PAIECASHFAN PAYMENT WIDGET - WEB COMPONENT
 * Widget de paiement pour acheter tickets NFT, produits, abonnements
 * 
 * Usage:
 * <paiecashfan-payment
 *   client-id="YOUR_CLIENT_ID"
 *   product-id="ticket-angers-psg-2025"
 *   product-name="Ticket Angers SCO vs PSG"
 *   product-image="https://example.com/ticket.jpg"
 *   price="50"
 *   currency="EUR"
 *   club-id="angers-sco"
 *   theme="light"
 * ></paiecashfan-payment>
 */

class PaieCashFanPayment extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.config = {
      clientId: this.getAttribute('client-id') || '',
      productId: this.getAttribute('product-id') || '',
      productName: this.getAttribute('product-name') || 'Produit',
      productImage: this.getAttribute('product-image') || '',
      productDescription: this.getAttribute('product-description') || '',
      price: parseFloat(this.getAttribute('price')) || 0,
      currency: this.getAttribute('currency') || 'EUR',
      clubId: this.getAttribute('club-id') || '',
      theme: this.getAttribute('theme') || 'light',
      language: this.getAttribute('language') || 'fr',
      apiUrl: this.getAttribute('api-url') || 'https://api.paiecashfan.com',
      thirdwebClientId: this.getAttribute('thirdweb-client-id') || ''
    };
    
    // État
    this.state = {
      step: 'product', // product, payment, processing, success, error
      paymentMethod: 'stablecoin', // stablecoin, sepa, mobile-money
      walletAddress: null,
      transactionHash: null,
      nftTokenId: null,
      loading: false,
      error: null
    };
  }
  
  connectedCallback() {
    this.render();
    this.loadThirdwebSDK();
    this.checkWalletConnection();
  }
  
  async loadThirdwebSDK() {
    if (window.thirdweb) {
      this.initializeThirdweb();
      return;
    }
    
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
      const { createThirdwebClient, inAppWallet, getContract } = window.thirdweb;
      
      this.thirdwebClient = createThirdwebClient({
        clientId: this.config.thirdwebClientId
      });
      
      this.wallet = inAppWallet({ client: this.thirdwebClient });
      
      // Contrat stablecoin
      this.stablecoinContract = getContract({
        client: this.thirdwebClient,
        address: '0xSTABLECOIN_ADDRESS', // À remplacer
        chain: 'polygon'
      });
      
      console.log('✅ Thirdweb Payment initialized');
    } catch (error) {
      console.error('❌ Error initializing Thirdweb:', error);
      this.setState({ error: error.message });
    }
  }
  
  async checkWalletConnection() {
    const savedAddress = localStorage.getItem('paiecashfan_wallet_address');
    if (savedAddress) {
      this.setState({ walletAddress: savedAddress });
    }
  }
  
  async processPayment() {
    this.setState({ step: 'processing', loading: true, error: null });
    
    try {
      // 1. Vérifier la connexion wallet
      if (!this.state.walletAddress) {
        throw new Error('Veuillez d\'abord connecter votre wallet');
      }
      
      // 2. Préparer la transaction selon la méthode de paiement
      let transactionResult;
      
      switch (this.state.paymentMethod) {
        case 'stablecoin':
          transactionResult = await this.payWithStablecoin();
          break;
        case 'sepa':
          transactionResult = await this.payWithSEPA();
          break;
        case 'mobile-money':
          transactionResult = await this.payWithMobileMoney();
          break;
        default:
          throw new Error('Méthode de paiement non supportée');
      }
      
      // 3. Mint NFT ticket si applicable
      if (this.config.productId.includes('ticket')) {
        const nftResult = await this.mintTicketNFT(transactionResult.transactionHash);
        this.setState({ nftTokenId: nftResult.tokenId });
      }
      
      // 4. Succès
      this.setState({ 
        step: 'success',
        transactionHash: transactionResult.transactionHash,
        loading: false
      });
      
      this.dispatchEvent(new CustomEvent('payment-success', {
        detail: {
          transactionHash: transactionResult.transactionHash,
          productId: this.config.productId,
          price: this.config.price,
          nftTokenId: this.state.nftTokenId
        }
      }));
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      this.setState({ 
        step: 'error',
        loading: false,
        error: error.message
      });
      
      this.dispatchEvent(new CustomEvent('payment-error', {
        detail: { error: error.message }
      }));
    }
  }
  
  async payWithStablecoin() {
    const { transfer } = window.thirdweb.extensions.erc20;
    
    // Convertir le prix en wei (18 decimals)
    const amountInWei = BigInt(Math.floor(this.config.price * 10**18));
    
    // Récupérer l'adresse du club
    const clubResponse = await fetch(`${this.config.apiUrl}/clubs/${this.config.clubId}`);
    const club = await clubResponse.json();
    
    // Transférer le stablecoin au club
    const transaction = transfer({
      contract: this.stablecoinContract,
      to: club.walletAddress,
      amount: amountInWei
    });
    
    const result = await this.wallet.sendTransaction(transaction);
    
    return {
      transactionHash: result.transactionHash,
      method: 'stablecoin'
    };
  }
  
  async payWithSEPA() {
    // Appel API backend pour initier paiement SEPA via Plaid/Bridge
    const response = await fetch(`${this.config.apiUrl}/payments/sepa/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.state.walletAddress,
        clubId: this.config.clubId,
        amount: this.config.price,
        currency: this.config.currency,
        productId: this.config.productId
      })
    });
    
    const data = await response.json();
    
    // Ouvrir iframe Plaid/Bridge pour autoriser le paiement
    this.openPaymentModal(data.paymentUrl);
    
    return {
      transactionHash: data.transactionId,
      method: 'sepa'
    };
  }
  
  async payWithMobileMoney() {
    // Appel API backend pour initier paiement Mobile Money via Flutterwave
    const response = await fetch(`${this.config.apiUrl}/payments/mobile-money/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.state.walletAddress,
        clubId: this.config.clubId,
        amount: this.config.price,
        currency: this.config.currency,
        productId: this.config.productId,
        provider: 'orange_money' // ou mtn_money, m_pesa
      })
    });
    
    const data = await response.json();
    
    // Afficher instructions Mobile Money
    this.showMobileMoneyInstructions(data);
    
    return {
      transactionHash: data.transactionId,
      method: 'mobile-money'
    };
  }
  
  async mintTicketNFT(paymentTransactionHash) {
    const response = await fetch(`${this.config.apiUrl}/nft/ticket/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: this.state.walletAddress,
        productId: this.config.productId,
        clubId: this.config.clubId,
        paymentTransactionHash: paymentTransactionHash
      })
    });
    
    const data = await response.json();
    
    return {
      tokenId: data.tokenId,
      contractAddress: data.contractAddress
    };
  }
  
  openPaymentModal(url) {
    // Ouvrir iframe ou popup pour paiement externe
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <iframe src="${url}" style="width: 90%; height: 90%; border: none; border-radius: 16px;"></iframe>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  showMobileMoneyInstructions(data) {
    // Afficher instructions Mobile Money dans le widget
    this.setState({ 
      step: 'mobile-money-instructions',
      mobileMoneyData: data
    });
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
        
        .payment-container {
          background: ${isDark ? '#1a1a1a' : '#ffffff'};
          color: ${isDark ? '#ffffff' : '#000000'};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, ${isDark ? '0.5' : '0.1'});
          max-width: 500px;
        }
        
        .product-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }
        
        .payment-content {
          padding: 24px;
        }
        
        .product-header {
          margin-bottom: 24px;
        }
        
        .product-name {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        
        .product-description {
          font-size: 14px;
          opacity: 0.7;
          margin: 0;
        }
        
        .price-section {
          background: ${isDark ? '#2a2a2a' : '#f9f9f9'};
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .price-label {
          font-size: 14px;
          opacity: 0.6;
          margin-bottom: 8px;
        }
        
        .price-value {
          font-size: 36px;
          font-weight: 700;
          color: #667eea;
        }
        
        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .payment-method {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid ${isDark ? '#333' : '#ddd'};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .payment-method.selected {
          border-color: #667eea;
          background: ${isDark ? '#2a2a3a' : '#f0f3ff'};
        }
        
        .payment-method:hover {
          border-color: #667eea;
        }
        
        .method-icon {
          font-size: 24px;
        }
        
        .method-info {
          flex: 1;
        }
        
        .method-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .method-details {
          font-size: 12px;
          opacity: 0.6;
        }
        
        .btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
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
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .success-message {
          text-align: center;
          padding: 40px 24px;
        }
        
        .success-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        .success-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .success-subtitle {
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 24px;
        }
        
        .transaction-hash {
          font-family: monospace;
          font-size: 12px;
          background: ${isDark ? '#2a2a2a' : '#f9f9f9'};
          padding: 12px;
          border-radius: 8px;
          word-break: break-all;
          margin-bottom: 24px;
        }
        
        .error-message {
          background: #ff4444;
          color: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .branding {
          background: ${isDark ? '#2a2a2a' : '#f9f9f9'};
          padding: 16px;
          text-align: center;
          font-size: 12px;
          opacity: 0.6;
        }
      </style>
      
      <div class="payment-container">
        ${this.config.productImage ? `
          <img src="${this.config.productImage}" alt="${this.config.productName}" class="product-image" />
        ` : ''}
        
        <div class="payment-content">
          ${this.renderStep()}
        </div>
        
        <div class="branding">
          Paiement sécurisé par PaieCashFan × Thirdweb
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderStep() {
    switch (this.state.step) {
      case 'product':
        return this.renderProductStep();
      case 'payment':
        return this.renderPaymentStep();
      case 'processing':
        return this.renderProcessingStep();
      case 'success':
        return this.renderSuccessStep();
      case 'error':
        return this.renderErrorStep();
      default:
        return this.renderProductStep();
    }
  }
  
  renderProductStep() {
    return `
      <div class="product-header">
        <h2 class="product-name">${this.config.productName}</h2>
        ${this.config.productDescription ? `
          <p class="product-description">${this.config.productDescription}</p>
        ` : ''}
      </div>
      
      <div class="price-section">
        <div class="price-label">Prix</div>
        <div class="price-value">${this.config.price} ${this.config.currency}</div>
      </div>
      
      <button class="btn btn-primary" id="buy-btn">
        Acheter maintenant
      </button>
    `;
  }
  
  renderPaymentStep() {
    return `
      <div class="product-header">
        <h2 class="product-name">Méthode de paiement</h2>
      </div>
      
      <div class="payment-methods">
        <div class="payment-method ${this.state.paymentMethod === 'stablecoin' ? 'selected' : ''}" data-method="stablecoin">
          <div class="method-icon">💰</div>
          <div class="method-info">
            <div class="method-name">Stablecoin (Recommandé)</div>
            <div class="method-details">Instant • Frais ~0.10 €</div>
          </div>
        </div>
        
        <div class="payment-method ${this.state.paymentMethod === 'sepa' ? 'selected' : ''}" data-method="sepa">
          <div class="method-icon">🏦</div>
          <div class="method-info">
            <div class="method-name">SEPA Instant</div>
            <div class="method-details">1-2 min • Frais 0.20 €</div>
          </div>
        </div>
        
        <div class="payment-method ${this.state.paymentMethod === 'mobile-money' ? 'selected' : ''}" data-method="mobile-money">
          <div class="method-icon">📱</div>
          <div class="method-info">
            <div class="method-name">Mobile Money</div>
            <div class="method-details">Orange Money, MTN, M-Pesa • Frais 1.5%</div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary" id="pay-btn">
        Payer ${this.config.price} ${this.config.currency}
      </button>
    `;
  }
  
  renderProcessingStep() {
    return `
      <div style="text-align: center; padding: 40px 24px;">
        <div class="loading-spinner" style="width: 60px; height: 60px; margin: 0 auto 24px;"></div>
        <h2 style="margin-bottom: 8px;">Transaction en cours...</h2>
        <p style="opacity: 0.7;">Veuillez patienter pendant que nous traitons votre paiement.</p>
      </div>
    `;
  }
  
  renderSuccessStep() {
    return `
      <div class="success-message">
        <div class="success-icon">✅</div>
        <h2 class="success-title">Paiement réussi !</h2>
        <p class="success-subtitle">
          ${this.state.nftTokenId ? 'Votre ticket NFT a été créé' : 'Votre achat a été confirmé'}
        </p>
        
        ${this.state.transactionHash ? `
          <div class="transaction-hash">
            Transaction: ${this.state.transactionHash.slice(0, 10)}...${this.state.transactionHash.slice(-8)}
          </div>
        ` : ''}
        
        ${this.state.nftTokenId ? `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <div style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">NFT Token ID</div>
            <div style="font-size: 24px; font-weight: 700;">#${this.state.nftTokenId}</div>
          </div>
        ` : ''}
        
        <button class="btn btn-primary" id="close-btn">
          Fermer
        </button>
      </div>
    `;
  }
  
  renderErrorStep() {
    return `
      <div class="error-message">
        ⚠️ ${this.state.error}
      </div>
      
      <button class="btn btn-primary" id="retry-btn">
        Réessayer
      </button>
    `;
  }
  
  attachEventListeners() {
    // Bouton Acheter
    const buyBtn = this.shadowRoot.getElementById('buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        this.setState({ step: 'payment' });
      });
    }
    
    // Méthodes de paiement
    const methods = this.shadowRoot.querySelectorAll('.payment-method');
    methods.forEach(method => {
      method.addEventListener('click', () => {
        const methodType = method.getAttribute('data-method');
        this.setState({ paymentMethod: methodType });
      });
    });
    
    // Bouton Payer
    const payBtn = this.shadowRoot.getElementById('pay-btn');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        this.processPayment();
      });
    }
    
    // Bouton Fermer
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('payment-closed'));
      });
    }
    
    // Bouton Réessayer
    const retryBtn = this.shadowRoot.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.setState({ step: 'payment', error: null });
      });
    }
  }
}

// Enregistrer le Web Component
customElements.define('paiecashfan-payment', PaieCashFanPayment);

console.log('✅ PaieCashFan Payment Widget loaded');
