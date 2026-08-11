// BO du club — refonte "Espace Club" premium : navigation latérale groupée,
// topbar sticky, bandeau KPI, layout 2 colonnes + rail droit, barre
// d'enregistrement sticky. Réservé au club_admin (verrouillé sur SON club).
// Structure inspirée de la maquette, mappée sur les tokens PaieCashFan.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Info, Users, Trophy, ShoppingBag, Ticket, Gift, PackageCheck, ShieldAlert,
  Radio, Tv, Upload, Loader2, Check, X, ExternalLink, Search, Bell, ChevronDown,
  Menu, CreditCard,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { PlayersTab, TrophiesTab, ProductsTab, TicketingTab } from '@/pages/admin/AdminClubEdit';
import { TombolaManager } from '@/components/tombola/TombolaManager';
import { PrizeFulfillmentPanel } from '@/components/prizes/PrizeFulfillmentPanel';
import { StreamControl } from '@/components/fanclub/StreamControl';
import { ModerationQueue } from '@/components/moderation/ModerationQueue';
import ShopLiveTab from '@/components/shop-live/ShopLiveTab';
import { cn } from '@/lib/cn';

// Navigation groupée (mappée sur nos onglets réels).
const NAV = [
  { group: 'Le club', items: [
    { id: 'info',      label: 'Identité',   icon: Info },
    { id: 'players',   label: 'Effectif',   icon: Users },
    { id: 'trophies',  label: 'Palmarès',   icon: Trophy },
  ]},
  { group: 'Monétisation', items: [
    { id: 'ticketing', label: 'Billetterie',   icon: Ticket },
    { id: 'products',  label: 'Boutique',      icon: ShoppingBag },
    { id: 'shop-live', label: 'Live Boutique', icon: Tv },
    { id: 'tombola',   label: 'Tombola',       icon: Gift },
    { id: 'prizes',    label: 'Gains',         icon: PackageCheck },
  ]},
  { group: 'Engagement', items: [
    { id: 'stream',     label: 'Live & diffusion', icon: Radio },
    { id: 'moderation', label: 'Modération',       icon: ShieldAlert },
  ]},
];
const TAB_META = Object.fromEntries(NAV.flatMap((g) => g.items).map((i) => [i.id, i]));

