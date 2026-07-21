import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Users, Radio, ShieldCheck, ShieldAlert, MessageSquare, FileText, ArrowRight, Star, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getClubProfile } from '@/data/clubProfiles';
import { LiveMatchesStrip } from '@/components/fanclub/LiveMatchesStrip';

const HERO = '/images/fan-club/fan-club-home.webp';
const nf = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
const PAGE = 8;   // cartes visibles avant « Voir plus »

// Classement des ligues (app francophone) : Ligue 1 d'abord, puis les grandes.
const LEAGUE_RANK = { 'Ligue 1': 0, 'Ligue 2': 1, 'Premier League': 2, 'La Liga': 3, 'Serie A': 4, 'Bundesliga': 5, 'Eredivisie': 6, National: 7 };
const leagueRank = (l) => (l in LEAGUE_RANK ? LEAGUE_RANK[l] : 50);

// Enrichit un club de l'API avec sa devise (donnée statique front — seuls
// quelques clubs, ex PSG/OM, en ont une pour l'instant).
function withMotto(club) {
  const p = getClubProfile(club.slug);
  return { ...club, motto: p?.motto || null, mottoColor: p?.mottoColor || null };
}

export function FanClubHub() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');       // requête serveur (debounced)
  const [sort, setSort] = useState('popular');    // popular | members | name
  const [limit, setLimit] = useState(PAGE);

  // Debounce : on n'interroge le serveur qu'après une courte pause de frappe.
  useEffect(() => { const t = setTimeout(() => { setSearch(query.trim()); setLimit(PAGE); }, 300); return () => clearTimeout(t); }, [query]);

  // La recherche (search=) interroge TOUT le catalogue côté serveur ; sinon on
  // charge la vue par défaut (clubs des grandes ligues).
  useEffect(() => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    apiFetch(`/api/v2/clubs/fan-hub${qs}`)
      .then((j) => setData(j.data || { clubs: [], primary: null }))
      .catch(() => setData({ clubs: [], primary: null }));
  }, [search]);

  // Dédoublonnage par slug, puis tri : favoris → ligue (Ligue 1 d'abord) → critère.
  const clubs = useMemo(() => {
    if (!data) return [];
    const seen = new Set();
    const list = data.clubs.filter((c) => c.slug && !seen.has(c.slug) && seen.add(c.slug)).map(withMotto);
    const by = {
      popular: (a, b) => b.supportersCount - a.supportersCount,
      members: (a, b) => b.membersCount - a.membersCount,
      name: (a, b) => a.name.localeCompare(b.name),
    }[sort];
    return list.sort((a, b) =>
      (b.isFavorite - a.isFavorite)
      || (sort === 'name' ? 0 : leagueRank(a.league) - leagueRank(b.league))
      || by(a, b)
      || a.name.localeCompare(b.name));
  }, [data, sort]);

  const visible = clubs.slice(0, limit);
  const primary = data?.primary ? withMotto(data.primary) : null;

  return (
    <section className="py-10 md:py-14">
      <Container>
        {/* ── Hero ─────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10">
          {/* Cadrage RESPONSIVE du hero :
              • Mobile/tablette : `cover` centré → toute la hauteur de la photo
                (écharpe comprise), fan au centre. Robuste sur écran étroit.
              • Desktop (lg) : cadrage validé par la cliente — fond zoomé positionné
                pour placer le supporter à l'écharpe à DROITE, titre à gauche.
              👉 RÉGLAGE DESKTOP : les valeurs lg:[background-size] / lg:[background-position]
                 ci-dessous (baisser le 1er % de position = fan plus à droite). */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-center
                       lg:[background-size:95%_auto] lg:[background-position:320%_58%]"
            style={{ backgroundImage: `url(${HERO})` }} />
          {/* Voile sombre surtout à GAUCHE (lisibilité du titre) et quasi nul à
              DROITE pour laisser lire l'écharpe « PASSION • RESPECT • FIERTÉ ». */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
          {/* Mobile : le titre occupe toute la largeur → voile uniforme léger pour
              garantir le contraste. Retiré en desktop (le dégradé gauche suffit). */}
          <div className="absolute inset-0 bg-ink-950/35 lg:hidden" />
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">
              <Radio size={12} /> Fan Club
            </span>
            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none text-bone-50 sm:text-6xl">Rejoins ta communauté</h1>
            <p className="mt-4 max-w-lg text-sm text-bone-300 sm:text-base">
              Échange, partage, vibrez ensemble autour de votre passion. Respect, passion et fair-play avant tout.
            </p>
          </div>
        </header>

        {/* ── Matchs en direct (API-Football, clubs inscrits ou non) ─── */}
        <div className="mt-8">
          <LiveMatchesStrip />
        </div>

        {/* ── Accès rapide au salon favori ─────────────────── */}
        {primary && (
          <Link to={`/clubs/${primary.slug}/fan-club`}
            className="group mt-4 flex items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4 transition hover:border-emerald-400/50">
            <ClubLogo club={primary} size={48} />
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-emerald-400"><Star size={11} className="fill-emerald-400" /> Mon salon favori</p>
              <p className="truncate font-display text-lg font-black text-bone-50">{primary.name}</p>
              <p className="text-[11px] text-bone-400">{nf(primary.supportersCount)} supporters · {nf(primary.membersCount)} membres</p>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink-900 transition group-hover:bg-emerald-300 sm:inline-flex">
              Entrer dans mon salon <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {/* ── Recherche + tri ──────────────────────────────── */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bone-500" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
              placeholder="Rechercher un club…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-bone-100 outline-none focus:border-emerald-400/60" />
          </div>
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-4 pr-10 text-sm text-bone-200 outline-none focus:border-emerald-400/60">
              <option value="popular">Trier : Populaires</option>
              <option value="members">Trier : Plus actifs</option>
              <option value="name">Trier : A → Z</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bone-500" />
          </div>
        </div>

        {/* ── Grille des salons ────────────────────────────── */}
        {!data ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />)}
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-10 text-center text-sm text-bone-400">Aucun salon ne correspond à « {query} ».</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((c) => <ClubCard key={c.slug} club={c} />)}
          </div>
        )}

        {/* ── Voir plus ────────────────────────────────────── */}
        {data && limit < clubs.length && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setLimit((l) => l + PAGE * 2)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-bone-300 transition hover:border-white/20 hover:text-bone-100">
              Voir plus de clubs <ChevronDown size={14} />
            </button>
          </div>
        )}

        {/* ── Bandeau valeurs / modération ─────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon={ShieldCheck} color="text-emerald-400" title="Respect avant tout" text="Un espace d'échange sain et bienveillant pour tous." />
          <InfoTile icon={ShieldAlert} color="text-gold-400" title="Modération active" text="Nos modérateurs veillent sur la communauté 24/7." />
          <InfoTile icon={MessageSquare} color="text-sky-300" title="Signale un contenu" text="Aide-nous à garder le salon propre et agréable." />
          <InfoTile icon={FileText} color="text-violet-300" title="Charte du Fan Club" text="Consulte les règles du salon avant de participer." />
        </div>
      </Container>
    </section>
  );
}

function ClubLogo({ club, size = 56 }) {
  return (
    <div className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-white/10"
      style={{ height: size, width: size, boxShadow: club.primaryColor ? `0 0 0 2px ${club.primaryColor}40` : undefined }}>
      {club.logo
        ? <img src={club.logo} alt={club.name} className="h-full w-full object-contain p-1.5" />
        : <span className="font-display text-sm font-black text-bone-300">{(club.name || '?').slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}

function ClubCard({ club }) {
  const [fav, setFav] = useState(!!club.isFavorite);

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-ink-900/60 p-5 transition hover:-translate-y-0.5 ${fav ? 'border-emerald-400/50' : 'border-white/10 hover:border-white/20'}`}>
      {/* halo couleur du club */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: club.primaryColor || '#22c55e' }} />

      <div className="relative flex items-start justify-between">
        <ClubLogo club={club} />
        <div className="flex flex-col items-end gap-1.5">
          {/* ⭐ Ajouter/retirer ce club des favoris directement depuis l'annuaire */}
          <FavStar tenantId={club.id} fav={fav} onChange={setFav} />
          {club.isOfficial && <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">Salon officiel</span>}
          {/* Badge LIVE prévu — masqué tant qu'aucun vrai match n'est en cours */}
          {club.isLive && <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live</span>}
        </div>
      </div>

      <h3 className="relative mt-4 font-display text-lg font-black leading-tight text-bone-50">{club.name}</h3>
      {/* Ligne devise toujours réservée (min-h) → cartes de hauteur homogène. */}
      <p className="relative mt-0.5 min-h-[1.1rem] text-xs font-bold" style={{ color: club.mottoColor || '#9ca3af' }}>{club.motto || ' '}</p>

      <div className="relative mt-4 mb-4 grid grid-cols-2 gap-2">
        <Metric value={club.supportersCount} label="Supporters" />
        <Metric value={club.membersCount} label="Membres" />
      </div>

      {/* mt-auto : le bouton est poussé en bas → tous alignés d'une carte à l'autre
          (même si un nom de club passe sur 2 lignes). */}
      <Link to={`/clubs/${club.slug}/fan-club`}
        className="relative mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-[11px] font-black uppercase tracking-wider text-bone-200 transition group-hover:border-emerald-400/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-300">
        Entrer dans le salon <ArrowRight size={13} />
      </Link>
    </div>
  );
}

