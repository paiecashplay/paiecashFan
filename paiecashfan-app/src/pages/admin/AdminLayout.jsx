import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Shield, ShoppingBag,
  Trophy, LogOut, ChevronRight, Bell, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';

const sideNav = [
  { to: '/admin',        label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
  { to: '/admin/users',  label: 'Utilisateurs',    icon: Users },
  { to: '/admin/clubs',  label: 'Clubs & Tenants', icon: Shield },
  { to: '/admin/products', label: 'Produits',      icon: ShoppingBag },
  { to: '/admin/settings', label: 'Paramètres',    icon: Settings },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-ink-900">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/5 bg-ink-800/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-hero grid place-items-center">
            <span className="font-black text-xs text-white">P</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-bone-50 leading-none">PaieCashFan</p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {sideNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-bone-400 hover:text-bone-100 hover:bg-white/5'
              )}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile bas */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-400 grid place-items-center text-[10px] font-black text-white shrink-0">
              {(profile?.display_name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-bone-100 truncate">{profile?.display_name || 'Admin'}</p>
              <p className="text-[10px] text-bone-500 truncate">super_admin</p>
            </div>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="text-bone-500 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Contenu principal ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile + desktop */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-ink-800/30 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 text-xs text-bone-400">
            <span className="text-bone-600">PaieCashFan</span>
            <ChevronRight size={12} />
            <span className="text-bone-200 font-semibold">Administration</span>
          </div>
          <button className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-300 hover:text-bone-50">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
