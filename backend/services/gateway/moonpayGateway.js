// ═══════════════════════════════════════════════════════════════
// services/gateway/moonpayGateway.js - MoonPay on-ramp provider
// Docs: https://dev.moonpay.com
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const BaseGateway = require('./baseGateway');
const { BRAND_COLOR, MOONPAY_CURRENCY_MAP } = require('./gatewayConfig');

const MOONPAY_BASE_URLS = {
  sandbox: 'https://buy-sandbox.moonpay.com',
  production: 'https://buy.moonpay.com',
};

/**
 * MoonPay transaction status → internal status mapping
 */
const MOONPAY_STATUS_MAP = {
  waitingPayment: 'pending',
  pending: 'processing',
  waitingAuthorization: 'processing',
  completed: 'completed',
  failed: 'failed',
  expired: 'failed',
};

class MoonPayGateway extends BaseGateway {
  constructor(config) {
    super({
      name: 'moonpay',
      environment: config.environment || 'sandbox',
      apiKey: config.apiKey,
      secret: config.secret,
      webhookSecret: config.webhookSecret,
    });
  }

  /**
   * Get the base URL for the MoonPay widget
   */
  getBaseUrl() {
    return this.isProduction()
      ? MOONPAY_BASE_URLS.production
      : MOONPAY_BASE_URLS.sandbox;
  }