// Étoile favori compacte pour les cartes de l'annuaire. Part de l'état déjà
// connu (club.isFavorite) → un seul POST au clic, pas de GET par carte.
function FavStar({ tenantId, fav, onChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e.preventDefault(); e.stopPropagation();   // ne pas déclencher le lien de la carte
    if (!user) { navigate('/login'); return; }
    if (busy || !tenantId) return;
    setBusy(true);
    const next = !fav;
    onChange(next);   // optimiste
    try { const j = await apiFetch(`/api/v2/me/favorites/${tenantId}`, { method: 'POST' }); onChange(!!j.data?.favorite); }
    catch { onChange(!next); }
    setBusy(false);
  }

  if (!tenantId) return null;
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      title={fav ? 'Retirer de mes clubs favoris' : 'Ajouter à mes clubs favoris'}
      className={`grid h-8 w-8 place-items-center rounded-full border transition ${
        fav
          ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-400'
          : 'border-white/15 bg-ink-900/60 text-bone-300 hover:border-emerald-400/40 hover:text-emerald-400'
      }`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Star size={14} className={fav ? 'fill-emerald-400' : ''} />}
    </button>
  );
}

function Metric({ value, label }) {
  return (
    <div>
      <p className="font-display text-lg font-black tabular-nums text-bone-50 leading-none">{nf(value)}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-widest text-bone-500 font-bold">{label}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, color, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className={color} />
        <p className="text-sm font-black text-bone-100">{title}</p>
      </div>
      <p className="mt-1.5 text-xs text-bone-400">{text}</p>
    </div>
  );
}
