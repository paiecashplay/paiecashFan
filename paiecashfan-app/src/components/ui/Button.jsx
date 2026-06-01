import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'tracking-tight transition-all duration-200 select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

const variants = {
  primary:
    'bg-gradient-hero text-white shadow-glow-indigo hover:shadow-glow-cyan focus-visible:ring-cyan-400',
  outline:
    'bg-white/5 backdrop-blur text-bone-100 border border-white/15 hover:border-indigo-500/50 hover:bg-white/10 focus-visible:ring-indigo-400',
  ghost:
    'bg-transparent text-bone-200 hover:text-bone-50 hover:bg-white/5 focus-visible:ring-bone-400',
  gold:
    'bg-gold-500 text-ink-900 shadow-glow-gold hover:bg-gold-400 focus-visible:ring-gold-400'
};

const sizes = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base'
};

export const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';
