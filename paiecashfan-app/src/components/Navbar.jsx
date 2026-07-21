import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, Settings, User, X, ChevronDown, Search, Lock, Building2, ShoppingBag } from 'lucide-react';
import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/cn';
import { NotificationBell } from './NotificationBell';
import { NavbarSearch } from './NavbarSearch';

const nav = [
  { label: 'Accueil',   to: '/' },
  { label: 'Boutique',  to: '/boutique' },
  { label: 'Jeux',      to: '/tombola' },
  { label: 'Fan club',  to: '/fan-club' },
  { label: 'Billetterie', to: '/billetterie' }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-ink-900/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      )}
    >
      <Container className="flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/paiecashfan-logo.webp"
            alt="PaieCashFan"
            width="40" height="40"
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl shadow-glow-emerald transition-transform group-hover:scale-110"
          />
          <span className="font-display text-lg md:text-xl font-bold tracking-tight text-bone-50">
            PaieCash<span className="text-emerald-400">Fan</span>
          </span>
        </Link>

        {/* Centered pill nav desktop */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-ink-800/60 backdrop-blur-xl px-2 py-1.5">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.end}
              className={({ isActive }) => cn(
                'relative px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] rounded-full transition-colors',
                isActive ? 'text-ink-900' : 'text-bone-300 hover:text-bone-50'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-hero"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          <IconButton aria-label="Recherche" className="inline-flex" onClick={() => setSearchOpen(true)}>
            <Search size={16} />
          </IconButton>
          <CartButton />
          <NotificationBell />

          {/* Bouton auth contextuel */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile auth */}
          <div className="md:hidden">
            <MobileAuthButton />
          </div>

          {/* Mobile menu toggle */}
          <button
            aria-label="Menu"
            onClick={() => setOpen(v => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-200 hover:text-bone-50"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden bg-ink-800 border-t border-white/5"
          >
            <Container className="py-4 flex flex-col gap-1">
              {nav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    'py-3 px-2 text-sm uppercase tracking-[0.14em] font-semibold border-b border-white/5 last:border-0',
                    isActive ? 'text-emerald-400' : 'text-bone-200 hover:text-bone-50'
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
              <MobileAuthButtons onClose={() => setOpen(false)} />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
      <NavbarSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </motion.header>
  );
}

// ─── UserMenu desktop ─────────────────────────────────────────
function UserMenu() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef(null);

  // Ferme le dropdown si clic extérieur
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/login', { state: { tab: 'login' } })}
          className="inline-flex items-center h-10 px-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold text-bone-100 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          Se connecter
        </button>
        <button
          onClick={() => navigate('/login', { state: { tab: 'register' } })}
          className="inline-flex items-center h-10 px-4 rounded-full bg-gradient-hero text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
        >
          S'inscrire
        </button>
      </div>
    );
  }

  const initials = (profile?.display_name || user.email || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setDropOpen(v => !v)}
        className="inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border border-emerald-500/30 bg-white/5 backdrop-blur-md hover:border-emerald-500/60 transition-colors"
      >
        <span className="h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-cyan-400 ring-2 ring-ink-800 grid place-items-center text-[11px] font-black text-white">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            : initials}
        </span>
        <span className="text-xs font-bold text-bone-50 max-w-[90px] truncate">
          {profile?.display_name || user.email?.split('@')[0]}
        </span>
        <ChevronDown size={14} className={cn('text-bone-400 transition-transform', dropOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {dropOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-ink-800/90 backdrop-blur-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-bold text-bone-100 truncate">
                {profile?.display_name || 'Fan'}
              </p>
              <p className="text-[10px] text-bone-500 truncate">{user.email}</p>
              {profile?.role && profile.role !== 'fan' && (
                <span className="mt-1 inline-block text-[9px] uppercase tracking-widest font-bold text-emerald-400">
                  {profile.role.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Accès back-office — réservé au super_admin */}
            {profile?.role === 'super_admin' && (
              <Link
                to="/admin"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors border-b border-white/5"
              >
                <Lock size={14} /> Admin
              </Link>
            )}

            {/* Espace représentant de club (club_admin ou demande en cours) */}
            {(profile?.role === 'club_admin' || profile?.role_request === 'club_admin') && profile?.role !== 'super_admin' && (
              <Link
                to="/mon-club"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors border-b border-white/5"
              >
                <Building2 size={14} /> Mon club
              </Link>
            )}

            <DropItem icon={<User size={14} />} label="Mon compte" to="/mon-compte" onClose={() => setDropOpen(false)} />
            <DropItem icon={<Settings size={14} />} label="Paramètres" to="/parametres" onClose={() => setDropOpen(false)} />

            <div className="border-t border-white/5">
              <button
                onClick={async () => { setDropOpen(false); await signOut(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropItem({ icon, label, to, onClose }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-bone-200 hover:text-bone-50 hover:bg-white/5 transition-colors"
    >
      <span className="text-bone-400">{icon}</span>
      {label}
    </Link>
  );
}

// ─── Mobile auth button (icon uniquement) ────────────────────
function MobileAuthButton() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <button
      onClick={() => navigate('/login')}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
    >
      <User size={16} />
    </button>
  );

  return (
    <Link
      to="/mon-compte"
      className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-cyan-400 text-white text-xs font-black"
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        : (user.email || '?')[0].toUpperCase()}
    </Link>
  );
}

// ─── Mobile drawer auth buttons ───────────────────────────────
function MobileAuthButtons({ onClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) return (
    <div className="mt-3 space-y-2">
      {profile?.role === 'super_admin' && (
        <Link
          to="/admin"
          onClick={onClose}
          className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-bold"
        >
          <Lock size={14} /> Admin
        </Link>
      )}
      {(profile?.role === 'club_admin' || profile?.role_request === 'club_admin') && profile?.role !== 'super_admin' && (
        <Link
          to="/mon-club"
          onClick={onClose}
          className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-bold"
        >
          <Building2 size={14} /> Mon club
        </Link>
      )}
      <button
        onClick={async () => { onClose(); await signOut(); navigate('/'); }}
        className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold"
      >
        <LogOut size={14} /> Se déconnecter
      </button>
    </div>
  );

  return (
    <div className="flex gap-2 pt-3">
      <Button variant="outline" size="sm" className="flex-1" onClick={() => { onClose(); navigate('/login', { state: { tab: 'login' } }); }}>
        Se connecter
      </Button>
      <Button variant="primary" size="sm" className="flex-1" onClick={() => { onClose(); navigate('/login', { state: { tab: 'register' } }); }}>
        S'inscrire
      </Button>
    </div>
  );
}

// Panier boutique dans la navbar — visible dès qu'il y a des articles.
// Sur la page du club : défile vers la boutique ; ailleurs : y navigue.
function CartButton() {
  const cart = useCart();
  const navigate = useNavigate();
  if (!cart?.totalItems || !cart.club) return null;

  const onClick = () => {
    const el = document.getElementById('merchandise');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate(`/clubs/${cart.club.slug}`);
  };

  return (
    <button
      onClick={onClick}
      aria-label="Mon panier"
      title={`Panier — ${cart.totalItems} article${cart.totalItems > 1 ? 's' : ''}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
    >
      <ShoppingBag size={16} />
      <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-black text-ink-900 shadow-glow-emerald">
        {cart.totalItems > 9 ? '9+' : cart.totalItems}
      </span>
    </button>
  );
}

function IconButton({ children, className, ...rest }) {
  return (
    <button
      {...rest}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}
