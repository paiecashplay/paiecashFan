import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, ShoppingBag, User, X, ChevronDown, Search } from 'lucide-react';
import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { cn } from '@/lib/cn';

const nav = [
  { label: 'Accueil',   to: '/' },
  { label: 'Boutique',  to: '/boutique' },
  { label: 'Tombola',   to: '/tombola' },
  { label: 'Fan club',  to: '/fan-club' }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          <span className="relative h-9 w-9 rounded-xl bg-gradient-hero shadow-glow-indigo transition-transform group-hover:scale-110">
            <span className="absolute inset-1 rounded-lg bg-ink-900/60 backdrop-blur grid place-items-center text-[11px] font-black text-bone-50 font-display">P</span>
          </span>
          <span className="font-display text-lg md:text-xl font-bold tracking-tight text-bone-50">
            PaieCash<span className="text-cyan-400">Fan</span>
          </span>
        </Link>

        {/* Centered pill nav desktop */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-ink-800/60 backdrop-blur-xl px-2 py-1.5">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
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
          <IconButton aria-label="Recherche" className="hidden md:inline-flex">
            <Search size={16} />
          </IconButton>
          <IconButton aria-label="Notifications">
            <Bell size={16} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
          </IconButton>
          <IconButton aria-label="Panier" className="hidden md:inline-flex">
            <ShoppingBag size={16} />
          </IconButton>

          {/* Connect button desktop */}
          <button className="hidden md:inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:border-indigo-500/40 transition-colors group">
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 ring-2 ring-ink-800 grid place-items-center text-[10px] font-black text-white">
              <User size={12} />
            </span>
            <span className="text-xs font-bold text-bone-50">Se connecter</span>
            <ChevronDown size={14} className="text-bone-400 transition-transform group-hover:rotate-180" />
          </button>

          <Button size="sm" className="md:hidden">Connexion</Button>

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
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    'py-3 px-2 text-sm uppercase tracking-[0.14em] font-semibold border-b border-white/5 last:border-0',
                    isActive ? 'text-cyan-400' : 'text-bone-200 hover:text-bone-50'
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">Connexion</Button>
                <Button variant="primary" size="sm" className="flex-1">Inscription</Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function IconButton({ children, className, ...rest }) {
  return (
    <button
      {...rest}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}
