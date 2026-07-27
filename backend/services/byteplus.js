// ═══════════════════════════════════════════════════════════════
// services/byteplus.js — Intégration BytePlus Live (streaming vidéo).
// ---------------------------------------------------------------
// ⚠️ SQUELETTE / point d'entrée. La lecture HLS d'un flux .m3u8 fonctionne DÉJÀ
//    sans ce service (le club colle une URL de lecture dans le BO). Ce module
//    servira à AUTOMATISER la création du live côté BytePlus :
//      · créer un live → récupérer l'URL de PUSH (RTMP, pour OBS / le club)
//        + l'URL de PULL (HLS .m3u8, pour les fans).
//
// À COMPLÉTER quand on aura, côté BytePlus :
//   1. le PRODUIT VIDÉO activé (BytePlus Live / RTC), PAS ModelArk (IA) ;
//   2. les clés de signature : BYTEPLUS_ACCESS_KEY + BYTEPLUS_SECRET_KEY
//      (l'auth BytePlus Live se fait par SIGNATURE AK/SK, pas par la clé ark-) ;
//   3. la région/endpoint (ex. ap-southeast-1) + éventuels domaines push/pull.
//
// ⚠️ BYTEPLUS_API_KEY (ark-…) = ModelArk (IA générative) → NE convient PAS ici.
// Doc : https://docs.byteplus.com/en/docs/byteplus-livesaas/docs-API-list
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  accessKey:    process.env.BYTEPLUS_ACCESS_KEY || '',
  secretKey:    process.env.BYTEPLUS_SECRET_KEY || '',
  region:       process.env.BYTEPLUS_LIVE_REGION || 'ap-southeast-1',
  endpoint:     process.env.BYTEPLUS_LIVE_ENDPOINT || '',
  pushDomain:   process.env.BYTEPLUS_PUSH_DOMAIN || '',
  pullDomain:   process.env.BYTEPLUS_PULL_DOMAIN || '',
};

// Vrai seulement quand les clés de SIGNATURE (AK/SK) du produit vidéo sont là.
function isConfigured() {
  return !!(CONFIG.accessKey && CONFIG.secretKey);
}

// TODO : crée un live et renvoie { pushUrl (RTMP), pullUrl (HLS .m3u8) }.
// Implémentation à faire avec l'API signée BytePlus Live (CreateActivityAPIV2 /
// GetStreamsAPI selon le produit) une fois AK/SK + endpoint confirmés.
async function createLiveStream(/* { clubSlug, title } */) {
  if (!isConfigured()) {
    const e = new Error('BytePlus Live non configuré (clés AK/SK manquantes).');
    e.code = 'BYTEPLUS_NOT_CONFIGURED';
    throw e;
  }
  throw new Error('createLiveStream : à implémenter (API signée BytePlus Live).');
}

module.exports = { isConfigured, createLiveStream, CONFIG };
