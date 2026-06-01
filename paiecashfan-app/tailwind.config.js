import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const here = (p) => resolve(__dirname, p);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    here('./index.html'),
    here('./src/**/*.{js,jsx}')
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // PaieCashFan — Design system futuriste (palette marketplace Home)
        // ------------------------------------------------------------
        // Fond très sombre quasi-noir bleuté + indigo/cyan néon
        // + or pour les accents premium.
        // ============================================================
        ink: {
          950: '#020308',
          900: '#050510',  // background principal (--home-bg)
          800: '#0a0a18',
          700: '#10101e',
          600: '#1a1a2e',
          500: '#252540',
          400: '#3a3a55'
        },
        bone: {
          50: '#ffffff',
          100: '#f0f0f5',  // --home-text
          200: '#dcdce8',
          300: '#a8a8b8',
          400: '#7a7a90',  // --home-muted equivalent
          500: '#5a5a75',
          600: '#3f3f54'
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',  // --home-primary
          600: '#4f46e5'
        },
        violet: {
          400: '#c4b5fd',
          500: '#a78bfa',  // --home-secondary
          600: '#8b5cf6'
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',  // --home-accent
          500: '#06b6d4',
          600: '#0891b2'
        },
        gold: {
          400: '#fcd34d',
          500: '#fbbf24',  // --home-gold
          600: '#d97706'
        },
        pink: {
          400: '#f472b6',  // --home-pink
          500: '#ec4899'
        },
        emerald: {
          400: '#34d399',  // --home-green
          500: '#10b981'
        }
      },
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 7vw, 6.5rem)',    { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display-xl':  ['clamp(2.5rem, 5.5vw, 4.75rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-lg':  ['clamp(2rem, 4vw, 3.25rem)',    { lineHeight: '1.05', letterSpacing: '-0.025em' }]
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px'
      },
      boxShadow: {
        'glow-indigo':  '0 0 80px -10px rgba(99, 102, 241, 0.4)',
        'glow-cyan':    '0 0 80px -10px rgba(34, 211, 238, 0.4)',
        'glow-gold':    '0 0 80px -10px rgba(251, 191, 36, 0.35)',
        'card':         '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)'
      },
      backgroundImage: {
        'gradient-hero':  'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #22d3ee 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        'spotlight':      'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.18), transparent 60%)',
        'cyan-glow':      'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(34,211,238,0.15), transparent 70%)',
        'grid-faint':     'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid-48': '48px 48px'
      },
      animation: {
        'fade-up':       'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow':    'pulseGlow 2.6s ease-in-out infinite',
        'spin-slow':     'spin 30s linear infinite',
        'float-y':       'floatY 6s ease-in-out infinite',
        'shimmer':       'shimmer 2.5s linear infinite'
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 40px -10px rgba(99, 102, 241, 0.3)' },
          '50%':      { boxShadow: '0 0 100px -10px rgba(99, 102, 241, 0.7)' }
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
};
