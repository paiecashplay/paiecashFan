import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

// ── Card de base (charte BO Fan) ──────────────────────────────
export function FanCard({ className, interactive = false, as: As = 'div', ...props }) {
  return (
    <As
      className={cn(
        'rounded-[18px] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(10,16,22,0.96),rgba(6,11,16,0.98))] shadow-[0_14px_35px_rgba(0,0,0,0.18)]',
        interactive && 'transition-all hover:border-emerald-500/25 hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  );
}

// ── Titre de section + lien "Voir tout" ──────────────────────
export function FanSectionTitle({ children, action, actionTo, actionOnClick, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{children}</h2>
      {action && (actionTo ? (
        <Link to={actionTo} className="text-[11px] font-bold text-emerald-400 transition-colors hover:text-emerald-300">{action}</Link>
      ) : (
        <button onClick={actionOnClick} className="text-[11px] font-bold text-emerald-400 transition-colors hover:text-emerald-300">{action}</button>
      ))}
    </div>
  );
}

// ── KPI / StatCard ────────────────────────────────────────────
export function FanStatCard({ icon: Icon, label, value, hint, to, accent = 'text-emerald-400', index = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className={cn(
        'flex min-h-[116px] flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#0a1016] p-4',
        to && 'transition-all hover:border-emerald-500/25 hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04]', accent)}>
          <Icon size={19} />
        </span>
        {to && <ChevronRight size={16} className="text-white/25" />}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-white/45">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-black tabular-nums text-white">{value}</p>
        {hint && <p className="text-[11px] text-white/40">{hint}</p>}
      </div>
    </motion.div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

// ── Empty state ───────────────────────────────────────────────
export function FanEmpty({ icon: Icon, title, hint, action, actionTo, actionOnClick, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/30">
          <Icon size={26} />
        </span>
      )}
      <p className="mt-4 text-sm font-semibold text-white/80">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-[13px] text-white/45">{hint}</p>}
      {action && (actionTo ? (
        <Link to={actionTo} className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-ink-950 transition hover:bg-emerald-400">{action}</Link>
      ) : (
        <button onClick={actionOnClick} className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-ink-950 transition hover:bg-emerald-400">{action}</button>
      ))}
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────
export function FanError({ onRetry, message = 'Impossible de charger ces informations.', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-10 text-center', className)}>
      <p className="text-sm text-white/60">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/80 transition hover:bg-white/[0.08]">
          <RefreshCw size={13} /> Réessayer
        </button>
      )}
    </div>
  );
}

// ── Skeleton lignes ───────────────────────────────────────────
export function FanRowsSkeleton({ rows = 3, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

// ── En-tête de page (pages enfants) ───────────────────────────
export function FanPageHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-emerald-400">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
