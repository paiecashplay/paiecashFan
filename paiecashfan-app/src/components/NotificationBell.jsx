import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Loader2, CheckCheck, Trophy, Grid3x3, Gift, MessageCircle, ShieldAlert, Ban } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const ICONS = {
  bingo_result: Grid3x3,
  tombola_win: Gift,
  match_reply: MessageCircle,
  message: MessageCircle,
  chat_blocked: ShieldAlert,
  chat_sanction: Ban,
  chat_sanction_revoked: CheckCheck,
};
const iconFor = (type) => ICONS[type] || Trophy;

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'à l\'instant';
  const m = Math.floor(s / 60); if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24); if (d < 7) return `il y a ${d} j`;
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch { return ''; }
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  // Pastille : compteur non-lus (léger), rafraîchi périodiquement.
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let alive = true;
    const poll = () => apiFetch('/api/v2/me/notifications/unread-count')
      .then((j) => { if (alive) setUnread(j.data?.unread || 0); }).catch(() => {});
    poll();
    const i = setInterval(poll, 60000);
    return () => { alive = false; clearInterval(i); };
  }, [user]);

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setItems(null);
      apiFetch('/api/v2/me/notifications')
        .then((j) => { setItems(j.data?.notifications || []); setUnread(j.data?.unread || 0); })
        .catch(() => setItems([]));
    }
  }

  async function markAllRead() {
    setBusy(true);
    try { await apiFetch('/api/v2/me/notifications/read-all', { method: 'POST' }); setItems((it) => (it || []).map((n) => ({ ...n, is_read: true }))); setUnread(0); }
    catch { /* silencieux */ }
    setBusy(false);
  }

  async function openItem(n) {
    if (!n.is_read) {
      apiFetch(`/api/v2/me/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {});
      setItems((it) => (it || []).map((x) => x.id === n.id ? { ...x, is_read: true } : x));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    const link = n.metadata?.link;
    if (link) navigate(link);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-black text-ink-900 shadow-glow-emerald">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="font-display text-sm font-black uppercase tracking-wider text-bone-50">Notifications</span>
            {(items?.some((n) => !n.is_read)) && (
              <button onClick={markAllRead} disabled={busy} className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />} Tout lire
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items === null ? (
              <div className="py-10 grid place-items-center"><Loader2 size={20} className="animate-spin text-bone-500" /></div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-sm text-bone-500">
                <Bell size={26} className="mx-auto text-bone-600" />
                <p className="mt-3">Aucune notification pour le moment.</p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <button key={n.id} onClick={() => openItem(n)}
                    className={cn('w-full text-left flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors', !n.is_read && 'bg-emerald-500/[0.05]')}>
                    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl border', n.is_read ? 'border-white/10 bg-white/5 text-bone-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400')}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-bold truncate', n.is_read ? 'text-bone-300' : 'text-bone-50')}>{n.title}</p>
                      {n.message && <p className="mt-0.5 text-xs text-bone-500 line-clamp-2">{n.message}</p>}
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-bone-600 font-bold">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
