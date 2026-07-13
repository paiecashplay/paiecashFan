import { Link } from 'react-router-dom';
import { Users, Clock, Star } from 'lucide-react';

// Card d'édition Sport Bingo (320×520, identité par compétition).
// Partagée entre la page hub /tombola/sport-bingo et la section de /tombola.

export const FMT = { express: '3×3', standard: '5×5', expert: '6×6' };
export const MATCHES = { express: 9, standard: 24, expert: 36 };

// Statut → badge haut-gauche.
const STATUS_BADGE = {
  live:      { label: 'EN DIRECT', cls: 'bg-red-500 text-white' },
  open:      { label: 'OUVERTE',  cls: 'bg-emerald-500 text-ink-900' },
  scheduled: { label: 'À VENIR',  cls: 'bg-gold-400 text-ink-900' },
};

// Identité visuelle par compétition : couleur de halo + emoji du sous-titre.
export function compFor(slug = '', title = '') {
  const s = (slug + ' ' + title).toLowerCase();
  if (/champion|ligue des champ|ucl/.test(s)) return { glow: '#2D7DFF', emoji: '🏆' };
  if (/premier|angl/.test(s))                 return { glow: '#9A4DFF', emoji: '⚽' };
  if (/\bcan\b|afriq/.test(s))                return { glow: '#00D26A', emoji: '🌍' };
  if (/copa|libertad/.test(s))                return { glow: '#F2B705', emoji: '🏆' };
  if (/classico/.test(s))                     return { glow: '#E53935', emoji: '🔥' };
  if (/derb/.test(s))                         return { glow: '#2D7DFF', glow2: '#E53935', emoji: '⚔️' };
  return { glow: '#34d399', emoji: '⚽' };
}

const H2 = 2 * 3600 * 1000, H6 = 6 * 3600 * 1000;
const pad = (n) => String(n).padStart(2, '0');
function fmtCountdown(target, now) {
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
  if (d > 0) return `${d}j ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
function progressPct(startAt, target, now) {
  const end = new Date(target).getTime();
  const start = startAt ? new Date(startAt).getTime() : end - 7 * 86400000;
  if (!(end > start)) return 100;
  return Math.max(2, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

export function EditionCard({ ed, now, draft }) {
  const badge = STATUS_BADGE[ed.status] || STATUS_BADGE.open;
  const comp = compFor(ed.slug, ed.title);
  const isUpcoming = ed.status === 'scheduled';
  const isLive = ed.status === 'live';
  const target = isUpcoming ? (ed.starts_at || ed.locks_at) : (ed.locks_at || ed.ends_at);
  const cd = target ? fmtCountdown(target, now) : null;
  const pct = target ? progressPct(ed.starts_at, target, now) : 100;
  const msLeft = target ? new Date(target).getTime() - now : Infinity;
  const cdColor = isUpcoming ? '#F2B705' : msLeft < H2 ? '#E53935' : msLeft < H6 ? '#F2B705' : '#00D26A';
  const subtitle = ed.theme?.subtitle || ed.badge || '';
  const cta = draft ? 'Continuer ma grille' : (isUpcoming ? 'Voir détails' : 'Jouer');
  const style = { height: 520, borderRadius: 22, '--glow': comp.glow, '--glow2': comp.glow2 || comp.glow };

  return (
    <Link to={`/bingo/${ed.slug}`} className={`bingo-card group block w-[320px] max-w-full overflow-hidden bg-[#0a0e14] ${isLive ? 'is-live' : ''}`} style={style}>
      {/* Image hero (70 % de la hauteur) */}
      <div className="absolute inset-x-0 top-0 h-[70%] overflow-hidden" style={{ borderRadius: '22px 22px 0 0' }}>
        {ed.cover_url
          ? <img src={ed.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="h-full w-full" style={{ background: `radial-gradient(circle at 50% 30%, ${comp.glow}55, #0a0e14 72%)` }} />}
      </div>

      {/* Overlay noir dégradé */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 25%, rgba(0,0,0,.75) 60%, rgba(0,0,0,.92) 100%)' }} />

      {/* Contenu */}
      <div className="relative flex h-full flex-col p-5">
        {/* Haut : badge + joueurs */}
        <div className="flex items-start justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badge.cls}`}>
            {isLive && <span className="bingo-live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" />}{badge.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/70"><Users size={12} /> {ed.players ?? 0}</span>
        </div>

        <div className="flex-1" />

        {/* Titre géant + sous-titre + méta */}
        <h3 className="font-poster uppercase text-white leading-[0.9] tracking-wide" style={{ fontSize: 42 }}>{ed.title}</h3>
        {subtitle && <p className="mt-2 text-sm text-white/85">{comp.emoji} {subtitle}</p>}
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-white/60">
          <span>{FMT[ed.format] || '5×5'}</span><span className="text-white/25">•</span>
          <span>{MATCHES[ed.format] || 24} matchs</span><span className="text-white/25">•</span>
          <span>{(ed.difficulty || 'standard').replace(/^./, (c) => c.toUpperCase())}</span>
        </div>

        <div className="my-3 h-px bg-white/12" />

        {/* Compte à rebours + barre */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">{isUpcoming ? 'Débute dans' : 'Clôture dans'}</span>
            <span className="inline-flex items-center gap-1 font-black tabular-nums" style={{ color: cdColor }}><Clock size={11} /> {cd || '—'}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-white/12 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cdColor }} />
          </div>
        </div>

        {/* Gain max */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-white/60">Gain max</span>
          <span className="inline-flex items-center gap-1 font-display text-xl font-black text-white"><Star size={15} className="text-gold-400" /> {ed.reward_points || 0} pts</span>
        </div>

        {/* Bouton pleine largeur */}
        <div className="mt-4 w-full rounded-xl py-3 text-center text-sm font-black uppercase tracking-wider transition group-hover:brightness-110"
          style={isUpcoming ? { border: `1.5px solid ${comp.glow}`, color: '#fff' } : { backgroundColor: comp.glow, color: '#07101a' }}>
          {cta}
        </div>
      </div>
    </Link>
  );
}
