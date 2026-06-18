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
        // PaieCashFan — Brand emerald (vert PaieCash)
        // ------------------------------------------------------------
        // Fond très sombre + vert PaieCash en primaire,
        // cyan en accent secondaire, or pour les éléments premium.
        // ============================================================
        ink: {
          950: '#020308',
          900: '#04080d',  // background (cf. marketplace .ph-section)
          800: '#070c11',
          700: '#0d1419',
          600: '#152024',
          500: '#1f2d34',
          400: '#324554'
        },
        bone: {
          50:  '#ffffff',
          100: '#f0fdf4',
          200: '#dbece3',
          300: '#a8c0b3',
          400: '#7a9085',
          500: '#5a6d65',
          600: '#3f4f48'
        },
        // Vert PaieCash — couleur principale (logo)
        emerald: {
          300: '#6ee7b7',
          400: '#34d399',  // hover, accent clair
          500: '#10b981',  // primaire (logo PaieCash)
          600: '#059669',  // depth, shadow
          700: '#047857'
        },
        // Vert vif "néon" pour les highlights (cycling word, "on-chain")
        lime: {
          400: '#22d35e',
          500: '#16c34a'
        },
        // Cyan en accent secondaire (encore présent mais usage limité)
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4'
        },
        // Or pour les badges premium et hover
        gold: {
          400: '#fcd34d',
          500: '#fbbf24',
          600: '#d97706'
        },
        // Couleurs sport/contextuelles
        pink:    { 400: '#f472b6' },
        rose:    { 500: '#f43f5e' }
      },
      fontFamily: {
        sans:      ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display:   ['"Barlow Condensed"', '"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body:      ['"Barlow"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:      ['"DM Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 6vw, 6rem)',     { lineHeight: '0.96', letterSpacing: '-0.01em' }],
        'display-xl':  ['clamp(2.5rem, 5vw, 4.5rem)',   { lineHeight: '0.95', letterSpacing: '-0.01em' }],
        'display-lg':  ['clamp(2rem, 4vw, 3.25rem)',    { lineHeight: '1.05', letterSpacing: '-0.005em' }]
      },
      borderRadius: {
        xl:   '16px',
        '2xl':'24px',
        '3xl':'32px'
      },
      boxShadow: {
        'glow-emerald':    '0 0 80px -10px rgba(16, 185, 129, 0.45)',
        'glow-emerald-lg': '0 0 120px -10px rgba(16, 185, 129, 0.7), 0 0 40px -10px rgba(16, 185, 129, 0.4)',
        'glow-lime':       '0 0 80px -10px rgba(34, 211, 94, 0.4)',
        'glow-cyan':       '0 0 80px -10px rgba(34, 211, 238, 0.35)',
        'glow-gold':       '0 0 80px -10px rgba(251, 191, 36, 0.35)',
        'card':            '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)'
      },
      backgroundImage: {
        'gradient-hero':   'linear-gradient(135deg, #10b981 0%, #22d35e 50%, #34d399 100%)',
        'gradient-brand':  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-emerald-cyan': 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        'spotlight':       'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.18), transparent 60%)',
        'emerald-glow':    'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,0.18), transparent 70%)',
        'grid-faint':      'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid-48': '48px 48px'
      },
      animation: {
        'fade-up':       'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow':    'pulseGlow 2.6s ease-in-out infinite',
        'spin-slow':     'spin 30s linear infinite',
        'float-y':       'floatY 6s ease-in-out infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'word-in':       'wordIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both'
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 40px -10px rgba(16, 185, 129, 0.3)' },
          '50%':      { boxShadow: '0 0 100px -10px rgba(16, 185, 129, 0.7)' }
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        wordIn: {
          '0%':   { opacity: '0', transform: 'translateY(40px) skewY(6deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) skewY(0)' }
        }
      }
    }
  },
  plugins: []
};
