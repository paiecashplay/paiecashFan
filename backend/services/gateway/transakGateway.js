// ═══════════════════════════════════════════════════════════════
// services/gateway/transakGateway.js - Transak on-ramp provider
// Docs: https://docs.transak.com
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const BaseGateway = require('./baseGateway');
const { BRAND_COLOR } = require('./gatewayConfig');

const TRANSAK_BASE_URLS = {
  STAGING: 'https://global-stg.transak.com',
  PRODUCTION: 'https://global.transak.com',
};

/**
 * Transak webhook event → internal status mapping
 */
const TRANSAK_STATUS_MAP = {
  ORDER_CREATED: 'pending',
  ORDER_PROCESSING: 'processing',
  ORDER_PAYMENT_VERIFYING: 'processing',
  ORDER_COMPLETED: 'completed',
  ORDER_FAILED: 'failed',
  ORDER_EXPIRED: 'failed',
  ORDER_REFUNDED: 'refunded',
};

class TransakGateway extends BaseGateway {
  constructor(config) {
    super({
      name: 'transak',
      environment: config.environment || 'STAGING',
      apiKey: config.apiKey,
      secret: config.secret,
      webhookSecret: config.webhookSecret,
    });
  }

  /**
   * Get the base URL for the Transak widget
   */
  getBaseUrl() {
    return this.isProduction()
      ? TRANSAK_BASE_URLS.PRODUCTION
      : TRANSAK_BASE_URLS.STAGING;
  }

  /**
   * Create a Transak order by building a widget URL
   * The fan opens this URL in an iframe/modal to complete payment
   */
  async createOrder(params) {
    const {
      userId,
      cryptoCurrency,
      fiatAmount,
      fiatCurrency = 'EUR',
      walletAddress,
      email,
      idempotencyKey,
      redirectUrl,
      frontendUrl,
    } = params;

    // Build widget query parameters
    const queryParams = new URLSearchParams({
      apiKey: this.apiKey,
      environment: this.environment,
      cryptoCurrencyCode: cryptoCurrency,
      fiatCurrency: fiatCurrency.toUpperCase(),
      walletAddress: walletAddress,
      partnerOrderId: idempotencyKey,
      disableWalletAddressForm: 'true',
      isAutoFillUserData: 'true',
      hideMenu: 'true',
      themeColor: BRAND_COLOR,
      defaultCryptoCurrency: cryptoCurrency,
      cryptoCurrencyList: 'ETH,BTC,SOL,BNB,USDC,MATIC',
    });

    // Optional parameters
    if (fiatAmount && fiatAmount > 0) {
      queryParams.set('fiatAmount', fiatAmount.toString());
    }
    if (email) {
      queryParams.set('email', email);
    }
    if (redirectUrl) {
      queryParams.set('redirectURL', redirectUrl);
    }
    if (frontendUrl) {
      queryParams.set('hostURL', frontendUrl);
    }

    const widgetUrl = `${this.getBaseUrl()}/?${queryParams.toString()}`;

    // Transak orders don't have a pre-created server-side ID
    // The partnerOrderId (idempotencyKey) is used to correlate
    const orderId = idempotencyKey;

    // Order expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    return {
      orderId,
      widgetUrl,
      expiresAt,
      provider: 'transak',
    };
  }

  /**
   * Fetch order status from Transak API
   * GET /partners/api/v2/order/{orderId}
   */
  async getOrderStatus(orderId) {
    try {
      const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
      const baseApi = this.isProduction()
        ? 'https://api.transak.com'
        : 'https://api-stg.transak.com';

      const response = await fetchFn(
        `${baseApi}/partners/api/v2/order/${orderId}`,
        {
          headers: {
            'accept': 'application/json',
            'api-key': this.apiKey,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`Transak API returned ${response.status}`);
      }

      const data = await response.json();
      const order = data.response || data.data || {};

      return {
        status: order.status || 'unknown',
        receivedAmount: parseFloat(order.cryptoAmount) || 0,
        receivedCurrency: order.cryptoCurrency || '',
        providerFee: parseFloat(order.totalFeeInFiat) || 0,
        fiatAmount: parseFloat(order.fiatAmount) || 0,
        fiatCurrency: order.fiatCurrency || 'EUR',
        cryptoAmount: parseFloat(order.cryptoAmount) || 0,
        cryptoCurrency: order.cryptoCurrency || '',
      };
    } catch (err) {
      console.error(`[Transak] getOrderStatus error for ${orderId}:`, err.message);
      return { status: 'unknown', receivedAmount: 0, receivedCurrency: '', providerFee: 0 };
    }
  }

  /**
   * Verify Transak webhook signature
   * Transak signs with HMAC-SHA256 using the webhook secret
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!signature || !this.webhookSecret) return false;

    try {
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(bodyStr)
        .digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      if (expected.length !== signature.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signature, 'utf8')
      );
    } catch (err) {
      console.error('[Transak] Signature verification error:', err.message);
      return false;
    }
  }

  /**
   * Parse Transak webhook event into a normalized structure
   *
   * Transak webhook payload shape:
   * {
   *   webhookData: {
   *     id: "transak-order-id",
   *     partnerOrderId: "our-idempotency-key",
   *     status: "COMPLETED",
   *     cryptocurrency: "ETH",
   *     cryptoAmount: 0.025,
   *     fiatCurrency: "EUR",
   *     fiatAmount: 50,
   *     conversionPrice: 48.5,  // amount received after conversion
   *     totalFeeInFiat: 1.50,
   *     ...
   *   },
   *   eventID: "ORDER_COMPLETED"
   * }
   */
  parseWebhookEvent(payload) {
    const eventId = payload.eventID || payload.event_id || '';
    const data = payload.webhookData || payload.data || {};

    const status = TRANSAK_STATUS_MAP[eventId] || 'unknown';

    return {
      orderId: data.id || '',
      partnerOrderId: data.partnerOrderId || data.partnerCustomerId || '',
      status,
      rawEvent: eventId,
      cryptoAmount: parseFloat(data.cryptoAmount) || 0,
      cryptoCurrency: (data.cryptocurrency || data.cryptoCurrency || '').toUpperCase(),
      fiatAmount: parseFloat(data.fiatAmount) || 0,
      fiatCurrency: (data.fiatCurrency || 'EUR').toUpperCase(),
      receivedAmount: parseFloat(data.conversionPrice || data.cryptoAmount) || 0,
      receivedCurrency: 'USDC', // Transak converts to USDC for treasury
      providerFee: parseFloat(data.totalFeeInFiat) || 0,
      walletAddress: data.walletAddress || '',
      txHash: data.transactionHash || '',
    };
  }

  /**
   * Supported cryptocurrencies
   */
  getSupportedCryptos() {
    return ['ETH', 'BTC', 'SOL', 'BNB', 'USDC', 'MATIC', 'AVAX', 'DOGE'];
  }

  /**
   * Transak is available in 170+ countries
   */
  getSupportedCountries() {
    return 'ALL';
  }
}

module.exports = TransakGateway;
