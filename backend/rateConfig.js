// ═══════════════════════════════════════════════════════════
// rateConfig.js - PCC pricing with REAL-TIME exchange rates
//
// Flow: Fiat Currency → EURC (real-time FX) → PCC (1:1 fixed)
//
// The conversion model:
//   1. Convert any fiat currency to EUR using live exchange rates
//   2. EUR amount = EURC amount (EURC is pegged 1:1 to EUR)
//   3. EURC amount = PCC amount (fixed 1:1 swap)
//
// Example: 100 USD → ~92 EUR → 92 EURC → 92 PCC
//          100 INR → ~1.07 EUR → 1.07 EURC → 1.07 PCC
// ═══════════════════════════════════════════════════════════

require('dotenv').config();

const FEE_RATE = 0; // Hardcoded to 0 to strictly enforce no platform fees

// ─── Live Exchange Rate Cache ──────────────────────────────
// Rates are cached for 15 minutes to avoid excessive API calls.
// Source: exchangerate-api.com (free, no key required for open endpoint)

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let rateCache = {
  rates: null,        // { usd: 1.08, inr: 91.5, ... } (value of 1 EUR in each currency)
  lastFetched: 0,
  fetching: null,     // promise if currently fetching
};

let cryptoRateCache = {
  prices: {},         // { MATIC: 0.70, ETH: 3200, ... } (value in EUR)
  lastFetched: 0,
  fetching: null
};

// Hardcoded fallback crypto prices (EUR)
const FALLBACK_CRYPTO_PRICES = {
  MATIC: 0.70,
  USDC: 0.93,
  USDT: 0.93,
  DAI: 0.93,
  WETH: 3200,
  WBTC: 60000,
  LINK: 15.00,
  UNI: 7.50,
  EURC: 1.00
};

// Hardcoded fallback rates (approximate) - used ONLY if API is unreachable
const FALLBACK_RATES_PER_EUR = {
  eur: 1.00,
  usd: 1.08,
  gbp: 0.86,
  chf: 0.97,
  jpy: 164.50,
  inr: 91.50,
  aud: 1.66,
  cad: 1.47,
  cny: 7.85,
  brl: 5.40,
  mxn: 18.50,
  zar: 20.10,
  sgd: 1.46,
  hkd: 8.45,
  krw: 1440.00,
  aed: 3.97,
  sar: 4.05,
  sek: 11.35,
  nok: 11.60,
  dkk: 7.46,
  ngn: 1650.00,
  kes: 165.00,
  ghc: 15.80,
  tzs: 2720.00,
  ugx: 4050.00,
  xof: 655.96,
  xaf: 655.96,
  php: 60.50,
  thb: 37.80,
  vnd: 26800.00,
  idr: 17200.00,
  myr: 4.82,
  pkr: 300.00,
  bdt: 118.00,
  lkr: 325.00,
  try: 35.00,
  egp: 52.00,
  mad: 10.80,
  tnd: 3.35,
  ars: 950.00,
  clp: 1020.00,
  cop: 4300.00,
  pen: 4.00,
  uyu: 42.50,
};

/**
 * Fetch live exchange rates from exchangerate-api.com
 * Returns rates as: how much of each currency = 1 EUR
 */
async function fetchLiveRates() {
  // If already fetching, wait for that promise
  if (rateCache.fetching) return rateCache.fetching;

  rateCache.fetching = (async () => {
    try {
      // Dynamic import for node-fetch (works in Node 18+ with native fetch too)
      const fetchFn = globalThis.fetch || (await import('node-fetch')).default;

      const response = await fetchFn(
        'https://open.er-api.com/v6/latest/EUR',
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.result !== 'success' || !data.rates) {
        throw new Error('Invalid response from exchange rate API');
      }

      // Normalise keys to lowercase
      const rates = {};
      for (const [key, value] of Object.entries(data.rates)) {
        rates[key.toLowerCase()] = value;
      }

      rateCache.rates = rates;
      rateCache.lastFetched = Date.now();
      console.log(`  [FX] ✅ Live exchange rates refreshed (${Object.keys(rates).length} currencies)`);

      return rates;
    } catch (err) {
      console.warn(`  [FX] ⚠️  Failed to fetch live rates: ${err.message}. Using ${rateCache.rates ? 'cached' : 'fallback'} rates.`);

      // Use previously cached rates if available, otherwise fallback
      if (!rateCache.rates) {
        rateCache.rates = { ...FALLBACK_RATES_PER_EUR };
        rateCache.lastFetched = Date.now() - CACHE_TTL_MS + 60000; // Retry in 1 min
      }
      return rateCache.rates;
    } finally {
      rateCache.fetching = null;
    }
  })();

  return rateCache.fetching;
}

