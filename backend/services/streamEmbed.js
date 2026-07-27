// ═══════════════════════════════════════════════════════════════
// services/streamEmbed.js — Parsing SÛR d'une URL de live vers un embed.
// Whitelist stricte YouTube / Twitch : on n'accepte JAMAIS une iframe
// arbitraire (anti-injection / clickjacking). Le front reconstruit l'URL
// d'embed finale à partir de { provider, id } (Twitch a besoin de `parent`).
// ═══════════════════════════════════════════════════════════════

// Renvoie { provider, id } ou null si l'URL n'est pas un live YouTube/Twitch reconnu.
function parseStreamUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let u;
  try { u = new URL(url.trim()); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;

  const host = u.hostname.replace(/^www\./, '').toLowerCase();

  // ── YouTube ──
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (u.pathname === '/watch') {
      const v = u.searchParams.get('v');
      if (isId(v)) return { provider: 'youtube', id: v };
    }
    let mm = u.pathname.match(/^\/live\/([\w-]+)/);
    if (mm && isId(mm[1])) return { provider: 'youtube', id: mm[1] };
    mm = u.pathname.match(/^\/embed\/([\w-]+)/);
    if (mm && isId(mm[1])) return { provider: 'youtube', id: mm[1] };
    // Chaîne en direct : /channel/ID/live
    mm = u.pathname.match(/^\/channel\/([\w-]+)\/live/);
    if (mm && isId(mm[1])) return { provider: 'youtube_channel', id: mm[1] };
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    if (isId(id)) return { provider: 'youtube', id };
  }

  // ── Twitch ──
  if (host === 'twitch.tv') {
    const ch = u.pathname.split('/').filter(Boolean)[0];
    if (isChannel(ch)) return { provider: 'twitch', id: ch };
  }
  if (host === 'player.twitch.tv') {
    const ch = u.searchParams.get('channel');
    if (isChannel(ch)) return { provider: 'twitch', id: ch };
  }

  // ── HLS (.m3u8) ── flux vidéo direct : URL de lecture BytePlus Live, ou tout
  // flux HLS https (lu dans une <video>, pas une iframe → pas de risque XSS).
  if (u.protocol === 'https:' && /\.m3u8$/i.test(u.pathname)) {
    return { provider: 'hls', id: null };
  }

  return null;
}

const isId = (s) => typeof s === 'string' && /^[\w-]{6,64}$/.test(s);
const isChannel = (s) => typeof s === 'string' && /^[A-Za-z0-9_]{2,40}$/.test(s);

module.exports = { parseStreamUrl };
