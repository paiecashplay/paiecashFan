import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, Ticket, Heart, History, Gift, Shield, Users, Gamepad2, BarChart3,
  User, Lock, Settings, Scale, Wallet, ChevronRight, Search, Menu, X, LogOut, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import { NotificationBell } from '@/components/NotificationBell';

const NAV_GROUPS = [
  { items: [{ to: '/mon-compte', end: true, label: "Vue d'ensemble", icon: Home }] },
  {
    title: 'Mon espace fan',
    items: [
      { to: '/mon-compte/commandes', label: 'Mes billets & commandes', icon: Ticket },
      { to: '/mon-compte/favoris', label: 'Mes favoris', icon: Heart },
      { to: '/mon-compte/pcc', label: 'Historique PCC', icon: History },
      { to: '/mon-compte/gains', label: 'Mes gains', icon: Gift },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/mon-compte/clubs', label: 'Mes clubs', icon: Shield },
      { to: '/mon-compte/amis', label: 'Mes amis', icon: Users },
      { to: '/mon-compte/activites', label: 'Activités & défis', icon: Gamepad2 },
      { to: '/mon-compte/classements', label: 'Classements', icon: BarChart3 },
    ],
  },
  {
    title: 'Mon compte',
    items: [
      { to: '/mon-compte/profil', label: 'Profil & préférences', icon: User },
      { to: '/mon-compte/moderation', label: 'Ma modération', icon: Scale },
      { to: '/mon-compte/securite', label: 'Sécurité', icon: Lock },
      { to: '/mon-compte/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];

// Navigation mobile basse (accès rapide)
const BOTTOM_NAV = [
  { to: '/mon-compte', end: true, label: 'Accueil', icon: Home },
  { to: '/mon-compte/commandes', label: 'Billets', icon: Ticket },
  { to: '/mon-compte/clubs', label: 'Clubs', icon: Shield },
  { to: '/mon-compte/pcc', label: 'PCC', icon: Wallet },
  { to: '/mon-compte/profil', label: 'Profil', icon: User },
];

export function FanDashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  // Ferme le drawer à chaque navigation
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  const initial = (profile?.display_name || user?.email || 'F')[0].toUpperCase();
  const sinceYear = (() => {
    const d = profile?.created_at || user?.created_at;
    try { return d ? new Date(d).getFullYear() : null; } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-[#04080d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.045),transparent_32%)]" />

      {/* ══ Sidebar fixe (desktop) ══ */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-white/[0.07] bg-[rgba(4,8,13,0.94)] lg:flex">
        <SidebarContent
          profile={profile} user={user} initial={initial} sinceYear={sinceYear}
          onSignOut={signOut}
        />
      </aside>

      {/* ══ Drawer mobile ══ */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.07] bg-[#04080d] lg:hidden"
            >
              <button onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white/60 hover:text-white">
                <X size={18} />
              </button>
              <SidebarContent
                profile={profile} user={user} initial={initial} sinceYear={sinceYear}
                pcc={pcc} onRecharge={() => setRechargeOpen(true)} onSignOut={signOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ Colonne principale ══ */}
      <div className="lg:pl-[248px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[rgba(4,8,13,0.85)] px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/5 lg:hidden">
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src="/paiecashfan-logo.webp" alt="" className="h-8 w-8 object-contain" />
          </Link>

          {/* Recherche (faux champ ⌘K, cohérent BO Club) */}
          <div className="relative ml-auto hidden max-w-sm flex-1 md:ml-0 md:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              type="text" placeholder="Rechercher…"
              aria-label="Rechercher"
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-12 text-sm text-white/90 outline-none transition placeholder:text-white/35 focus:border-emerald-500/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/35">⌘K</span>
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <NotificationBell />
            <Link to="/" className="hidden items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/70 transition hover:text-white sm:inline-flex">
              Retour au site <ArrowUpRight size={13} />
            </Link>
            <Link to="/mon-compte/profil" className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 transition hover:border-white/15">
              <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-400 text-xs font-black text-white">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
              </span>
              <span className="hidden pr-1 text-left leading-tight sm:block">
                <span className="block max-w-[110px] truncate text-xs font-bold text-white">{profile?.display_name || 'Mon compte'}</span>
                <span className="block text-[10px] uppercase tracking-widest text-emerald-400">Fan</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Contenu (Outlet) */}
        <main className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      {/* ══ Bottom nav mobile ══ */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-stretch border-t border-white/[0.07] bg-[rgba(4,8,13,0.96)] backdrop-blur-xl lg:hidden">
        {BOTTOM_NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold',
              isActive ? 'text-emerald-400' : 'text-white/50',
            )}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

// ── Contenu de la sidebar (réutilisé desktop + drawer) ─────────
function SidebarContent({ profile, user, initial, sinceYear, onSignOut }) {
  return (
    <>
      {/* Marque */}
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-5">
        <img src="/paiecashfan-logo.webp" alt="" className="h-8 w-8 object-contain" />
        <span className="font-display text-lg font-black tracking-tight">PaieCash<span className="text-emerald-400">Fan</span></span>
      </Link>

      {/* Identité */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-xl font-black text-white">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[18px] font-bold leading-tight text-white">{profile?.display_name || 'Fan'}</p>
          {sinceYear && <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-white/40">Fan depuis {sinceYear}</p>}
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Fan
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">{group.title}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, end, label, icon: Icon }) => (
                <NavLink
                  key={to} to={to} end={end}
                  className={({ isActive }) => cn(
                    'flex h-[46px] items-center gap-3 rounded-[10px] px-3.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_2px_0_0_0_#10b981]'
                      : 'text-white/60 hover:bg-white/[0.035] hover:text-white',
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-white/[0.06] p-3">
        <button onClick={onSignOut} className="flex w-full items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.035] hover:text-red-300">
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </>
  );
}
