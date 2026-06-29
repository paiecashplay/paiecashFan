import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, User, Calendar, Award } from 'lucide-react';
import { slugify } from '@/lib/slugify';

const MotionLink = motion(Link);

// Convertit un drapeau emoji (Regional Indicator Symbol pairs) en code ISO 2-letter.
// Ex: '🇿🇦' → 'ZA', '🇩🇿' → 'DZ'. Sur Windows, le navigateur affiche
// déjà les emoji en texte ASCII (manque la font flag) — donc on a besoin
// de ce code "propre" pour le badge gauche.
// Ne supporte PAS les composite tag sequences (Angleterre/Écosse/Pays de Galles
// utilisent ce format : 🏴󠁧󠁢󠁥󠁮󠁧󠁿). Pour ces cas on passe par le map ci-dessous.
function flagToCountryCode(flag) {
  if (!flag) return '';
  const chars = [...flag];
  if (chars.length !== 2) return '';
  try {
    const out = chars
      .map((c) => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 0x41))
      .join('');
    // Sanity check : le résultat doit être 2 lettres A-Z
    return /^[A-Z]{2}$/.test(out) ? out : '';
  } catch {
    return '';
  }
}

// Codes spéciaux FlagCDN pour les nations qui n'ont pas de code ISO 3166-1
// alpha-2 standard mais qui ont une bannière footballistique propre.
// Indexés par le code 3-letter sport présent dans la data.
// Note : pour l'Angleterre on utilise l'Union Jack (gb) au lieu de la croix
// de Saint Georges (gb-eng) — choix produit pour la reconnaissance visuelle.
const SPECIAL_FLAG_CDN_CODES = {
  ENG: 'gb',      // Angleterre — Union Jack (RU entier, choix produit)
  SCO: 'gb-sct',  // Écosse — Saltire (croix de Saint André)
  WAL: 'gb-wls',  // Pays de Galles — dragon rouge
  NIR: 'gb-nir'   // Irlande du Nord — Ulster Banner
};

// Code à utiliser pour FlagCDN (lowercase, format 'za' ou 'gb-eng').
function getFlagCdnCode(member) {
  const special = SPECIAL_FLAG_CDN_CODES[member.code];
  if (special) return special;
  return (flagToCountryCode(member.flag) || '').toLowerCase();
}

// Code à afficher en fallback texte (si l'image FlagCDN ne charge pas).
function getDisplayCode(member) {
  return (
    flagToCountryCode(member.flag) ||
    member.code?.slice(0, 3).toUpperCase() ||
    '??'
  );
}