/**
 * Get the current exchange rates (cached, refreshed every 15 min)
 */
async function getRates() {
  const now = Date.now();
  if (rateCache.rates && (now - rateCache.lastFetched) < CACHE_TTL_MS) {
    return rateCache.rates;
  }
  return fetchLiveRates();
}

/**
 * Fetch live crypto prices in EUR from Binance
 */
async function fetchLiveCryptoPrices() {
  if (cryptoRateCache.fetching) return cryptoRateCache.fetching;

  cryptoRateCache.fetching = (async () => {
    try {
      const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
      const symbols = ["MATICEUR", "ETHEUR", "BTCEUR", "LINKEUR", "UNIEUR", "EURUSDT"];
      const url = `https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`;

      const response = await fetchFn(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Binance API returned ${response.status}`);

      const data = await response.json();
      const prices = {};
      data.forEach(t => {
        if (t.symbol === 'MATICEUR') prices.MATIC = parseFloat(t.price);
        if (t.symbol === 'ETHEUR') prices.WETH = parseFloat(t.price);
        if (t.symbol === 'BTCEUR') prices.WBTC = parseFloat(t.price);
        if (t.symbol === 'LINKEUR') prices.LINK = parseFloat(t.price);
        if (t.symbol === 'UNIEUR') prices.UNI = parseFloat(t.price);
        if (t.symbol === 'EURUSDT') {
          const eurUsd = parseFloat(t.price);
          prices.USDT = eurUsd > 0 ? (1 / eurUsd) : 0.93;
          prices.USDC = prices.USDT; // USDC/USDT parity for conversion
          prices.DAI = prices.USDT;
        }
      });

      prices.EURC = 1.00;

      cryptoRateCache.prices = prices;
      cryptoRateCache.lastFetched = Date.now();
      return prices;
    } catch (err) {
      console.warn(`  [FX] ⚠️ Failed to fetch crypto prices: ${err.message}`);
      if (!cryptoRateCache.prices || Object.keys(cryptoRateCache.prices).length === 0) {
        cryptoRateCache.prices = { ...FALLBACK_CRYPTO_PRICES };
      }
      return cryptoRateCache.prices;
    } finally {
      cryptoRateCache.fetching = null;
    }
  })();

  return cryptoRateCache.fetching;
}

/**
 * Get current crypto prices in EUR
 */
async function getCryptoRates() {
  const now = Date.now();
  if (Object.keys(cryptoRateCache.prices).length > 0 && (now - cryptoRateCache.lastFetched) < CACHE_TTL_MS) {
    return cryptoRateCache.prices;
  }
  return fetchLiveCryptoPrices();
}

/**
 * Convert a crypto amount to EUR equivalent
 */
async function convertCryptoToEUR(symbol, amount) {
  const rates = await getCryptoRates();
  const price = rates[symbol.toUpperCase()] || FALLBACK_CRYPTO_PRICES[symbol.toUpperCase()] || 0;
  return amount * price;
}

/**
 * Convert a fiat amount to EURC (and therefore PCC, since EURC:PCC = 1:1)
 *
 * @param {string} currency - ISO currency code (e.g. 'usd', 'inr', 'gbp')
 * @param {number} fiatAmount - Amount in the source currency
 * @returns {Promise<number>} Equivalent EURC/PCC amount
 */
async function convertToEURC(currency, fiatAmount) {
  const key = (currency || 'eur').toLowerCase();
  const amount = parseFloat(fiatAmount) || 0;

  if (key === 'eur') return amount; // Already EUR, no conversion needed

  const rates = await getRates();
  const ratePerEUR = rates[key];

  if (!ratePerEUR || ratePerEUR <= 0) {
    console.warn(`  [FX] Unknown currency "${key}", treating as EUR 1:1`);
    return amount;
  }

  // fiatAmount / ratePerEUR = EUR equivalent
  // e.g. 100 USD / 1.08 = 92.59 EUR = 92.59 EURC = 92.59 PCC
  return amount / ratePerEUR;
}

/**
 * Get the price per PCC in a given fiat currency (real-time)
 *
 * @param {string} currency - ISO currency code
 * @param {number} pccAmount - Number of PCC requested
 * @returns {Promise<{pricePerPCC: number, tierLabel: string}>}
 */
async function getRate(currency, pccAmount) {
  const key = (currency || 'eur').toLowerCase();
  const rates = await getRates();
  const ratePerEUR = rates[key] || 1.00;

  // 1 PCC = 1 EURC = 1 EUR → in local currency that's `ratePerEUR`
  // e.g. 1 PCC = 1.08 USD, 1 PCC = 91.50 INR
  return {
    pricePerPCC: ratePerEUR,
    tierLabel: 'live-fx',
    rateSource: rateCache.lastFetched > Date.now() - CACHE_TTL_MS + 60000 ? 'live' : 'fallback'
  };
}

/**
 * Calculate the fiat cost for a given number of PCC coins (async, real-time rates)
 *
 * @param {string} currency - ISO currency code
 * @param {number} pccAmount - Number of PCC requested
 * @returns {Promise<object>} Pricing breakdown
 */
async function calculatePrice(currency, pccAmount) {
  const { pricePerPCC, tierLabel, rateSource } = await getRate(currency, pccAmount);
  const coins = parseFloat(pccAmount) || 0;
  const fiatSubtotal = coins * pricePerPCC;
  const platformFee = fiatSubtotal * FEE_RATE;

  // For currencies like JPY/KRW, we don't want decimals
  const isZeroDecimal = ['jpy', 'krw', 'vnd', 'idr', 'ugx', 'cop', 'clp'].includes(
    (currency || '').toLowerCase()
  );

  const fiatTotal = isZeroDecimal
    ? Math.round(fiatSubtotal + platformFee)
    : Math.round((fiatSubtotal + platformFee) * 100) / 100;

  // EURC equivalent (what the user actually gets - 1 EURC = 1 PCC)
  const eurcEquivalent = coins;

  return {
    pccAmount: coins,
    eurcEquivalent,
    fiatSubtotal: isZeroDecimal ? Math.round(fiatSubtotal) : Math.round(fiatSubtotal * 100) / 100,
    platformFee: isZeroDecimal ? Math.round(platformFee) : Math.round(platformFee * 100) / 100,
    fiatTotal,
    pricePerPCC,
    tierLabel,
    feeRate: FEE_RATE,
    rateSource,
    conversionModel: `${coins} PCC = ${coins} EURC = ${fiatTotal} ${(currency || 'EUR').toUpperCase()}`
  };
}

/**
 * Get all supported currencies with their current rates
 */
async function getAllTiers() {
  const rates = await getRates();
  const supported = {};

  for (const [key, rate] of Object.entries(rates)) {
    supported[key] = {
      pricePerPCC: rate,       // How much 1 PCC costs in this currency
      rateToEUR: 1 / rate,     // How much EUR you get per 1 unit of this currency
    };
  }

  return { currencies: supported };
}

/**
 * Synchronous version of getRate for backward compatibility.
 * Uses cached rates (returns fallback if cache is empty).
 */
function getRateSync(currency, pccAmount) {
  const key = (currency || 'eur').toLowerCase();
  const rates = rateCache.rates || FALLBACK_RATES_PER_EUR;
  const ratePerEUR = rates[key] || 1.00;

  return {
    pricePerPCC: ratePerEUR,
    tierLabel: rateCache.rates ? 'live-fx' : 'fallback'
  };
}

/**
 * Synchronous version of calculatePrice for backward compatibility.
 */
function calculatePriceSync(currency, pccAmount) {
  const { pricePerPCC, tierLabel } = getRateSync(currency, pccAmount);
  const coins = parseFloat(pccAmount) || 0;
  const fiatSubtotal = coins * pricePerPCC;
  const platformFee = fiatSubtotal * FEE_RATE;

  const isZeroDecimal = ['jpy', 'krw', 'vnd', 'idr', 'ugx', 'cop', 'clp'].includes(
    (currency || '').toLowerCase()
  );

  const fiatTotal = isZeroDecimal
    ? Math.round(fiatSubtotal + platformFee)
    : Math.round((fiatSubtotal + platformFee) * 100) / 100;

  return {
    pccAmount: coins,
    eurcEquivalent: coins,
    fiatSubtotal: isZeroDecimal ? Math.round(fiatSubtotal) : Math.round(fiatSubtotal * 100) / 100,
    platformFee: isZeroDecimal ? Math.round(platformFee) : Math.round(platformFee * 100) / 100,
    fiatTotal,
    pricePerPCC,
    tierLabel,
    feeRate: FEE_RATE,
  };
}

// Pre-warm the cache on module load
fetchLiveRates().catch(() => { });

module.exports = {
  getRate,
  getRateSync,
  calculatePrice,
  calculatePriceSync,
  getAllTiers,
  convertToEURC,
  getRates,
  getCryptoRates,
  convertCryptoToEUR,
  FEE_RATE,
  FALLBACK_RATES_PER_EUR,
};
