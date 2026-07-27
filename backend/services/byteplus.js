// ═══════════════════════════════════════════════════════════════
// services/byteplus.js — Streaming vidéo BytePlus MediaLive.
// ---------------------------------------------------------------
// Génère les accès de diffusion d'un club SANS qu'il touche à BytePlus :
//   · URL de PUSH signée (RTMP) → à mettre dans OBS (Serveur + Clé de stream) ;
//   · URL de LECTURE (HLS .m3u8) → pour les fans (lecture non authentifiée).
//
// Le domaine de push a l'authentification d'URL activée (Type B, md5). Sans
// signature valide, un push est refusé → seul notre backend (qui connaît la clé
// secrète) peut autoriser un club à diffuser sur SA chaîne (anti-piratage).
//
// Signature « Type B » (validée sur la doc BytePlus + en réel) :
//   sign = md5("/" + appName + "/" + streamName + secretKey + expire)
//   URL  = rtmp://{pushDomain}/{app}/{stream}?expire={ts}&sign={md5}
//
// ⚠️ BYTEPLUS_API_KEY (ark-…) = ModelArk (IA générative) → RIEN à voir ici.
// Doc : https://docs.byteplus.com/en/docs/byteplus-media-live/docs-url-authentication
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');

const CONFIG = {
  pushDomain:  process.env.BYTEPLUS_PUSH_DOMAIN || 'push-live.paiecashfan.com',
  playDomain:  process.env.BYTEPLUS_PLAY_DOMAIN || 'play-live.paiecashfan.com',
  appName:     process.env.BYTEPLUS_APP_NAME || 'live',
  pushAuthKey: process.env.BYTEPLUS_PUSH_AUTH_KEY || '',
  // Durée de validité d'une URL de push (clé OBS) : 7 jours par défaut.
  pushTtl:     Number(process.env.BYTEPLUS_PUSH_TTL || 604800),
};

// Vrai quand la clé d'authentification du push est présente (sinon on ne peut
// pas signer → le mode natif est indisponible, on retombe sur les liens externes).
function isConfigured() {
  return !!(CONFIG.pushDomain && CONFIG.playDomain && CONFIG.pushAuthKey);
}

// Signature Type B (md5).
function signPush(streamName, expire) {
  const raw = `/${CONFIG.appName}/${streamName}${CONFIG.pushAuthKey}${expire}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

// Accès de PUSH signés (pour OBS). `ttl` = durée de validité en secondes.
function pushInfo(streamName, ttl = CONFIG.pushTtl) {
  const expire = Math.floor(Date.now() / 1000) + Math.max(60, Number(ttl) || CONFIG.pushTtl);
  const sign = signPush(streamName, expire);
  const query = `expire=${expire}&sign=${sign}`;
  return {
    // OBS : « Serveur » + « Clé de stream » (la clé porte les paramètres signés).
    server:   `rtmp://${CONFIG.pushDomain}/${CONFIG.appName}/`,
    streamKey: `${streamName}?${query}`,
    rtmpUrl:  `rtmp://${CONFIG.pushDomain}/${CONFIG.appName}/${streamName}?${query}`,
    expire,
  };
}

// URL de LECTURE publique (HLS). La lecture n'est pas authentifiée (les fans
// regardent librement) → URL stable, sans signature.
function playUrl(streamName) {
  return `https://${CONFIG.playDomain}/${CONFIG.appName}/${streamName}.m3u8`;
}

module.exports = { isConfigured, pushInfo, playUrl, signPush, CONFIG };
