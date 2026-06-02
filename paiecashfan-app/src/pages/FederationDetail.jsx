import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Globe } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FederationMemberCard } from '@/components/FederationMemberCard';
import { federations } from '@/data/federations';
import { cafMembers, cafStats } from '@/data/caf-members';
import { uefaMembers } from '@/data/uefa-members';
import { conmebolMembers } from '@/data/conmebol-members';
import { concacafMembers } from '@/data/concacaf-members';
import { afcMembers } from '@/data/afc-members';
import { cn } from '@/lib/cn';

// ── Registry des datasets par fédération ───────────────────────────
// Chaque entrée : { members, founded, heroVideo?, heroGradient? }
// - members  : array enrichi (name, code, flag, region, president, ...)
// - founded  : année de fondation de la confédération
// - heroVideo : URL d'une vidéo MP4 jouée en autoplay loop en background
//   du Hero. Si absente : fallback sur heroGradient (gradient de couleurs).
// ──────────────────────────────────────────────────────────────────
const datasets = {
  caf: {
    members: cafMembers,
    founded: cafStats.founded,
    heroVideo: '/videos/heroCaf.mp4',
    heroGradient: 'from-emerald-500 via-lime-400 to-gold-400'
  },
  uefa: {
    members: uefaMembers,
    founded: '1954',
    heroGradient: 'from-blue-500 via-indigo-500 to-violet-500'
  },
  conmebol: {
    members: conmebolMembers,
    founded: '1916',
    heroGradient: 'from-cyan-500 via-emerald-400 to-gold-400'
  },
  concacaf: {
    members: concacafMembers,
    founded: '1961',
    heroGradient: 'from-rose-500 via-orange-400 to-emerald-400'
  },
  afc: {
    members: afcMembers,
    founded: '1954',
    heroGradient: 'from-rose-500 via-amber-400 to-emerald-400'
  }
  // OFC : pas encore de fichier — affichera le placeholder "Bientôt"
};

export function FederationDetail() {
  const { fedId } = useParams();
  const federation = federations.find((f) => f.id === fedId);
  const dataset = datasets[fedId];

  if (!federation) return <NotFound />;
  if (!dataset) return <ComingSoon federation={federation} />;
  return <FederationView federation={federation} dataset={dataset} />;
}

