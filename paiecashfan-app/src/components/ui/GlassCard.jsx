import { cn } from '@/lib/cn';

export function GlassCard({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    indigo: 'glass-indigo'
  };
  return (
    <div
      className={cn(
        'rounded-2xl transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