// Card pour un membre national d'une fédération (ex: Algérie dans CAF).
// Layout :
//   • Badge gauche : ISO 2-letter (ZA, DZ, MA…) avec couleur du drapeau
//   • Nom du pays : full width, peut wrap sur 2 lignes
//   • Code 3-letter en mono (RSA, ALG, MAR…)
//   • Badge région : abbrev 2-letter dans le coin top-right avec tooltip
//   • Métadonnées Président / Fondation / FIFA
//   • CTA "Voir le détail" en bas
// Normalise un nom de pays pour la comparaison (minuscules, sans accents).
function normName(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// Résout la destination de la card : si une fédération existe EN BASE pour ce
// pays (créée via le BO), on pointe vers sa page DB /federations/<slug>. Sinon
// on garde le repli statique /clubs/<slug> (évite les pages blanches).
function resolveMemberTo(member, federations) {
  const fallback = `/clubs/${slugify(member.nameFR || member.name)}`;
  if (!federations?.length) return fallback;

  const iso2 = flagToCountryCode(member.flag);                 // ex: 🇰🇪 → KE
  const name = normName(member.nameFR || member.name);

  const fed =
    (iso2 && federations.find((f) => (f.country_code || '').toUpperCase() === iso2)) ||
    federations.find((f) => normName(f.country) === name);

  return fed?.slug ? `/federations/${fed.slug}` : fallback;
}

export function FederationMemberCard({ member, index = 0, federations = [] }) {
  const primaryColor = member.colors?.[0] || '#10b981';
  const flagCdnCode = getFlagCdnCode(member);
  const displayCode = getDisplayCode(member);
  const to = resolveMemberTo(member, federations);

  return (
    <MotionLink
      to={to}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: (index % 12) * 0.03 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      {/* Glow accent au survol (couleur du drapeau) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${primaryColor}22, transparent 70%)` }}
      />

      {/* Badge région — abrégé, coin top-right, avec tooltip natif */}
      <RegionPillCorner region={member.region} />

      <div className="relative">
        {/* Header : drapeau + nom + code 3-letter */}
        <div className="flex items-start gap-3 mb-4 pr-12">
          <FlagBadge
            flagCdnCode={flagCdnCode}
            displayCode={displayCode}
            primaryColor={primaryColor}
            countryName={member.nameFR || member.name}
          />
          <div className="min-w-0 flex-1">
            <h3
              className="font-display font-bold text-base text-bone-50 leading-tight line-clamp-2"
              title={member.nameFR || member.name}
            >
              {member.nameFR || member.name}
            </h3>
            <div className="mt-1 text-[10px] font-mono text-bone-400 tracking-[0.18em] uppercase">
              {member.code}
            </div>
          </div>
        </div>

        {/* Logo fédération nationale */}
        {member.logo && (
          <div className="flex justify-center mb-4 h-16">
            <img
              src={member.logo}
              alt={member.federation}
              loading="lazy"
              className="h-full w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Métadonnées */}
        <ul className="space-y-1.5 text-xs">
          {member.president && (
            <MetaRow icon={User} label="Président" value={member.president} />
          )}
          {member.founded && (
            <MetaRow icon={Calendar} label="Fondation" value={member.founded} />
          )}
          {member.fifaMember && (
            <MetaRow icon={Award} label="Membre FIFA" value={member.fifaMember} />
          )}
        </ul>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold">
            Voir le détail
          </span>
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            style={{ color: primaryColor }}
          />
        </div>
      </div>
    </MotionLink>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center justify-between gap-2 text-bone-400">
      <span className="inline-flex items-center gap-1.5">
        <Icon size={11} className="opacity-60" />
        <span>{label}</span>
      </span>
      <span className="text-bone-200 font-mono truncate max-w-[60%] text-right" title={String(value)}>
        {value}
      </span>
    </li>
  );
}

// ============================================================
// Région : abbrev + couleur + tooltip
// ============================================================
// Map explicite pour les régions connues (CAF + UEFA + CONCACAF + AFC).
// Si la région n'est pas dans cette table, on fallback sur les 2 premières
// lettres pour l'abbrev + couleur générique emerald (cf. computeRegionStyle).
const regionMeta = {
  // CAF
  'Afrique du Nord':       { abbr: 'AN', cls: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
  'Afrique de l\'Ouest':   { abbr: 'AO', cls: 'text-gold-400 bg-gold-500/15 border-gold-500/30' },
  'Afrique Centrale':      { abbr: 'AC', cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  'Afrique de l\'Est':     { abbr: 'AE', cls: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  'Afrique Australe':      { abbr: 'AA', cls: 'text-pink-400 bg-pink-400/15 border-pink-400/30' },
  // UEFA
  'Europe de l\'Ouest':    { abbr: 'EO', cls: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  'Europe de l\'Est':      { abbr: 'EE', cls: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
  'Europe du Nord':        { abbr: 'EN', cls: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' },
  'Europe du Sud':         { abbr: 'ES', cls: 'text-gold-400 bg-gold-500/15 border-gold-500/30' },
  'Europe Centrale':       { abbr: 'EC', cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  'Balkans':               { abbr: 'BK', cls: 'text-pink-400 bg-pink-400/15 border-pink-400/30' },
  'Caucase':               { abbr: 'CA', cls: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  'Pays Baltes':           { abbr: 'PB', cls: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
  'Asie Centrale':         { abbr: 'AC', cls: 'text-gold-400 bg-gold-500/15 border-gold-500/30' },
  'Moyen-Orient':          { abbr: 'MO', cls: 'text-violet-500 bg-violet-500/15 border-violet-500/30' },
  // CONCACAF
  'CFU':                   { abbr: 'CFU', cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  'NAFU':                  { abbr: 'NAF', cls: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
  'UNCAF':                 { abbr: 'UNC', cls: 'text-gold-400 bg-gold-500/15 border-gold-500/30' },
  // AFC
  'WAFF':                  { abbr: 'WAF', cls: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  'CAFA':                  { abbr: 'CAF', cls: 'text-gold-400 bg-gold-500/15 border-gold-500/30' },
  'SAFF':                  { abbr: 'SAF', cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  'AFF':                   { abbr: 'AFF', cls: 'text-pink-400 bg-pink-400/15 border-pink-400/30' },
  'EAFF':                  { abbr: 'EAF', cls: 'text-rose-300 bg-rose-500/15 border-rose-500/30' }
};

function computeRegionStyle(region) {
  const known = regionMeta[region];
  if (known) return known;
  // Fallback : abbrev = initiales (jusqu'à 3 lettres), couleur emerald générique
  const initials = region
    .split(/[\s']+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 3)
    .join('')
    .toUpperCase();
  return {
    abbr: initials || '?',
    cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
  };
}

function RegionPillCorner({ region }) {
  if (!region) return null;
  const m = computeRegionStyle(region);
  return (
    <span
      title={region}
      className={`absolute top-3 right-3 z-10 inline-flex items-center justify-center min-w-[2.25rem] h-7 px-2 rounded-full border ${m.cls} text-[10px] font-black uppercase tracking-[0.14em] cursor-help backdrop-blur-sm`}
    >
      {m.abbr}
    </span>
  );
}

// ============================================================
// FlagBadge — drapeau PNG du pays via FlagCDN (gratuit, sans clé).
// URL : https://flagcdn.com/w80/{flagCdnCode}.png
// Supporte les codes spéciaux (gb-eng, gb-sct, gb-wls, gb-nir) pour
// les nations britanniques qui n'ont pas de code ISO 3166-1 standard.
// Fallback : displayCode en texte si l'image ne charge pas ou si on
// n'a pas de flagCdnCode valide.
// ============================================================
function FlagBadge({ flagCdnCode, displayCode, primaryColor, countryName }) {
  const [imageError, setImageError] = useState(false);
  const showImage = flagCdnCode && !imageError;

  return (
    <span
      className="shrink-0 relative h-11 w-11 rounded-xl overflow-hidden bg-white/5 border-2 grid place-items-center"
      style={{ borderColor: `${primaryColor}55` }}
      title={countryName ? `${countryName}${displayCode ? ` (${displayCode})` : ''}` : displayCode || ''}
    >
      {showImage ? (
        <img
          src={`https://flagcdn.com/w80/${flagCdnCode}.png`}
          srcSet={`https://flagcdn.com/w160/${flagCdnCode}.png 2x`}
          alt={`Drapeau ${countryName || displayCode}`}
          width={44}
          height={44}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-display font-black text-xs tracking-tight"
          style={{ color: primaryColor }}
        >
          {displayCode || '??'}
        </span>
      )}
    </span>
  );
}
