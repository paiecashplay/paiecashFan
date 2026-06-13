// ============================================================
// FederationClubsGrid
// Grille des clubs membres d'une fédération nationale (style
// reprenant la marketplace : image stade en background plein
// écran, chips CLUB + ville, logo, nom, devise, footer FAN
// TOKENS | PRODUCTS | YEAR). Hover : scale + glow doré +
// soulignement cyan + zoom du background.
//
// Props :
//  - clubs[]         : { slug, name, code, city, stadium,
//                       founded, logo, primaryColor, countryFlag }
//  - federationColor : couleur primaire de la fédération (header)
//  - leagueName      : titre de la section (ex: 'Équipes
//                      Masculines - Ligi Kuu Bara')
//  - cardBackground  : URL image de fond pour chaque card
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FederationClubsGrid({
  clubs,
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

        {/* Grille : max 3 colonnes pour des cards bien larges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {clubs.map((club, i) => (
            <FederationClubCard
              key={club.slug}
              club={club}
              index={i}
              cardBackground={cardBackground}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── CARD ─────────────────────────────────────────────────────
// Reprend exactement le style "TANZANIA FEDERATION" de la marketplace :
//  ┌────────────────────────────────────────┐
//  │ [CLUB] [🇹🇿 DAR ES SALAAM]              │ ← chips top
//  │                                        │
//  │ 🛡️                                     │ ← logo
//  │                                        │
//  │                                        │ ← stade en background visible
//  │                                        │
//  │ CLUB NAME                              │ ← nom
//  │ Stadium Name                           │ ← stade en or
//  │ ─────────────────────────────          │
//  │ FAN TOKENS | PRODUCTS | 1936 EST.      │ ← footer stats
//  └────────────────────────────────────────┘
// Hover : scale 1.03 + ring jaune + soulignement cyan en bas.
function FederationClubCard({ club, index, cardBackground }) {
  const [hovered, setHovered] = useState(false);

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
          ? '0 24px 60px -10px rgba(252,209,22,0.45), 0 0 0 1px rgba(252,209,22,0.35) inset'
          : '0 10px 28px -8px rgba(0,0,0,0.6)'
      }}
    >
      <Link
        to={`/clubs/${club.slug}`}
        className="block relative h-[360px] md:h-[400px]"
      >
        {/* Background : photo du stade — pleinement visible */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage: cardBackground ? `url('${cardBackground}')` : undefined,
            background: !cardBackground
              ? `linear-gradient(135deg, ${club.primaryColor}40, ${club.primaryColor}20)`
              : undefined,
            transform: hovered ? 'scale(1.08)' : 'scale(1.02)'
          }}
        />

        {/* Overlay dégradé : sombre uniquement en haut (chips) et en bas
            (texte). Le centre reste lumineux pour laisser voir le stade. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(4,8,13,0.65) 0%,
              rgba(4,8,13,0.15) 28%,
              rgba(4,8,13,0.10) 50%,
              rgba(4,8,13,0.55) 80%,
              rgba(4,8,13,0.92) 100%)`
          }}
        />

        {/* Halo coloré primaire du club au hover — accentue l'identité */}
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${club.primaryColor}40, transparent 70%)`,
            opacity: hovered ? 1 : 0
          }}
          aria-hidden
        />

        {/* Contenu */}
        <div className="relative h-full flex flex-col p-5 md:p-6">
          {/* Chips top — style capture (NATIONAL TEAM + TZ TANZANIA) */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip label="CLUB" variant="dark" />
            <Chip
              label={`${club.countryFlag || '🇹🇿'} ${club.city || ''}`.trim()}
              variant="ghost"
            />
          </div>

          {/* Logo bien en évidence — comme la capture */}
          <div className="mt-5">
            {club.logo ? (
              <div
                className="h-16 w-16 md:h-20 md:w-20 grid place-items-center rounded-xl backdrop-blur-md"
                style={{
                  background: 'rgba(4,8,13,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <img
                  src={club.logo}
                  alt={club.name}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div
                className="h-16 w-16 md:h-20 md:w-20 rounded-xl grid place-items-center font-display font-black text-lg backdrop-blur-md"
                style={{
                  background: `${club.primaryColor}40`,
                  border: `2px solid ${club.primaryColor}88`,
                  color: '#fff'
                }}
              >
                {(club.code || club.name).slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>

          {/* Spacer pour pousser le contenu en bas */}
          <div className="flex-1" />

          {/* Nom + stade */}
          <h3
            className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-bone-50 leading-none"
            style={{ textShadow: '0 4px 18px rgba(0,0,0,0.85)' }}
          >
            {club.name}
          </h3>
          {club.stadium && (
            <div
              className="mt-2 text-[11px] uppercase tracking-[0.22em] font-bold"
              style={{
                color: '#FCD116',
                textShadow: '0 2px 12px rgba(0,0,0,0.7)'
              }}
            >
              {club.stadium}
            </div>
          )}

          {/* Footer stats : FAN TOKENS | PRODUCTS | YEAR EST. */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-3 md:gap-4">
            <StatCol label="Fan Tokens" />
            <Sep />
            <StatCol label="Products" />
            <Sep />
            <StatCol
              label="Est."
              value={club.founded}
              valueClass="text-bone-50 font-display text-lg md:text-xl font-black"
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
  const base = 'inline-flex items-center px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.22em] font-bold whitespace-nowrap';
  if (variant === 'dark') {
    return <span className={`${base} bg-ink-900/85 text-bone-50 border border-white/15 backdrop-blur-sm`}>{label}</span>;
  }
  return <span className={`${base} bg-white/10 text-bone-100 border border-white/15 backdrop-blur-sm`}>{label}</span>;
}

function StatCol({ label, value, valueClass }) {
  return (
    <div className="flex flex-col min-w-0 flex-1">
      <div className={valueClass || 'text-bone-300 font-mono text-[11px] font-bold tabular-nums'}>
        {value ?? '—'}
      </div>
      <div className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-bone-400 font-bold truncate">
        {label}
      </div>
    </div>
  );
}

function Sep() {
  return <div className="w-px h-8 bg-white/15 shrink-0" />;
}
