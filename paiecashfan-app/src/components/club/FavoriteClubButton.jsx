import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

// ⭐ Suivre un club : ajoute/retire des favoris du fan (→ notifications ciblées).
// N'accorde AUCUN droit sur le club (rien à voir avec le rôle club_admin).
export function FavoriteClubButton({ tenantId, className = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav] = useState(null);   // null = inconnu (chargement)
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !tenantId) { setFav(false); return; }
    let alive = true;
    apiFetch('/api/v2/me/favorites')
      .then((j) => { if (alive) setFav((j.data?.tenantIds || []).includes(tenantId)); })
      .catch(() => { if (alive) setFav(false); });
    return () => { alive = false; };
  }, [user, tenantId]);

  async function toggle() {
    if (!user) { navigate('/login'); return; }
    if (busy || !tenantId) return;
    setBusy(true);
    const next = !fav;
    setFav(next);   // optimiste
    try { const j = await apiFetch(`/api/v2/me/favorites/${tenantId}`, { method: 'POST' }); setFav(!!j.data?.favorite); }
    catch { setFav(!next); }
    setBusy(false);
  }

  if (!tenantId) return null;
  const active = fav === true;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      title={active ? 'Retirer de mes clubs' : 'Suivre ce club pour recevoir ses actus'}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all disabled:opacity-60 ${
        active
          ? 'border-gold-400/50 bg-gold-400/15 text-gold-400 shadow-[0_0_24px_-8px_rgba(251,191,36,0.7)]'
          : 'border-white/15 bg-ink-900/60 text-bone-200 hover:border-gold-400/40 hover:text-gold-400'
      } ${className}`}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className={active ? 'fill-gold-400' : ''} />}
      <span className="hidden sm:inline">{active ? 'Club suivi' : 'Suivre ce club'}</span>
    </button>
  );
}
