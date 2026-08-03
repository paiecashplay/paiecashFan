// ═══════════════════════════════════════════════════════════════
// services/byteplusLiveShopping/activities.js
// Gestion des Live Rooms BytePlus Live pour la boutique.
//
// Responsabilités actuelles :
// - valider les informations d'un live ;
// - construire le body CreateActivityAPIV2 ;
// - appeler BytePlus pour créer une Live Room.
//
// Ce fichier ne communique pas directement avec Supabase.
// ═══════════════════════════════════════════════════════════════

const {
  callBytePlusLiveApi,
} = require('./client');

const MAX_LIVE_DURATION_SECONDS =
  72 * 60 * 60;

const LIVE_MODES = Object.freeze({
  TEMPLATE_DEFAULT: 0,
  ULTRA_LOW: 1,
  NORMAL: 2,
});

/**
 * Crée une erreur métier homogène.
 */
function createValidationError(
  message,
  code,
  field = null
) {
  const error = new Error(message);

  error.code = code;

  if (field) {
    error.field = field;
  }

  return error;
}

/**
 * Convertit une date en timestamp Unix, en secondes.
 *
 * Accepte :
 * - un objet Date ;
 * - une chaîne ISO ;
 * - un timestamp JavaScript en millisecondes.
 */
function toUnixSeconds(
  value,
  fieldName
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  const milliseconds =
    date.getTime();

  if (!Number.isFinite(milliseconds)) {
    throw createValidationError(
      `${fieldName} contient une date invalide.`,
      'BYTEPLUS_INVALID_DATE',
      fieldName
    );
  }

  return Math.floor(
    milliseconds / 1000
  );
}

/**
 * Construit un chemin public BytePlus.
 *
 * BytePlus attend un chemin composé uniquement
 * de lettres et de chiffres, avec 20 caractères maximum.
 */
function buildViewUrlPath({
  clubSlug,
  suffix,
}) {
  const normalizedClub = String(
    clubSlug || 'shop'
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9]/g,
      ''
    )
    .toLowerCase();

  const generatedSuffix = String(
    suffix ||
      Date.now().toString(36)
  )
    .replace(
      /[^a-zA-Z0-9]/g,
      ''
    )
    .toLowerCase();

  const result =
    `${normalizedClub}${generatedSuffix}`
      .slice(0, 20);

  return (
    result ||
    `shop${Date.now().toString(36)}`
      .replace(
        /[^a-zA-Z0-9]/g,
        ''
      )
      .slice(0, 20)
  );
}

/**
 * Vérifie le chemin public de la salle.
 */
function validateViewUrlPath(
  value
) {
  if (
    !/^[a-zA-Z0-9]{1,20}$/.test(
      String(value || '')
    )
  ) {
    throw createValidationError(
      'Le chemin public doit contenir entre 1 et 20 lettres ou chiffres.',
      'BYTEPLUS_INVALID_VIEW_URL_PATH',
      'viewUrlPath'
    );
  }

  return value;
}

/**
 * Traduit notre valeur métier vers la valeur BytePlus.
 */
function normalizeLiveMode(
  value = 'ultra_low'
) {
  const modes = {
    template_default:
      LIVE_MODES.TEMPLATE_DEFAULT,

    ultra_low:
      LIVE_MODES.ULTRA_LOW,

    normal:
      LIVE_MODES.NORMAL,
  };

  if (
    Number.isInteger(value) &&
    Object.values(
      LIVE_MODES
    ).includes(value)
  ) {
    return value;
  }

  if (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(
      modes,
      value
    )
  ) {
    return modes[value];
  }

  throw createValidationError(
    'Le mode de latence doit être template_default, ultra_low ou normal.',
    'BYTEPLUS_INVALID_LIVE_MODE',
    'latencyMode'
  );
}

/**
 * Valide une URL optionnelle.
 */
function normalizeOptionalUrl(
  value,
  fieldName
) {
  const cleanValue =
    String(value || '').trim();

  if (!cleanValue) {
    return null;
  }

  try {
    const url =
      new URL(cleanValue);

    if (
      url.protocol !== 'https:' &&
      url.protocol !== 'http:'
    ) {
      throw new Error(
        'Unsupported protocol'
      );
    }

    return cleanValue;
  } catch {
    throw createValidationError(
      `${fieldName} doit être une URL HTTP ou HTTPS valide.`,
      'BYTEPLUS_INVALID_URL',
      fieldName
    );
  }
}

/**
 * Construit le body de CreateActivityAPIV2.
 *
 * Cette fonction ne fait aucun appel réseau.
 */
