// ============================================================
// FederationClubsGrid
// Grille des clubs membres d'une fédération nationale (style
// reprenant la marketplace : image stade en background, chips
// CLUB + ville, logo, nom, devise, footer FAN TOKENS | PRODUCTS
// | YEAR). Hover : scale + glow doré + soulignement cyan.
//
// Props :
//  - clubs[]         : liste { slug, name, code, city, stadium,
//                              founded, logo, primaryColor }
//  - federationName  : titre de la fédération (header)
//  - federationColor : couleur primaire pour l'accent header
//  - leagueName      : titre de la section (ex: 'Équipes Masculines
//                      - Ligi Kuu Bara')
//  - cardBackground  : URL image de fond pour chaque card
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FederationClubsGrid({
  clubs,
  federationName,
  federationColor,
  leagueName,
  cardBackground
}) {
  if (!clubs || clubs.length === 0) return null;

  return (
    <section id="clubs" className="py-16 md:py-20 border-t border-white/5 scroll-mt-20">
      <Container>
        {/* Header section style "🌐 Équipes Masculines - Ligi Kuu Bara" */}
        <header className="mb-8 flex items-center gap-3">
          <Trophy size={18} style={{ color: federationColor }} />
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50">
            {leagueName}
          </h2>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(to right, ${federationColor}55, transparent)` }}
          />
          <span
            className="text-[11px] font-mono font-bold tabular-nums px-2 py-0.5 rounded-full"
            style={{
              background: `${federationColor}1F`,
              color: federationColor,
              border: `1px solid ${federationColor}40`
            }}
          >
            {clubs.length}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {clubs.map((club, i) => (
            <FederationClubCard
              key={club.slug}
              club={club}
              index={i}
              cardBackground={cardBackground}
              federationName={federationName}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── CARD ─────────────────────────────────────────────────────
// Reprend exactement le style "TANZANIA FEDERATION" de la marketplace :
//  ┌───────────────────────────────────────┐
//  │ [CLUB] [TZ DAR ES SALAAM]             │ ← chips
//  │  ⚽                                    │ ← logo
//  │  CLUB NAME                            │ ← nom
//  │  motto                                │ ← devise
//  │  FAN TOKENS | PRODUCTS | 1936 EST.    │ ← footer stats
//  └───────────────────────────────────────┘
// Hover : scale 1.02 + ring jaune + soulignement cyan en bas.
function FederationClubCard({ club, index, cardBackground, federationName }) {
  const [hovered, setHovered] = useState(false);
  const codeShort = (club.code || club.name)
    .replace(/\s+/g, '')
    .slice(0, 6)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ scale: hovered ? 1.03 : 1 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl border overflow-hidden transition-shadow duration-300"
      style={{
        borderColor: hovered ? '#FCD11680' : 'rgba(255,255,255,0.08)',
        boxShadow: hovered
          ? `0 20px 60px -10px rgba(252,209,22,0.4), 0 0 0 1px rgba(252,209,22,0.3) inset`
          : '0 8px 24px -8px rgba(0,0,0,0.5)'
      }}
    >
      <Link
        to={`/clubs/${club.slug}`}
        className="block relative aspect-[4/3] sm:aspect-[5/4]"
      >
        {/* Background : photo du stade */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage: cardBackground ? `url('${cardBackground}')` : undefined,
            background: !cardBackground
              ? `linear-gradient(135deg, ${club.primaryColor}40, ${club.primaryColor}20)`
              : undefined,
            transform: hovered ? 'scale(1.08)' : 'scale(1)'
          }}
        />
        {/* Overlay sombre dégradé pour lisibilité du texte */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(4,8,13,0.4) 0%,
              rgba(4,8,13,0.55) 50%,
              rgba(4,8,13,0.85) 100%)`
          }}
        />
        {/* Halo coloré primaire du club au hover */}
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${club.primaryColor}40, transparent 70%)`,
            opacity: hovered ? 1 : 0
          }}
          aria-hidden
        />

        {/* Contenu */}
        <div className="relative h-full flex flex-col p-4 md:p-5">
          {/* Chips top */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip label="CLUB" variant="dark" />
            <Chip
              label={`${club.countryFlag || 'TZ'} ${club.city || ''}`.trim()}
              variant="ghost"
            />
          </div>

          {/* Logo + nom + motto */}
          <div className="mt-3 flex-1 flex flex-col justify-end">
            <div className="mb-2">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="h-14 w-14 md:h-16 md:w-16 rounded-full grid place-items-center font-display font-black text-base"
                  style={{
                    background: `${club.primaryColor}30`,
                    border: `2px solid ${club.primaryColor}80`,
                    color: '#fff',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {codeShort.slice(0, 3)}
                </div>
              )}
            </div>

            <h3
              className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50 leading-none"
              style={{ textShadow: '0 4px 16px rgba(0,0,0,0.8)' }}
            >
              {club.name}
            </h3>
            {club.stadium && (
              <div
                className="mt-1.5 text-[10px] uppercase tracking-[0.22em] font-bold"
                style={{ color: '#FCD116' }}
              >
                {club.stadium}
              </div>
            )}
          </div>

          {/* Footer stats : FAN TOKENS | PRODUCTS | YEAR EST. */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3 md:gap-4">
            <StatCol label="Fan Tokens" />
            <Sep />
            <StatCol label="Products" />
            <Sep />
            <StatCol
              label="Est."
              value={club.founded}
              valueClass="text-bone-50 font-display text-base md:text-lg font-black"
            />
          </div>

          {/* Underline cyan au hover (rappel de la capture 2) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
              opacity: hovered ? 1 : 0
            }}
            aria-hidden
          />
        </div>
      </Link>
    </motion.div>
  );
}

function Chip({ label, variant = 'dark' }) {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.22em] font-bold whitespace-nowrap';
  if (variant === 'dark') {
    return <span className={`${base} bg-ink-900/85 text-bone-50 border border-white/10 backdrop-blur-sm`}>{label}</span>;
  }
  return <span className={`${base} bg-white/10 text-bone-100 border border-white/15 backdrop-blur-sm`}>{label}</span>;
}

function StatCol({ label, value, valueClass }) {
  return (
    <div className="flex flex-col min-w-0">
      <div className={valueClass || 'text-bone-300 font-mono text-[11px] font-bold tabular-nums'}>
        {value ?? '—'}
      </div>
      <div className="mt-0.5 text-[8px] uppercase tracking-[0.22em] text-bone-400 font-bold truncate">
        {label}
      </div>
    </div>
  );
}

function Sep() {
  return <div className="w-px h-7 bg-white/10 shrink-0" />;
}
