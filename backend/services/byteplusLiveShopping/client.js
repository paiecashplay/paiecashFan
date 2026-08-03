// ═══════════════════════════════════════════════════════════════
// services/byteplusLiveShopping/client.js
// Client signé AK/SK pour BytePlus Live OpenAPI.
// ═══════════════════════════════════════════════════════════════

const {
  Service,
} = require('@volcengine/openapi');

const {
  config,
  assertConfigured,
} = require('./config');

let clientInstance = null;

/**
 * Crée le client OpenAPI BytePlus Live.
 *
 * Aucun appel réseau n'est effectué à ce moment.
 */
function createBytePlusLiveClient() {
  assertConfigured();

  const service = new Service({
    region: config.region,
    host: config.endpoint,
    serviceName: config.serviceName,
  });

  service.setAccessKeyId(
    config.accessKey
  );

  service.setSecretKey(
    config.secretKey
  );

  return service;
}

/**
 * Retourne une instance unique du client.
 */
function getBytePlusLiveClient() {
  if (!clientInstance) {
    clientInstance =
      createBytePlusLiveClient();
  }

  return clientInstance;
}

/**
 * Appelle une opération BytePlus Live signée.
 *
 * Exemple futur :
 *
 * callBytePlusLiveApi({
 *   action: 'CreateActivityAPIV2',
 *   data: {
 *     Name: 'Boutique en direct'
 *   }
 * });
 */
async function callBytePlusLiveApi({
  action,
  version = config.apiVersion,
  method = 'POST',
  data = {},
  query = {},
}) {
  if (
    typeof action !== 'string' ||
    !action.trim()
  ) {
    const error = new Error(
      'Une action BytePlus valide est obligatoire.'
    );

    error.code =
      'BYTEPLUS_INVALID_ACTION';

    throw error;
  }

  const client =
    getBytePlusLiveClient();

  try {
    const response =
      await client.fetchOpenAPI({
        Action: action.trim(),
        Version: version,
        method,
        data,
        params: query,
      });

    const metadata =
      response?.ResponseMetadata || {};

    if (metadata.Error) {
      const error = new Error(
        metadata.Error.Message ||
        `Erreur BytePlus pendant ${action}.`
      );

      error.code =
        metadata.Error.Code ||
        'BYTEPLUS_API_ERROR';

      error.requestId =
        metadata.RequestId || null;

      error.byteplusError =
        metadata.Error;

      throw error;
    }

    return response;
  } catch (error) {
    if (
      error.code ===
        'BYTEPLUS_LIVE_NOT_CONFIGURED' ||
      error.code ===
        'BYTEPLUS_INVALID_ACTION' ||
      error.code ===
        'BYTEPLUS_API_ERROR'
    ) {
      throw error;
    }

    const wrappedError = new Error(
      error?.message ||
      `Échec de l'appel BytePlus ${action}.`
    );

    wrappedError.code =
      'BYTEPLUS_REQUEST_FAILED';

    wrappedError.cause = error;

    throw wrappedError;
  }
}

/**
 * Réinitialise l'instance pour les tests.
 */
function resetBytePlusLiveClient() {
  clientInstance = null;
}

module.exports = {
  createBytePlusLiveClient,
  getBytePlusLiveClient,
  callBytePlusLiveApi,
  resetBytePlusLiveClient,
};