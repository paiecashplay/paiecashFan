import { cn } from '@/lib/cn';

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'text-bone-300 border-white/10 bg-white/5',
    indigo:  'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
    cyan:    'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    gold:    'text-gold-400 border-gold-500/30 bg-gold-500/10',
    live:    'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5',
        'text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
