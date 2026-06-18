import { cn } from '@/lib/cn';

// Affiche un petit indicateur "Live" ou "Démo" pour montrer si les données
// affichées viennent de l'API (Worker Hono) ou du fallback frontend.
export function DataSourceBadge({ isLive, className }) {
  if (isLive) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1',
        'text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400',
        className
      )}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Live API
      </span>
    );
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-bone-400/20 bg-white/5 px-2.5 py-1',
      'text-[9px] font-bold uppercase tracking-[0.2em] text-bone-400',
      className
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-bone-400/50" />
      Démo
    </span>
  );
}
