// ═══════════════════════════════════════════════════════════════
// services/byteplusLiveShopping/config.js
// Configuration serveur BytePlus Live SaaS pour le live shopping.
//
// Ce module reste indépendant de services/byteplus.js,
// utilisé pour le streaming Fan Club / match.
// ═══════════════════════════════════════════════════════════════

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
}

const config = Object.freeze({
  accessKey:
    process.env.BYTEPLUS_LIVE_ACCESS_KEY || '',

  secretKey:
    process.env.BYTEPLUS_LIVE_SECRET_KEY || '',

  region:
    process.env.BYTEPLUS_LIVE_REGION ||
    'ap-singapore-1',

  endpoint:
    process.env.BYTEPLUS_LIVE_API_ENDPOINT ||
    'open.byteplusapi.com',

  serviceName: 'livesaas',

  apiVersion:
    process.env.BYTEPLUS_LIVE_API_VERSION ||
    '2020-06-01',

  accountId:
    process.env.BYTEPLUS_LIVE_ACCOUNT_ID || '',

  callbackSecret:
    process.env.BYTEPLUS_LIVE_CALLBACK_SECRET || '',

  requestTimeoutMs: parsePositiveInteger(
    process.env.BYTEPLUS_LIVE_TIMEOUT_MS,
    15000
  ),
});

function getMissingConfiguration() {
  const missing = [];

  if (!config.accessKey) {
    missing.push('BYTEPLUS_LIVE_ACCESS_KEY');
  }

  if (!config.secretKey) {
    missing.push('BYTEPLUS_LIVE_SECRET_KEY');
  }

  return missing;
}

function isConfigured() {
  return getMissingConfiguration().length === 0;
}

function assertConfigured() {
  const missing = getMissingConfiguration();

  if (missing.length === 0) {
    return;
  }

  const error = new Error(
    `BytePlus Live Shopping non configuré. Variables manquantes : ${missing.join(', ')}.`
  );

  error.code = 'BYTEPLUS_LIVE_NOT_CONFIGURED';
  error.missing = missing;

  throw error;
}

function getSafeConfiguration() {
  return {
    configured: isConfigured(),
    region: config.region,
    endpoint: config.endpoint,
    serviceName: config.serviceName,
    apiVersion: config.apiVersion,

    accessKeyConfigured:
      Boolean(config.accessKey),

    secretKeyConfigured:
      Boolean(config.secretKey),

    accountIdConfigured:
      Boolean(config.accountId),

    callbackSecretConfigured:
      Boolean(config.callbackSecret),

    requestTimeoutMs:
      config.requestTimeoutMs,

    missing:
      getMissingConfiguration(),
  };
}

module.exports = {
  config,
  isConfigured,
  assertConfigured,
  getMissingConfiguration,
  getSafeConfiguration,
};