function buildCreateActivityPayload({
  name,
  clubSlug,

  scheduledAt = null,
  scheduledEndAt = null,

  enforceStartTime = false,
  autoEnd = false,

  latencyMode = 'ultra_low',

  viewUrlPath = null,

  coverImage = null,
  verticalCoverImage = null,

  templateId = null,
} = {}) {
  const cleanName =
    String(name || '').trim();

  if (!cleanName) {
    throw createValidationError(
      'Le nom du live est obligatoire.',
      'BYTEPLUS_LIVE_NAME_REQUIRED',
      'name'
    );
  }

  const liveTime =
    toUnixSeconds(
      scheduledAt,
      'scheduledAt'
    );

  const endTime =
    toUnixSeconds(
      scheduledEndAt,
      'scheduledEndAt'
    );

  if (
    endTime &&
    !liveTime
  ) {
    throw createValidationError(
      'La date de début est obligatoire lorsqu’une date de fin est renseignée.',
      'BYTEPLUS_START_TIME_REQUIRED',
      'scheduledAt'
    );
  }

  if (
    liveTime &&
    endTime
  ) {
    const duration =
      endTime - liveTime;

    if (duration <= 0) {
      throw createValidationError(
        'La date de fin doit être postérieure à la date de début.',
        'BYTEPLUS_INVALID_LIVE_DURATION',
        'scheduledEndAt'
      );
    }

    if (
      duration >
      MAX_LIVE_DURATION_SECONDS
    ) {
      throw createValidationError(
        'La durée programmée ne doit pas dépasser 72 heures.',
        'BYTEPLUS_LIVE_DURATION_TOO_LONG',
        'scheduledEndAt'
      );
    }
  }

  if (
    autoEnd &&
    !endTime
  ) {
    throw createValidationError(
      'La date de fin est obligatoire lorsque la fin automatique est activée.',
      'BYTEPLUS_END_TIME_REQUIRED',
      'scheduledEndAt'
    );
  }

  const finalViewUrlPath =
    viewUrlPath ||
    buildViewUrlPath({
      clubSlug,
    });

  validateViewUrlPath(
    finalViewUrlPath
  );

  const normalizedCover =
    normalizeOptionalUrl(
      coverImage,
      'coverImage'
    );

  const normalizedVerticalCover =
    normalizeOptionalUrl(
      verticalCoverImage,
      'verticalCoverImage'
    );

  const payload = {
    Name: cleanName,

    LiveMode:
      normalizeLiveMode(
        latencyMode
      ),

    ViewUrlPath:
      finalViewUrlPath,

    IsBeginLiveEnable:
      enforceStartTime
        ? 1
        : 0,

    IsAutoEndEnable:
      autoEnd
        ? 1
        : 0,
  };

  if (liveTime) {
    payload.LiveTime =
      liveTime;
  }

  if (endTime) {
    payload.EndTime =
      endTime;
  }

  if (normalizedCover) {
    payload.CoverImage =
      normalizedCover;
  }

  if (
    normalizedVerticalCover
  ) {
    payload.VerticalCoverImage =
      normalizedVerticalCover;
  }

  if (
    templateId !== undefined &&
    templateId !== null &&
    templateId !== ''
  ) {
    payload.TemplateId =
      String(templateId);
  }

  return payload;
}

/**
 * Crée réellement une Live Room dans BytePlus.
 *
 * Aucun enregistrement Supabase n'est effectué ici.
 */
async function createActivity(
  input
) {
  const payload =
    buildCreateActivityPayload(
      input
    );

  const response =
    await callBytePlusLiveApi({
      action:
        'CreateActivityAPIV2',

      method: 'POST',

      data: payload,
    });

  const activityId =
    response?.Result
      ?.ActivityId;

  if (!activityId) {
    const error = new Error(
      "BytePlus n'a pas renvoyé l'identifiant de la Live Room."
    );

    error.code =
      'BYTEPLUS_ACTIVITY_ID_MISSING';

    error.requestId =
      response?.ResponseMetadata
        ?.RequestId ||
      null;

    throw error;
  }

  return {
    activityId:
      String(activityId),

    requestId:
      response?.ResponseMetadata
        ?.RequestId ||
      null,

    name:
      payload.Name,

    viewUrlPath:
      payload.ViewUrlPath,

    liveMode:
      payload.LiveMode,

    scheduledAt:
      payload.LiveTime ||
      null,

    scheduledEndAt:
      payload.EndTime ||
      null,
  };
}

module.exports = {
  LIVE_MODES,
  MAX_LIVE_DURATION_SECONDS,

  toUnixSeconds,
  buildViewUrlPath,
  validateViewUrlPath,
  normalizeLiveMode,
  normalizeOptionalUrl,

  buildCreateActivityPayload,
  createActivity,
};