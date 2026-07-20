import { useEffect, useMemo, useState } from 'react';
import { Gift, Truck, PackageCheck, MapPin, AlertTriangle, Loader2, Bell, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Écran « Lots à expédier » — partagé BO super admin & BO club.
// L'API /admin/prizes se scope seule selon le rôle (tout vs son club).
const STATUS_META = {
  pending_address: { label: 'Sans adresse', color: 'text-amber-300', bg: 'border-amber-400/30 bg-amber-400/10' },
  preparing:       { label: 'À expédier',   color: 'text-sky-300',   bg: 'border-sky-400/30 bg-sky-400/10' },
  shipped:         { label: 'Expédié',      color: 'text-emerald-300', bg: 'border-emerald-400/30 bg-emerald-400/10' },
  delivered:       { label: 'Livré',        color: 'text-emerald-400', bg: 'border-emerald-400/30 bg-emerald-400/10' },
  cancelled:       { label: 'Annulé',       color: 'text-bone-400',  bg: 'border-white/10 bg-white/[0.03]' },
};
const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'pending_address', label: 'Sans adresse' },
  { id: 'preparing', label: 'À expédier' },
  { id: 'shipped', label: 'Expédiés' },
  { id: 'delivered', label: 'Livrés' },
];

export function PrizeFulfillmentPanel() {
  const [prizes, setPrizes] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const load = () => apiFetch('/api/v2/admin/prizes')
    .then((j) => setPrizes(j.data?.prizes || []))
    .catch((e) => { setError(e?.message || 'Chargement impossible.'); setPrizes([]); });

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = {};
    (prizes || []).forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [prizes]);

  const shown = useMemo(
    () => (filter === 'all' ? (prizes || []) : (prizes || []).filter((p) => p.status === filter)),
    [prizes, filter],
  );

  if (prizes === null) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>;
  }

  return (
    <div>
      {/* Filtres + compteurs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f.id === 'all' ? (prizes.length) : (counts[f.id] || 0);
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                active ? 'bg-emerald-400 text-ink-900' : 'border border-white/10 bg-white/[0.03] text-bone-300 hover:text-bone-50'}`}>
              {f.label} <span className={`rounded-full px-1.5 ${active ? 'bg-ink-900/20' : 'bg-white/10'}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-10 text-center text-sm text-bone-400">
          <Gift className="mx-auto mb-3 text-bone-600" size={34} /> Aucun lot dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((p) => <PrizeRow key={p.id} prize={p} onChanged={load} />)}
        </div>
      )}
    </div>
  );
}

function PrizeRow({ prize, onChanged }) {
  const st = STATUS_META[prize.status] || STATUS_META.preparing;
  const s = prize.shipping || {};
  const [carrier, setCarrier] = useState(prize.carrier || '');
  const [tracking, setTracking] = useState(prize.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(prize.trackingUrl || '');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function patch(body, tag) {
    setErr(''); setBusy(tag);
    try { await apiFetch(`/api/v2/admin/prizes/${prize.id}`, { method: 'PATCH', body: JSON.stringify(body) }); onChanged(); }
    catch (e) { setErr(e?.message || 'Action impossible.'); setBusy(''); }
  }
  async function remind() {
    setErr(''); setBusy('remind');
    try { await apiFetch(`/api/v2/admin/prizes/${prize.id}/remind`, { method: 'POST' }); setBusy('reminded'); }
    catch (e) { setErr(e?.message || 'Relance impossible.'); setBusy(''); }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] font-black text-emerald-400">
            {prize.gameType === 'tombola' ? 'Tombola' : prize.gameType}{prize.clubName ? ` · ${prize.clubName}` : ' · Plateforme'}
          </p>
          <h3 className="mt-1 font-display text-lg font-black text-bone-50 truncate">🎁 {prize.prizeLabel || 'Lot'}</h3>
          <p className="mt-0.5 text-xs text-bone-400">Gagnant : <span className="text-bone-200 font-bold">{prize.winnerName}</span></p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
      </div>

      {/* Adresse */}
      {prize.hasAddress ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-bone-300">
          <MapPin size={12} className="inline mr-1 text-bone-400" />
          <span className="text-bone-100 font-bold">{s.name}</span> — {s.address1}{s.address2 ? `, ${s.address2}` : ''}, {s.postalCode} {s.city}, {s.country}
          {s.phone && <span className="text-bone-500"> · ☎ {s.phone}</span>}
        </div>
      ) : prize.status === 'pending_address' ? (
        <div className="mt-3 flex flex-col items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-xs text-amber-200"><AlertTriangle size={13} /> Le gagnant n'a pas encore renseigné son adresse.</span>
          <button onClick={remind} disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-amber-300 disabled:opacity-60">
            {busy === 'remind' ? <Loader2 size={12} className="animate-spin" /> : busy === 'reminded' ? <Check size={12} /> : <Bell size={12} />}
            {busy === 'reminded' ? 'Relancé' : 'Relancer'}
          </button>
        </div>
      ) : null}

      {/* Expédition : saisie transporteur + suivi (dès que l'adresse est là et non livré) */}
      {prize.hasAddress && ['preparing', 'shipped'].includes(prize.status) && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Transporteur (Colissimo…)"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="N° de suivi"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
          <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="Lien de suivi (optionnel)"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
        </div>
      )}

      {err && <p className="mt-3 text-sm text-rose-300">{err}</p>}

      {/* Actions selon le statut */}
      <div className="mt-4 flex flex-wrap gap-2">
        {prize.hasAddress && prize.status === 'preparing' && (
          <button onClick={() => patch({ status: 'shipped', carrier, trackingNumber: tracking, trackingUrl }, 'ship')} disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 disabled:opacity-60">
            {busy === 'ship' ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />} Marquer expédié
          </button>
        )}
        {prize.status === 'shipped' && (
          <>
            <button onClick={() => patch({ carrier, trackingNumber: tracking, trackingUrl }, 'save')} disabled={!!busy}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-60">
              {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Enregistrer le suivi
            </button>
            <button onClick={() => patch({ status: 'delivered' }, 'deliver')} disabled={!!busy}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 disabled:opacity-60">
              {busy === 'deliver' ? <Loader2 size={13} className="animate-spin" /> : <PackageCheck size={13} />} Marquer livré
            </button>
          </>
        )}
      </div>
    </div>
  );
}