export function MonClubBO() {
  const { profile, loading: authLoading } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState(null);
  const [drawer, setDrawer] = useState(false); // sidebar mobile
  const [kpis, setKpis] = useState(null);

  const clubId = profile?.club_id;
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    apiFetch(`/api/v2/admin/clubs-crud/clubs/${clubId}`)
      .then((j) => setClub(j.data?.club || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  useEffect(() => {
    if (!clubId) return;
    apiFetch(`/api/v2/admin/clubs-crud/clubs/${clubId}/kpis`)
      .then((j) => setKpis(j.data || null))
      .catch(() => {});
  }, [clubId]);

  if (authLoading) return null;
  if (profile?.role !== 'club_admin' || !clubId) return <Navigate to="/mon-club" replace />;

  const isInfo = tab === 'info';

  return (
    <div className="min-h-screen bg-ink-950 text-bone-100">
      <div className="flex">
        {/* ─── Sidebar (fixe ≥ lg, tiroir < lg) ─── */}
        <SidebarNav
          club={club}
          tab={tab}
          onSelect={(id) => { setTab(id); setDrawer(false); }}
          drawer={drawer}
          onCloseDrawer={() => setDrawer(false)}
        />

        {/* ─── Zone principale ─── */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-[268px]">
          <TopBar
            club={club}
            title={TAB_META[tab]?.label || 'Espace Club'}
            onOpenDrawer={() => setDrawer(true)}
            onGoLive={() => setTab('stream')}
          />

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-400" size={28} /></div>
            ) : isInfo ? (
              <div className="space-y-6">
                <KpiBand data={kpis} />
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_348px]">
                  <div className="min-w-0">
                    <IdentiteTab club={club} onSaved={setClub} showToast={showToast} />
                  </div>
                  <RightRail club={club} />
                </div>
              </div>
            ) : (
              <TabContent tab={tab} club={club} clubId={clubId} showToast={showToast} />
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className={cn('fixed bottom-24 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-xl sm:left-auto sm:right-6',
              toast.ok ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : 'border-red-500/30 bg-red-500/15 text-red-300')}>
            {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ Sidebar ═══════════════════════════════════════════════════════════
function SidebarNav({ club, tab, onSelect, drawer, onCloseDrawer }) {
  return (
    <>
      {/* Overlay mobile */}
      {drawer && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCloseDrawer} />}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-white/8 bg-ink-900 transition-transform lg:translate-x-0',
        drawer ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo (retour au site) */}
        <Link to="/" className="flex items-center gap-2.5 px-5 py-4 transition-opacity hover:opacity-80" title="Retour au site">
          <img src="/paiecashfan-logo.webp" alt="PaieCashFan" className="h-8 w-8 shrink-0 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-sm font-black text-bone-50">PaieCash<span className="text-emerald-400">Fan</span></p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bone-500">Espace Club</p>
          </div>
        </Link>

        <ClubSwitcher club={club} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {NAV.map((g) => (
            <div key={g.group} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-bone-600">{g.group}</p>
              {g.items.map((it) => <NavItem key={it.id} item={it} active={tab === it.id} onClick={() => onSelect(it.id)} />)}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick}
      className={cn(
        'relative flex min-h-[38px] w-full items-center gap-3 rounded-[10px] px-3 text-sm font-semibold transition-colors',
        active
          ? 'bg-white/[0.06] text-bone-50 shadow-[inset_2px_0_0_theme(colors.emerald.400)]'
          : 'text-bone-400 hover:bg-white/[0.03] hover:text-bone-200',
      )}>
      <Icon size={16} className={active ? 'text-emerald-400' : 'text-bone-500'} />
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}

function ClubSwitcher({ club }) {
  return (
    <div className="mx-3 mb-1 flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2">
      {club?.logo_url
        ? <img src={club.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-white/10 bg-white/5 object-contain" />
        : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-[11px] font-black text-bone-400">{(club?.name || 'CL').slice(0, 2).toUpperCase()}</span>}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-bold text-bone-50">{club?.name || 'Mon club'}</p>
        <p className="truncate text-[11px] text-bone-500">
          {club?.league_name ? `${club.league_name} · ` : ''}
          <span className={club?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
            {club?.status === 'active' ? 'Actif' : 'Brouillon'}
          </span>
        </p>
      </div>
      <ChevronDown size={15} className="shrink-0 text-bone-600" />
    </div>
  );
}

// ═══ Topbar ════════════════════════════════════════════════════════════
function TopBar({ club, title, onOpenDrawer, onGoLive }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/8 bg-ink-950/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={onOpenDrawer} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-bone-300 lg:hidden">
        <Menu size={18} />
      </button>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-bone-500">Espace Club <span className="text-bone-600">/</span> {title}</p>
        <h1 className="truncate font-display text-lg font-black text-bone-50">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-bone-500 md:flex">
          <Search size={14} /> Rechercher… <kbd className="ml-2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-bone-300 hover:text-bone-50"><Bell size={16} /></button>
        {club?.slug && (
          <a href={`/clubs/${club.slug}`} target="_blank" rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-bone-200 hover:text-emerald-400 sm:flex">
            <ExternalLink size={13} /> Voir ma page publique
          </a>
        )}
        <button onClick={onGoLive}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-ink-900 transition hover:bg-emerald-300">
          <Radio size={14} /> <span className="hidden sm:inline">Passer en direct</span>
        </button>
      </div>
    </header>
  );
}

// ═══ KPI ═══════════════════════════════════════════════════════════════
// Bandeau KPI réel (fetch /clubs/:id/kpis). Variation vs les 30 j précédents.
const fmtInt = (v) => Number(v || 0).toLocaleString('fr-FR');
function KpiBand({ data }) {
  const cards = [
    { label: 'Fans abonnés',    k: data?.fansSubscribed, sub: 'Total supporters', fmt: fmtInt },
    { label: 'Billets vendus',  k: data?.ticketsSold,    sub: 'Commandes payées', fmt: fmtInt },
    { label: 'Ventes boutique', k: data?.boutiqueSales,  sub: 'Commandes payées', fmt: fmtInt },
    { label: 'Revenus nets',    k: data?.netRevenue,     sub: 'PCC encaissés',    fmt: (v) => `${fmtInt(v)} PCC` },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bone-500">{c.label}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-2xl font-black tabular-nums text-bone-50 sm:text-3xl">
              {c.k ? c.fmt(c.k.value) : '—'}
            </span>
            {c.k?.delta != null && (
              <span className={cn('mb-1 text-xs font-bold', c.k.delta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {c.k.delta >= 0 ? '+' : ''}{c.k.delta}%
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-bone-600">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ═══ Rail droit ════════════════════════════════════════════════════════
function RightRail({ club }) {
  const [activity, setActivity] = useState(null);
  useEffect(() => {
    if (!club?.id) return;
    apiFetch(`/api/v2/admin/clubs-crud/clubs/${club.id}/activity`)
      .then((j) => setActivity(j.data || null))
      .catch(() => {});
  }, [club?.id]);

  const checklist = useMemo(() => ([
    { label: 'Logo et couleurs', done: !!(club?.logo_url && club?.primary_color) },
    { label: 'Effectif', done: false },
    { label: 'Photo du stade', done: !!club?.stadium_image_url },
    { label: 'Devise & infos', done: !!(club?.motto && club?.founded_year) },
  ]), [club]);
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
      {/* Aperçu page fan */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bone-400">Aperçu page fan</p>
          {club?.slug && <a href={`/clubs/${club.slug}`} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">Ouvrir ↗</a>}
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-950">
          <div className="h-20 bg-gradient-to-br from-white/5 to-transparent" style={club?.stadium_image_url ? { backgroundImage: `url(${club.stadium_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
          <div className="p-3">
            <div className="flex items-center gap-2">
              {club?.logo_url && <img src={club.logo_url} alt="" className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 object-contain" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-bone-50">{club?.name || 'Mon club'}</p>
                <p className="truncate text-[11px] text-bone-500">{[club?.city, club?.stadium, club?.founded_year].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profil complété */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bone-400">Profil complété</p>
          <span className="text-sm font-black text-emerald-400">{pct}%</span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
        </div>
        <ul className="space-y-1.5">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-xs">
              <span className={cn('grid h-4 w-4 place-items-center rounded-full', c.done ? 'bg-emerald-400 text-ink-900' : 'border border-white/15')}>
                {c.done && <Check size={11} />}
              </span>
              <span className={c.done ? 'text-bone-300' : 'text-bone-500'}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Activité récente */}
      <RecentActivity data={activity} />
    </div>
  );
}

function RecentActivity({ data }) {
  const items = data?.activity || [];
  const pending = data?.pendingReports || 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-400">Activité récente</p>
      {pending > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs font-semibold text-amber-300">
          <ShieldAlert size={14} /> {pending} signalement{pending > 1 ? 's' : ''} en attente de modération
        </div>
      )}
      {items.length === 0 && pending === 0 ? (
        <p className="text-xs text-bone-600">Aucune activité récente pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', it.tone === 'emerald' ? 'bg-emerald-400' : 'bg-bone-600')} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-bone-200">{it.label}</p>
                <p className="text-[11px] text-bone-600">
                  {[it.sub, timeAgo(it.at)].filter(Boolean).join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60); if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24); if (d < 7) return `il y a ${d} j`;
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch { return ''; }
}

// ═══ Onglet Identité (formulaire redessiné + save bar sticky) ══════════
function IdentiteTab({ club, onSaved, showToast }) {
  const { uploadImage, uploading } = useImageUpload();
  const logoRef = useRef();
  const stadeRef = useRef();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(() => initForm(club));

  useEffect(() => { setForm(initForm(club)); setDirty(false); }, [club]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setDirty(true); };
  const setVal = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  async function upload(file, folder, key) {
    if (!file) return;
    const url = await uploadImage(file, folder);
    if (url) setVal(key, url);
  }

  async function save() {
    setSaving(true);
    try {
      const j = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${club.id}`, { method: 'PUT', body: JSON.stringify(form) });
      if (!j.success) throw new Error(j.error);
      onSaved(j.data.club);
      setDirty(false);
      showToast('Infos publiées');
    } catch (e) { showToast('Erreur : ' + e.message, false); }
    setSaving(false);
  }

  return (
    <>
      <div className="space-y-6 pb-24">
        <SectionCard title="Identité du club" subtitle="Ces informations apparaissent sur votre page publique et vos billets.">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Field label="Nom du club" value={form.name} onChange={set('name')} />
            <Field label="Ville" value={form.city} onChange={set('city')} />
            <Field label="Pays" value={form.country} onChange={set('country')} />
            <Field label="Stade" value={form.stadium} onChange={set('stadium')} />
            <Field label="Année de fondation" type="number" value={form.founded_year} onChange={set('founded_year')} placeholder="Ex : 1904" />
            <Field label="Entraîneur" value={form.coach} onChange={set('coach')} placeholder="Ajouter un nom" />
            <Field label="Président" value={form.president} onChange={set('president')} placeholder="Ajouter un nom" />
            <Field label="Devise" value={form.motto} onChange={set('motto')} placeholder="Ex : Toujours plus haut" />
          </div>
        </SectionCard>

        <SectionCard title="Identité visuelle" subtitle="Logo, couleurs et visuel du stade utilisés dans toute l'expérience fan.">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <ColorField label="Couleur principale" value={form.primary_color} onChange={(v) => setVal('primary_color', v)} />
            <ColorField label="Couleur secondaire" value={form.motto_color} onChange={(v) => setVal('motto_color', v)} placeholder="#FFFFFF" />
            <FileDropField label="Logo du club" value={form.logo_url} inputRef={logoRef} onPick={(f) => upload(f, 'logos', 'logo_url')} onUrl={set('logo_url')} uploading={uploading} />
            <FileDropField label="Photo du stade (bannière)" value={form.stadium_image_url} inputRef={stadeRef} onPick={(f) => upload(f, 'stades', 'stadium_image_url')} onUrl={set('stadium_image_url')} uploading={uploading} wide />
          </div>
        </SectionCard>
      </div>

      <StickySaveBar dirty={dirty} saving={saving} onSave={save} onCancel={() => { setForm(initForm(club)); setDirty(false); }} />
    </>
  );
}

function initForm(club) {
  return {
    name: club?.name || '', city: club?.city || '', country: club?.country || '',
    stadium: club?.stadium || '', founded_year: club?.founded_year || '',
    coach: club?.coach || '', president: club?.president || '',
    motto: club?.motto || '', motto_color: club?.motto_color || '',
    primary_color: club?.primary_color || '#10b981',
    logo_url: club?.logo_url || '', stadium_image_url: club?.stadium_image_url || '',
  };
}

// ═══ Contenus des autres onglets (composants existants dans le shell) ══
function TabContent({ tab, club, clubId, showToast }) {
  if (tab === 'stream') {
    return club?.slug
      ? <SectionCard title="Live & diffusion" subtitle="Diffuse le live officiel du club (YouTube/Twitch, ou PaieCashFan Live via OBS)."><StreamControl slug={club.slug} /></SectionCard>
      : <EmptyState text="Salon indisponible." />;
  }
  if (tab === 'players')   return <PlayersTab   tenantId={clubId} showToast={showToast} />;
  if (tab === 'trophies')  return <TrophiesTab  tenantId={clubId} showToast={showToast} />;
  if (tab === 'products')  return <ProductsTab  tenantId={clubId} showToast={showToast} />;
  if (tab === 'ticketing') return <TicketingTab tenantId={clubId} club={club} showToast={showToast} />;
  if (tab === 'tombola')   return <TombolaManager clubId={clubId} title="Tombolas du club" subtitle="Lance une tombola pour tes supporters (tirage auto à la date de fin)." />;
  if (tab === 'prizes')    return <PrizeFulfillmentPanel />;
  if (tab === 'shop-live') return <ShopLiveTab club={club} showToast={showToast} />;
  if (tab === 'moderation') {
    return club?.slug
      ? <ModerationQueue basePath={`/api/v2/clubs/${club.slug}/moderation`} title="Modération du salon" subtitle="Signalements sur le salon de ton club uniquement. Les signalants restent anonymes." showClub={false} />
      : <EmptyState text="Salon indisponible." />;
  }
  return null;
}

// ═══ Primitives UI ═════════════════════════════════════════════════════
function SectionCard({ title, subtitle, meta, children }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-black text-bone-50">{title}</h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-bone-500">{subtitle}</p>}
        </div>
        {meta && <span className="text-[11px] text-bone-600">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

const LABEL = 'block text-[11px] font-bold uppercase tracking-[0.10em] text-bone-500';
const INPUT_BASE = 'h-[46px] w-full rounded-[10px] px-3.5 text-sm text-bone-100 outline-none transition-colors placeholder:text-bone-600 focus:border-emerald-400/60';

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  const empty = !value;
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={cn('mt-1.5', INPUT_BASE, empty ? 'border border-dashed border-white/15 bg-white/[0.02]' : 'border border-white/10 bg-ink-950/50')} />
    </div>
  );
}

function ColorField({ label, value, onChange, placeholder }) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value || '');
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="mt-1.5 flex items-center gap-2.5">
        <input type="color" value={valid ? value : '#10b981'} onChange={(e) => onChange(e.target.value)}
          className="h-[46px] w-[52px] shrink-0 cursor-pointer rounded-[10px] border border-white/10 bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || '#000000'}
          className={cn(INPUT_BASE, 'flex-1 border border-white/10 bg-ink-950/50 font-mono')} />
      </div>
    </div>
  );
}

function FileDropField({ label, value, inputRef, onPick, onUrl, uploading, wide }) {
  return (
    <div className={wide ? 'md:col-span-1' : ''}>
      <label className={LABEL}>{label}</label>
      <div className={cn('mt-1.5 flex items-center gap-3 rounded-[10px] border p-2.5', value ? 'border-white/10 bg-ink-950/50' : 'border-dashed border-white/15 bg-white/[0.02]')}>
        {value
          ? <img src={value} alt="" className={cn('shrink-0 rounded-lg border border-white/10 bg-white/5 object-contain', wide ? 'h-12 w-20 object-cover' : 'h-12 w-12')} />
          : <span className={cn('grid shrink-0 place-items-center rounded-lg bg-white/5 text-bone-600', wide ? 'h-12 w-20' : 'h-12 w-12')}><Upload size={16} /></span>}
        <input value={value} onChange={onUrl} placeholder="https://… ou parcourir" className="min-w-0 flex-1 bg-transparent text-xs text-bone-300 outline-none placeholder:text-bone-600" />
        <input type="file" accept="image/*" ref={inputRef} onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="shrink-0 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-50">
          {uploading ? '…' : value ? 'Remplacer' : 'Parcourir'}
        </button>
      </div>
    </div>
  );
}

function StickySaveBar({ dirty, saving, onSave, onCancel }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-900/95 backdrop-blur lg:pl-[268px]">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <p className="hidden text-sm text-bone-400 sm:block">Modifications non enregistrées · visibles par les fans après publication</p>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={onCancel} disabled={saving} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold text-bone-300 hover:text-bone-50 disabled:opacity-50">Annuler</button>
              <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-black text-ink-900 transition hover:bg-emerald-300 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer et publier
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-bone-500">{text}</div>;
}