function FederationView({ federation, dataset }) {
  // Extraction auto des régions depuis les data des membres.
  const regions = useMemo(() => {
    const set = new Set();
    dataset.members.forEach((m) => { if (m.region) set.add(m.region); });
    return [...set].sort();
  }, [dataset.members]);

  const hasRegions = regions.length > 0;
  const [region, setRegion] = useState('Toutes');
  const [query, setQuery] = useState('');

  // Compteur de membres par région.
  const countByRegion = useMemo(() => {
    return dataset.members.reduce((acc, m) => {
      if (m.region) acc[m.region] = (acc[m.region] || 0) + 1;
      return acc;
    }, {});
  }, [dataset.members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.members.filter((m) => {
      if (hasRegions && region !== 'Toutes' && m.region !== region) return false;
      if (q) {
        return (
          m.name?.toLowerCase().includes(q) ||
          m.nameFR?.toLowerCase().includes(q) ||
          m.nameEN?.toLowerCase().includes(q) ||
          m.code?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dataset.members, region, query, hasRegions]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <FederationHero
        federation={federation}
        dataset={dataset}
        regions={regions}
      />

      <Container className="pt-10 md:pt-12 pb-24">
        {/* Search + Region tabs */}
        <div className="space-y-4">
          {/* Search */}
          <div className="glass-strong rounded-full flex items-center pl-5 pr-3 h-12 max-w-xl mx-auto">
            <Search size={16} className="text-bone-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un pays…"
              className="flex-1 bg-transparent border-0 outline-none px-3 text-sm text-bone-100 placeholder:text-bone-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-bone-400 hover:text-bone-200 px-2"
              >
                ×
              </button>
            )}
          </div>

          {/* Region pills — seulement si la fédération a des régions */}
          {hasRegions && (
            <div className="overflow-x-auto mask-fade-x">
              <div className="flex gap-2 justify-center min-w-max px-2">
                <RegionPill
                  label="Toutes les régions"
                  active={region === 'Toutes'}
                  count={dataset.members.length}
                  onClick={() => setRegion('Toutes')}
                />
                {regions.map((r) => (
                  <RegionPill
                    key={r}
                    label={r}
                    active={region === r}
                    count={countByRegion[r] || 0}
                    onClick={() => setRegion(r)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-[10px] uppercase tracking-[0.2em] text-bone-400 font-semibold">
            {filtered.length} {filtered.length > 1 ? 'fédérations affichées' : 'fédération affichée'}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-bone-400 text-sm">
            Aucun résultat. Essaie d'élargir ta recherche ou de changer de région.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((m, i) => (
              <FederationMemberCard key={m.code || m.name} member={m} index={i} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

// ── HERO avec vidéo background ou fallback gradient ──────────────────
function FederationHero({ federation, dataset, regions }) {
  const totalFederations = dataset.members.length;
  const hasRegions = regions.length > 0;

  // Subtitle : "X fédérations • N régions • Depuis YYYY" (omettre regions si 0)
  const subtitle = [
    `${totalFederations} fédérations`,
    hasRegions ? `${regions.length} régions` : null,
    `Depuis ${dataset.founded}`
  ].filter(Boolean).join(' • ');

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {/* Background : vidéo si disponible, sinon gradient */}
      {dataset.heroVideo ? (
        <video
          src={dataset.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          aria-hidden
        />
      ) : (
        <div
          className={cn('absolute inset-0 opacity-25 bg-gradient-to-r', dataset.heroGradient)}
        />
      )}

      {/* Overlay sombre pour lisibilité du texte */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/40 to-ink-900" />
      {/* Vignette horizontale supplémentaire pour focaliser le centre */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900/40 via-transparent to-ink-900/40" />

      <Container className="relative pt-8 pb-16 md:pt-10 md:pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bone-200 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-24 text-center"
        >
          <h1
            className="font-display text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-bone-50"
            style={{ textShadow: '0 4px 32px rgba(0,0,0,0.8)' }}
          >
            {federation.name}
          </h1>
          <p
            className="mt-4 md:mt-5 text-base md:text-lg text-bone-200 font-semibold"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
          >
            {subtitle}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

function RegionPill({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs font-semibold transition-colors duration-200',
        active
          ? 'bg-emerald-500 text-ink-900 shadow-glow-emerald'
          : 'bg-white/5 border border-white/10 text-bone-300 hover:text-bone-50 hover:border-white/20'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
          active ? 'bg-ink-900/20' : 'bg-white/5'
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ComingSoon({ federation }) {
  return (
    <section className="relative min-h-[60vh] py-24">
      <Container className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bone-300 hover:text-emerald-400 transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-3xl text-4xl mb-6"
          style={{
            background: `${federation.primaryColor}1A`,
            border: `1px solid ${federation.primaryColor}40`
          }}
        >
          {federation.flag}
        </div>
        <h1 className="font-display text-display-lg font-black uppercase tracking-tight">
          <span style={{ color: federation.primaryColor }}>{federation.code}</span>
        </h1>
        <p className="mt-4 text-xl text-bone-200">{federation.shortName}</p>
        <p className="mt-6 max-w-md mx-auto text-bone-300">
          Les {federation.clubs} sélections nationales de cette fédération arrivent bientôt.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-2 px-6 h-12 rounded-full bg-emerald-500 text-ink-900 font-bold text-sm uppercase tracking-[0.1em] shadow-glow-emerald hover:bg-emerald-400 transition-colors"
        >
          Revenir à l'accueil
        </Link>
      </Container>
    </section>
  );
}

function NotFound() {
  return (
    <section className="min-h-[60vh] py-24 text-center">
      <Container>
        <Globe size={48} className="mx-auto text-bone-400 opacity-40 mb-6" />
        <h1 className="font-display text-display-lg font-bold">Fédération inconnue</h1>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 h-12 rounded-full bg-emerald-500 text-ink-900 font-bold text-sm uppercase tracking-[0.1em]"
        >
          Retour à l'accueil
        </Link>
      </Container>
    </section>
  );
}
