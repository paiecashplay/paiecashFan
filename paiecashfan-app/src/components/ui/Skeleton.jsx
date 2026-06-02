import { cn } from '@/lib/cn';

// Skeleton shimmer pour les états loading.
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/5',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        className
      )}
      style={{
        // Animation shimmer custom : on bouge un linear-gradient horizontal
        animation: 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
      {...props}
    />
  );
}
