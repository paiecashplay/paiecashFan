/* ═══════════════════════════════════════════════════════════════
   CLUB CHAT THEMES - Per-Club Chatbot Styling Tokens
   Each club defines chatbot-specific colors derived from its branding.
   Add new clubs by copying any block and swapping hex values.
   ═══════════════════════════════════════════════════════════════ */

import { CLUB_THEMES } from './clubThemes';

/**
 * Generate a full chatbot token set from a club's branding palette.
 * This ensures every new club only needs a few key colors defined -
 * everything else is derived automatically.
 */
function buildChatTokens({
  primary,          // Main club color (jersey / crest dominant)
  secondary,        // Secondary club color
  accent,           // Highlight / gold / tertiary
  dark,             // Deep background
  glow,             // Glow rgba string
  glowStrong,       // Stronger glow
  textOnBg,         // Readable text on dark bg
  crestUrl,         // Club crest URL
  clubName,         // Club display name
  tagline,          // Club tagline
}) {
  return {
    // ── Surfaces ──
    void: dark,
    pane: mixHex(dark, primary, 0.08),
    card: mixHex(dark, primary, 0.12),
    surface: mixHex(dark, primary, 0.22),
    input: mixHex(dark, primary, 0.06),

    // ── Text ──
    text: textOnBg,
    textMuted: mixHex(textOnBg, primary, 0.45),
    textDim: mixHex(textOnBg, primary, 0.30),

    // ── Brand colors (mapped to chatbot token names) ──
    bronze: primary,
    bronzeDark: darkenHex(primary, 0.2),
    bronzeLight: lightenHex(primary, 0.2),
    gold: accent,
    goldDark: darkenHex(accent, 0.25),
    goldLight: lightenHex(accent, 0.25),
    accent: secondary,

    // ── Functional ──
    error: '#f44336',

    // ── User bubble ──
    userBubbleBg: `linear-gradient(135deg, ${primary}, ${darkenHex(primary, 0.15)})`,
    userBubbleText: textOnBg,

    // ── Scrollbar ──
    scrollThumb: `linear-gradient(180deg, ${primary} 0%, ${darkenHex(primary, 0.2)} 100%)`,
    scrollThumbHover: `linear-gradient(180deg, ${darkenHex(primary, 0.2)} 0%, ${darkenHex(primary, 0.35)} 100%)`,

    // ── Glow ──
    glowColor: glow,
    glowStrong: glowStrong,

    // ── Identity ──
    crestUrl,
    clubName,
    tagline,
  };
}

// ── Hex color utilities (lightweight, no deps) ──────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function mixHex(hex1, hex2, ratio) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio,
  );
}

function darkenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lightenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

// ═══════════════════════════════════════════════════════════════
// PER-CLUB CHAT TOKEN OVERRIDES
// These can override any auto-generated token for fine-tuning.
// ═══════════════════════════════════════════════════════════════

const CLUB_CHAT_OVERRIDES = {
  'real-madrid': {
    // Royal white + gold combo - use gold as primary for chat since white is too bright
    primary: '#D4AF37',
    accent: '#001489',
    textOnBg: '#f0e6ff',
  },
  'manchester-city': {
    primary: '#6CABDD',
    textOnBg: '#e0f0ff',
  },
  'liverpool': {
    primary: '#C8102E',
    accent: '#F6EB61',
    textOnBg: '#ffe6e6',
  },
  'psg': {
    primary: '#004170',
    accent: '#DA291C',
    textOnBg: '#e6f0ff',
  },
  'fc-barcelona': {
    primary: '#A50044',
    accent: '#EDBB00',
    textOnBg: '#ffe6f0',
  },
  'bayern-munich': {
    primary: '#DC052D',
    accent: '#C0C0C0',
    textOnBg: '#ffe0e6',
  },
  'juventus': {
    // Black & white stripes - use gold accent as primary for chat visibility
    primary: '#D4AF37',
    accent: '#FFFFFF',
    textOnBg: '#f0f0f0',
  },
  'chelsea': {
    primary: '#034694',
    accent: '#D4AF37',
    textOnBg: '#d0e0ff',
  },
};

// ═══════════════════════════════════════════════════════════════
// DEFAULT THEME (Frostrek green) - used on /clubs listing page
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_CHAT_THEME = {
  void: '#070c11',
  pane: '#0e1a17',
  card: '#152620',
  surface: '#1f3d32',
  input: '#0e1a17',
  text: '#f0fdf4',
  textMuted: '#6ee7b7',
  textDim: '#059669',
  bronze: '#059669',
  bronzeDark: '#047857',
  bronzeLight: '#34d399',
  gold: '#fcd34d',
  goldDark: '#d97706',
  goldLight: '#fef08a',
  accent: '#34d399',
  error: '#f44336',
  userBubbleBg: 'linear-gradient(135deg, #059669, #047857)',
  userBubbleText: '#f0fdf4',
  scrollThumb: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
  scrollThumbHover: 'linear-gradient(180deg, #047857 0%, #065f46 100%)',
  glowColor: 'rgba(5, 150, 105, 0.4)',
  glowStrong: 'rgba(5, 150, 105, 0.6)',
  crestUrl: null,
  clubName: null,
  tagline: null,
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Get the chatbot theme tokens for a specific club.
 * Falls back to DEFAULT_CHAT_THEME if club not found.
 */
export function getChatThemeForClub(clubId) {
  if (!clubId) return DEFAULT_CHAT_THEME;

  const club = CLUB_THEMES[clubId];
  if (!club) return DEFAULT_CHAT_THEME;

  const overrides = CLUB_CHAT_OVERRIDES[clubId] || {};

  return buildChatTokens({
    primary: overrides.primary || club.primaryColor,
    secondary: overrides.secondary || club.secondaryColor,
    accent: overrides.accent || club.accentColor,
    dark: overrides.dark || club.darkColor,
    glow: overrides.glow || club.glowColor,
    glowStrong: overrides.glowStrong || club.glowColorStrong,
    textOnBg: overrides.textOnBg || club.textOnBg,
    crestUrl: club.crestUrl,
    clubName: club.name,
    tagline: club.tagline,
  });
}
