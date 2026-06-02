import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, User, Calendar, Award } from 'lucide-react';

// Convertit un drapeau emoji (Regional Indicator Symbol pairs) en code ISO 2-letter.
// Ex: '🇿🇦' → 'ZA', '🇩🇿' → 'DZ'. Sur Windows, le navigateur affiche
// déjà les emoji en texte ASCII (manque la font flag) — donc on a besoin
// de ce code "propre" pour le badge gauche.
function flagToCountryCode(flag) {
  if (!flag) return '';
  const chars = [...flag];
  if (chars.length !== 2) return '';
  try {
    return chars
      .map((c) => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 0x41))
      .join('');
  } catch {
    return '';
  }
}

// Card pour un membre national d'une fédération (ex: Algérie dans CAF).
// Layout :
//   • Badge gauche : ISO 2-letter (ZA, DZ, MA…) avec couleur du drapeau
//   • Nom du pays : full width, peut wrap sur 2 lignes
//   • Code 3-letter en mono (RSA, ALG, MAR…)
//   • Badge région : abbrev 2-letter dans le coin top-right avec tooltip
//   • Métadonnées Président / Fondation / FIFA
//   • CTA "Voir le détail" en bas
export function FederationMemberCard({ member, index = 0 }) {
  const primaryColor = member.colors?.[0] || '#10b981';
  const isoCode = flagToCountryCode(member.flag) || member.code?.slice(0, 2).toUpperCase() || '??';

  return (
    <motion.a
      href={`#${member.code}`}
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
            isoCode={isoCode}
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
    </motion.a>
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
const regionMeta = {
  'Afrique du Nord':     { abbr: 'AN', textColor: 'text-rose-300',    bg: 'bg-rose-500/15',    border: 'border-rose-500/30' },
  'Afrique de l\'Ouest': { abbr: 'AO', textColor: 'text-gold-400',    bg: 'bg-gold-500/15',    border: 'border-gold-500/30' },
  'Afrique Centrale':    { abbr: 'AC', textColor: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  'Afrique de l\'Est':   { abbr: 'AE', textColor: 'text-cyan-400',    bg: 'bg-cyan-500/15',    border: 'border-cyan-500/30' },
  'Afrique Australe':    { abbr: 'AA', textColor: 'text-pink-400',    bg: 'bg-pink-400/15',    border: 'border-pink-400/30' }
};

function RegionPillCorner({ region }) {
  const m = regionMeta[region];
  if (!m) return null;
  return (
    <span
      title={region}
      className={`absolute top-3 right-3 z-10 inline-flex items-center justify-center min-w-[2.25rem] h-7 px-2 rounded-full border ${m.bg} ${m.border} ${m.textColor} text-[10px] font-black uppercase tracking-[0.14em] cursor-help backdrop-blur-sm`}
    >
      {m.abbr}
    </span>
  );
}

// ============================================================
// FlagBadge — drapeau PNG du pays via FlagCDN (gratuit, sans clé).
// URL : https://flagcdn.com/w80/{iso2_lowercase}.png
// Fallback : code ISO 2-letter en texte si l'image ne charge pas.
// ============================================================
function FlagBadge({ isoCode, primaryColor, countryName }) {
  const [imageError, setImageError] = useState(false);
  const lower = isoCode?.toLowerCase();
  const showImage = isoCode && !imageError;

  return (
    <span
      className="shrink-0 relative h-11 w-11 rounded-xl overflow-hidden bg-white/5 border-2 grid place-items-center"
      style={{ borderColor: `${primaryColor}55` }}
      title={countryName ? `${countryName}${isoCode ? ` (${isoCode})` : ''}` : isoCode || ''}
    >
      {showImage ? (
        <img
          src={`https://flagcdn.com/w80/${lower}.png`}
          srcSet={`https://flagcdn.com/w160/${lower}.png 2x`}
          alt={`Drapeau ${countryName || isoCode}`}
          width={44}
          height={44}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-display font-black text-sm tracking-tight"
          style={{ color: primaryColor }}
        >
          {isoCode || '??'}
        </span>
      )}
    </span>
  );
}