  /**
   * Map our crypto symbol to MoonPay's currency code
   */
  getMoonPayCurrencyCode(symbol) {
    return MOONPAY_CURRENCY_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  /**
   * Create a MoonPay order by building a signed widget URL
   * MoonPay requires the URL to be signed with the secret key
   */
  async createOrder(params) {
    const {
      cryptoCurrency,
      fiatAmount,
      fiatCurrency = 'EUR',
      walletAddress,
      email,
      idempotencyKey,
      redirectUrl,
    } = params;

    const currencyCode = this.getMoonPayCurrencyCode(cryptoCurrency);

    // Build query parameters
    const queryParams = new URLSearchParams({
      apiKey: this.apiKey,
      currencyCode: currencyCode,
      walletAddress: walletAddress,
      baseCurrencyCode: fiatCurrency.toLowerCase(),
      externalTransactionId: idempotencyKey,
      colorCode: `#${BRAND_COLOR}`,
      showWalletAddressForm: 'false',
    });

    // Optional parameters
    if (fiatAmount && fiatAmount > 0) {
      queryParams.set('baseCurrencyAmount', fiatAmount.toString());
    }
    if (email) {
      queryParams.set('email', email);
    }
    if (redirectUrl) {
      queryParams.set('redirectURL', redirectUrl);
    }

    // Sign the URL with MOONPAY_SECRET_KEY
    const urlToSign = `?${queryParams.toString()}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(urlToSign)
      .digest('base64');

    queryParams.set('signature', signature);

    const widgetUrl = `${this.getBaseUrl()}?${queryParams.toString()}`;

    const orderId = idempotencyKey;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    return {
      orderId,
      widgetUrl,
      expiresAt,
      provider: 'moonpay',
    };
  }

  /**
   * Fetch order status from MoonPay API
   * GET /v1/transactions/ext/{externalTransactionId}
   */
  async getOrderStatus(orderId) {
    try {
      const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
      const baseApi = this.isProduction()
        ? 'https://api.moonpay.com'
        : 'https://api.moonpay.com';

      const response = await fetchFn(
        `${baseApi}/v1/transactions/ext/${orderId}?apiKey=${this.apiKey}`,
        {
          headers: { 'accept': 'application/json' },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`MoonPay API returned ${response.status}`);
      }

      const data = await response.json();
      // MoonPay may return an array - take the latest
      const tx = Array.isArray(data) ? data[0] : data;

      if (!tx) {
        return { status: 'unknown', receivedAmount: 0, receivedCurrency: '', providerFee: 0 };
      }

      return {
        status: tx.status || 'unknown',
        receivedAmount: parseFloat(tx.quoteCurrencyAmount) || 0,
        receivedCurrency: (tx.quoteCurrency?.code || tx.cryptoCurrency || '').toUpperCase(),
        providerFee: parseFloat(tx.feeAmount) || 0,
        fiatAmount: parseFloat(tx.baseCurrencyAmount) || 0,
        fiatCurrency: (tx.baseCurrency?.code || tx.currency || 'EUR').toUpperCase(),
        cryptoAmount: parseFloat(tx.quoteCurrencyAmount) || 0,
        cryptoCurrency: (tx.quoteCurrency?.code || '').toUpperCase(),
        txHash: tx.cryptoTransactionId || '',
      };
    } catch (err) {
      console.error(`[MoonPay] getOrderStatus error for ${orderId}:`, err.message);
      return { status: 'unknown', receivedAmount: 0, receivedCurrency: '', providerFee: 0 };
    }
  }

  /**
   * Verify MoonPay webhook signature (V2 format)
   *
   * MoonPay sends signature in 'moonpay-signature-v2' header
   * Format: "t=timestamp,s=hash"
   */
  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!signatureHeader || !this.webhookSecret) return false;

    try {
      // Parse the signature header
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find(p => p.startsWith('t='));
      const signaturePart = parts.find(p => p.startsWith('s='));

      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.split('=')[1];
      const receivedHash = signaturePart.split('=')[1];

      // Replay protection - reject if older than 5 minutes
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
        console.error('[MoonPay] Webhook timestamp too old - possible replay');
        return false;
      }

      // Compute expected signature: timestamp + "." + rawBody
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const payload = `${timestamp}.${bodyStr}`;
      const expectedHash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      if (expectedHash.length !== receivedHash.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(expectedHash, 'utf8'),
        Buffer.from(receivedHash, 'utf8')
      );
    } catch (err) {
      console.error('[MoonPay] Signature verification error:', err.message);
      return false;
    }
  }

  /**
   * Parse MoonPay webhook event into a normalized structure
   *
   * MoonPay webhook payload:
   * {
   *   type: "transaction_updated",
   *   data: {
   *     id: "moonpay-tx-id",
   *     externalTransactionId: "our-idempotency-key",
   *     status: "completed",
   *     baseCurrencyAmount: 50,
   *     baseCurrency: "eur",
   *     quoteCurrencyAmount: 0.025,
   *     cryptoCurrency: "eth",
   *     feeAmount: 1.50,
   *     cryptoTransactionId: "0x...",
   *     walletAddress: "0x...",
   *     ...
   *   }
   * }
   */
  parseWebhookEvent(payload) {
    const eventType = payload.type || '';
    const data = payload.data || {};

    // Map MoonPay status to our internal status
    let status = 'unknown';
    if (eventType === 'transaction_created') {
      status = 'pending';
    } else if (eventType === 'transaction_failed') {
      status = 'failed';
    } else if (eventType === 'transaction_updated' || eventType === 'transaction_completed') {
      status = MOONPAY_STATUS_MAP[data.status] || 'unknown';
    }

    return {
      orderId: data.id || '',
      partnerOrderId: data.externalTransactionId || '',
      status,
      rawEvent: eventType,
      cryptoAmount: parseFloat(data.quoteCurrencyAmount) || 0,
      cryptoCurrency: (data.cryptoCurrency || data.quoteCurrency || '').toUpperCase(),
      fiatAmount: parseFloat(data.baseCurrencyAmount) || 0,
      fiatCurrency: (data.baseCurrency || 'EUR').toUpperCase(),
      receivedAmount: parseFloat(data.quoteCurrencyAmount) || 0,
      receivedCurrency: 'USDC', // MoonPay sends to treasury as USDC
      providerFee: parseFloat(data.feeAmount) || 0,
      walletAddress: data.walletAddress || '',
      txHash: data.cryptoTransactionId || '',
    };
  }

  /**
   * Supported cryptocurrencies
   */
  getSupportedCryptos() {
    return ['ETH', 'BTC', 'SOL', 'BNB', 'USDC', 'MATIC'];
  }

  /**
   * MoonPay country support (excluding OFAC-sanctioned)
   */
  getSupportedCountries() {
    return 'ALL'; // Except blocked countries handled via PROVIDER_BLOCKED_COUNTRIES
  }
}

module.exports = MoonPayGateway;
