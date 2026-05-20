// ═══════════════════════════════════════════════════════════════
// services/gateway/gatewayConfig.js - Crypto gateway configuration
// Supported cryptos, provider mappings, brand assets
// ═══════════════════════════════════════════════════════════════

/**
 * All supported cryptocurrencies across all providers
 * logo fields use public CDN URLs for crypto icons
 */
const SUPPORTED_CRYPTOS = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    decimals: 18,
    network: 'ethereum',
  },
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
    decimals: 8,
    network: 'bitcoin',
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
    decimals: 9,
    network: 'solana',
  },
  BNB: {
    name: 'BNB',
    symbol: 'BNB',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    decimals: 18,
    network: 'bsc',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    decimals: 6,
    network: 'ethereum',
  },
  MATIC: {
    name: 'Polygon',
    symbol: 'MATIC',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    decimals: 18,
    network: 'polygon',
  },
};

/**
 * Provider priority order for automatic fallback
 */
const PROVIDER_PRIORITY = ['moonpay', 'transak'];

/**
 * Which cryptos each provider supports
 */
const PROVIDER_CRYPTO_SUPPORT = {
  transak: ['ETH', 'BTC', 'SOL', 'BNB', 'USDC', 'MATIC', 'AVAX', 'DOGE'],
  moonpay: ['ETH', 'BTC', 'SOL', 'BNB', 'USDC', 'MATIC'],
};

/**
 * Countries where each provider is NOT available
 * (blocklist approach - if country is here, provider can't be used)
 */
const PROVIDER_BLOCKED_COUNTRIES = {
  transak: [],              // Transak covers 170+ countries
  moonpay: ['CU', 'IR', 'KP', 'SY'],  // OFAC-sanctioned countries
};

/**
 * MoonPay currency code mappings
 * MoonPay uses lowercase suffixed currency codes
 */
const MOONPAY_CURRENCY_MAP = {
  ETH: 'eth',
  BTC: 'btc',
  SOL: 'sol',
  BNB: 'bnb_bsc',
  USDC: 'usdc',
  MATIC: 'matic_polygon',
};

/**
 * Brand color for the PaieCashCoin platform (used in provider widgets)
 */
const BRAND_COLOR = '1B7E7E';

/**
 * Order expiry time in minutes
 */
const ORDER_EXPIRY_MINUTES = 30;

/**
 * Maximum retry window for failed mints (hours)
 */
const MINT_RETRY_MAX_HOURS = 2;

/**
 * Retry interval for the mint retry cron job (minutes)
 */
const MINT_RETRY_INTERVAL_MINUTES = 10;

module.exports = {
  SUPPORTED_CRYPTOS,
  PROVIDER_PRIORITY,
  PROVIDER_CRYPTO_SUPPORT,
  PROVIDER_BLOCKED_COUNTRIES,
  MOONPAY_CURRENCY_MAP,
  BRAND_COLOR,
  ORDER_EXPIRY_MINUTES,
  MINT_RETRY_MAX_HOURS,
  MINT_RETRY_INTERVAL_MINUTES,
};
