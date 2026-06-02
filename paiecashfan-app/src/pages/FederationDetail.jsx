import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Globe } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FederationMemberCard } from '@/components/FederationMemberCard';
import { cafMembers, cafStats, cafRegions } from '@/data/caf-members';
import { federations } from '@/data/federations';
import { cn } from '@/lib/cn';

// Registry des datasets par fédération.
// Pour l'instant seule la CAF est branchée — les autres viendront au fur
// et à mesure (importer uefa-members.js, conmebol-members.js, etc.).
const datasets = {
  caf: {
    members: cafMembers,
    stats: cafStats,
    regions: cafRegions,
    gradient: 'from-emerald-500 via-lime-400 to-gold-400'
  }
};

export function FederationDetail() {
  const { fedId } = useParams();
  const federation = federations.find((f) => f.id === fedId);
  const dataset = datasets[fedId];

  if (!federation) {
    return <NotFound />;
  }

  // Dataset absent (UEFA, CONMEBOL...) → message "bientôt"
  if (!dataset) {
    return <ComingSoon federation={federation} />;
  }

  return <FederationView federation={federation} dataset={dataset} />;
}

function FederationView({ federation, dataset }) {
  const [region, setRegion] = useState('Toutes');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.members.filter((m) => {
      if (region !== 'Toutes' && m.region !== region) return false;
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
  }, [dataset.members, region, query]);

  return (
    <>
      {/* ── HERO de la fédération avec gradient + halo ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className={cn(
            'absolute inset-0 opacity-25 bg-gradient-to-r',
            dataset.gradient
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/30 to-ink-900" />

        <Container className="relative pt-8 pb-12 md:pt-10 md:pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bone-300 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-3xl ring-1"
                style={{
                  background: `${federation.primaryColor}1A`,
                  borderColor: `${federation.primaryColor}40`,
                  color: federation.accent
                }}
              >
                {federation.flag}
              </span>
              <div className="text-left">
                <h1 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight text-bone-50">
                  {federation.code} — {federation.shortName}
                </h1>
                <div className="mt-1 text-xs md:text-sm text-bone-400 font-semibold uppercase tracking-[0.18em]">
                  {dataset.stats.totalFederations} fédérations membres ·{' '}
                  {Object.keys(dataset.stats.regions).length} régions ·{' '}
                  Fondée en {dataset.stats.founded}
                </div>
              </div>
            </div>

            {/* Stats principales */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <StatCard value={dataset.stats.totalFederations} label="Fédérations" />
              <StatCard value={Object.keys(dataset.stats.regions).length} label="Régions" />
              <StatCard value={dataset.stats.founded} label="Fondation" />
            </div>
          </motion.div>
        </Container>
      </section>

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

          {/* Region pills */}
          <div className="overflow-x-auto mask-fade-x">
            <div className="flex gap-2 justify-center min-w-max px-2">
              <RegionPill
                label="Toutes les régions"
                active={region === 'Toutes'}
                count={dataset.members.length}
                onClick={() => setRegion('Toutes')}
              />
              {dataset.regions.map((r) => (
                <RegionPill
                  key={r}
                  label={r}
                  active={region === r}
                  count={dataset.stats.regions[r]}
                  onClick={() => setRegion(r)}
                />
              ))}
            </div>
          </div>

          {/* Résultat count */}
          <div className="text-center text-[10px] uppercase tracking-[0.2em] text-bone-400 font-semibold">
            {filtered.length} {filtered.length > 1 ? 'fédérations affichées' : 'fédération affichée'}
          </div>
        </div>

        {/* Grille des membres */}
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

function StatCard({ value, label }) {
  return (
    <div className="glass-emerald rounded-2xl px-6 py-4 min-w-[100px] text-center">
      <div className="font-display text-3xl font-black text-emerald-400 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-bone-300 font-semibold">
        {label}
      </div>
    </div>
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
          On a commencé par la CAF en démo — les autres viennent au fur et à mesure.
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
