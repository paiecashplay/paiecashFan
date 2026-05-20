// ═══════════════════════════════════════════════════════════════
// services/gateway/baseGateway.js - Abstract base class
// All crypto on-ramp providers (Transak, MoonPay, etc.) extend this
// ═══════════════════════════════════════════════════════════════

class BaseGateway {
  /**
   * @param {object} config
   * @param {string} config.name        - Provider name ('transak' | 'moonpay')
   * @param {string} config.environment - 'STAGING' | 'PRODUCTION' | 'sandbox' | 'production'
   * @param {string} config.apiKey      - Public/publishable API key
   * @param {string} config.secret      - Secret key for signing / webhook verification
   * @param {string} config.webhookSecret - Dedicated webhook signing secret (if different from secret)
   */
  constructor(config) {
    if (new.target === BaseGateway) {
      throw new Error('BaseGateway is abstract - instantiate a provider subclass instead.');
    }
    this.name = config.name;
    this.environment = config.environment;
    this.apiKey = config.apiKey;
    this.secret = config.secret;
    this.webhookSecret = config.webhookSecret || config.secret;
  }

  /**
   * Create a crypto purchase order and return a widget URL for the fan
   *
   * @param {object} params
   * @param {string} params.userId          - Internal user UUID
   * @param {string} params.tenantId        - Tenant/club UUID (optional)
   * @param {string} params.cryptoCurrency  - e.g. 'ETH', 'BTC', 'SOL'
   * @param {number} params.fiatAmount      - EUR amount (optional - fan can choose in widget)
   * @param {string} params.fiatCurrency    - ISO currency code (default 'EUR')
   * @param {string} params.walletAddress   - Treasury wallet address
   * @param {string} params.email           - Fan's email for pre-fill
   * @param {string} params.idempotencyKey  - Unique key to prevent duplicate orders
   * @param {string} params.redirectUrl     - Where to redirect after payment
   * @param {string} params.webhookUrl      - Server webhook URL for this provider
   *
   * @returns {Promise<{orderId: string, widgetUrl: string, expiresAt: string}>}
   */
  async createOrder(params) {
    throw new Error(`${this.name}: createOrder() not implemented`);
  }

  /**
   * Fetch live order status from the provider API
   *
   * @param {string} orderId - Provider's order ID
   * @returns {Promise<{status: string, receivedAmount: number, receivedCurrency: string, providerFee: number}>}
   */
  async getOrderStatus(orderId) {
    throw new Error(`${this.name}: getOrderStatus() not implemented`);
  }

  /**
   * Verify webhook signature from the provider
   *
   * @param {Buffer|string} rawBody   - Raw request body (before JSON.parse)
   * @param {string}        signature - Signature from request headers
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, signature) {
    throw new Error(`${this.name}: verifyWebhookSignature() not implemented`);
  }

  /**
   * Parse a webhook event payload into a normalized structure
   *
   * @param {object} payload - Parsed JSON body from the webhook
   * @returns {{
   *   orderId: string,
   *   partnerOrderId: string,
   *   status: string,
   *   cryptoAmount: number,
   *   cryptoCurrency: string,
   *   fiatAmount: number,
   *   fiatCurrency: string,
   *   receivedAmount: number,
   *   receivedCurrency: string,
   *   providerFee: number,
   *   rawEvent: string
   * }}
   */
  parseWebhookEvent(payload) {
    throw new Error(`${this.name}: parseWebhookEvent() not implemented`);
  }

  /**
   * Return the list of crypto symbols this provider supports
   * @returns {string[]} e.g. ['ETH','BTC','SOL','BNB','USDC','MATIC']
   */
  getSupportedCryptos() {
    throw new Error(`${this.name}: getSupportedCryptos() not implemented`);
  }

  /**
   * Return supported country codes, or 'ALL'
   * @returns {string[]|string}
   */
  getSupportedCountries() {
    throw new Error(`${this.name}: getSupportedCountries() not implemented`);
  }

  /**
   * Check if this provider is available in a specific country
   * @param {string} countryCode - ISO 3166-1 alpha-2 (e.g. 'GB', 'US', 'NG')
   * @returns {boolean}
   */
  isAvailableInCountry(countryCode) {
    const countries = this.getSupportedCountries();
    if (countries === 'ALL') return true;
    if (Array.isArray(countries)) {
      return countries.includes(countryCode.toUpperCase());
    }
    return true; // Default to available if unknown
  }

  /**
   * Check if this provider supports a specific cryptocurrency
   * @param {string} cryptoSymbol - e.g. 'ETH'
   * @returns {boolean}
   */
  supportsCrypto(cryptoSymbol) {
    return this.getSupportedCryptos().includes(cryptoSymbol.toUpperCase());
  }

  /**
   * Whether this provider is in production mode
   * @returns {boolean}
   */
  isProduction() {
    const env = (this.environment || '').toLowerCase();
    return env === 'production';
  }
}

module.exports = BaseGateway;
