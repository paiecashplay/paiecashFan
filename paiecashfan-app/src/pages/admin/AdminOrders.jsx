import { useEffect, useState } from 'react';
import { Receipt, Ticket, ShoppingBag, ChevronLeft, ChevronRight, ChevronDown, MapPin, Truck, PackageCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

const SHIP_LABEL = {
  preparing: { label: 'À expédier', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  shipped:   { label: 'Expédié',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  delivered: { label: 'Livré',      cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { label: 'Annulé',     cls: 'text-bone-400 bg-white/5 border-white/10' },
};

const STATUS_TABS = [
  { id: 'all',        label: 'Toutes' },
  { id: 'completed',  label: 'Payées' },
  { id: 'pending',    label: 'En attente' },
  { id: 'processing', label: 'En cours' },
  { id: 'shipped',    label: 'Expédiées' },
  { id: 'cancelled',  label: 'Annulées' },
  { id: 'refunded',   label: 'Remboursées' },
];

const STATUS_STYLE = {
  completed:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pending:    'text-amber-400   bg-amber-500/10   border-amber-500/20',
  processing: 'text-sky-400     bg-sky-500/10     border-sky-500/20',
  shipped:    'text-cyan-400    bg-cyan-500/10    border-cyan-500/20',
  cancelled:  'text-bone-400    bg-white/5        border-white/10',
  refunded:   'text-rose-400    bg-rose-500/10    border-rose-500/20',
};

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (s) => {
  try { return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return s; }
};

export function AdminOrders() {
  const [status, setStatus] = useState('all');
  const [page, setPage]     = useState(1);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [tick, setTick]     = useState(0);   // force le rechargement après une action
  const limit = 30;

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/v2/admin/orders?status=${status}&page=${page}&limit=${limit}`)
      .then((json) => setData(json.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, page, tick]);

  const orders = data?.orders || [];
  const total  = data?.total || 0;
  const pages  = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Commandes</h1>
        <p className="text-sm text-bone-400 mt-1">Billetterie & boutique — {fmt(total)} commande{total > 1 ? 's' : ''}</p>
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setStatus(t.id); setPage(1); }}
            className={[
              'shrink-0 h-9 px-4 rounded-full text-xs font-semibold transition-colors border',
              status === t.id
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-bone-400 border-white/10 hover:text-bone-100',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Liste */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/50 overflow-hidden">
        {/* En-tête (desktop) */}
        <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500 font-bold">
          <span>Date</span><span>Club / Articles</span><span>Acheteur</span><span>Montant</span><span>Statut</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="mx-auto text-bone-600" size={34} />
            <p className="mt-3 text-sm text-bone-400">Aucune commande pour ce filtre.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o) => <OrderRow key={o.id} order={o} onChanged={() => setTick((t) => t + 1)} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-300 disabled:opacity-40 hover:text-bone-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-bone-400">Page {page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-300 disabled:opacity-40 hover:text-bone-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Ligne de commande (extensible) + expédition boutique ─────────────
function OrderRow({ order: o, onChanged }) {
  const [open, setOpen] = useState(false);
  const Icon = o.kind === 'ticketing' ? Ticket : ShoppingBag;
  const itemCount = (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 1), 0);
  const hasShipping = !!o.shipping;
  const ship = SHIP_LABEL[o.shippingStatus];

  return (
    <div className={hasShipping ? 'cursor-pointer' : ''}>
      <div
        onClick={() => hasShipping && setOpen((v) => !v)}
        className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="text-xs text-bone-400">{fmtDate(o.createdAt)}</div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-bone-100 truncate">{o.clubName}</span>
            {hasShipping && <ChevronDown size={13} className={`shrink-0 text-bone-500 transition-transform ${open ? 'rotate-180' : ''}`} />}
          </div>
          <p className="mt-0.5 text-[11px] text-bone-500 truncate">
            {itemCount} article{itemCount > 1 ? 's' : ''}{o.reference ? ` · ${o.reference}` : ''}
          </p>
        </div>

        <div className="text-xs text-bone-300 truncate">{o.buyer}</div>

        <div className="text-sm font-bold text-emerald-400 tabular-nums">
          {fmt(o.totalPcc)} PCC
          {o.totalEur ? <span className="block text-[11px] font-normal text-bone-500">{fmt(o.totalEur)} €</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLE[o.status] || 'text-bone-400 bg-white/5 border-white/10'}`}>
            {o.status}
          </span>
          {ship && (
            <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${ship.cls}`}>
              {ship.label}
            </span>
          )}
        </div>
      </div>

      {open && hasShipping && <FulfillmentPanel order={o} onChanged={onChanged} />}
    </div>
  );
}

function FulfillmentPanel({ order: o, onChanged }) {
  const s = o.shipping || {};
  const [carrier, setCarrier] = useState(o.carrier || '');
  const [tracking, setTracking] = useState(o.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(o.trackingUrl || '');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function patch(body, tag) {
    setErr(''); setBusy(tag);
    try { await apiFetch(`/api/v2/admin/orders/${o.id}/fulfillment`, { method: 'PATCH', body: JSON.stringify(body) }); onChanged(); }
    catch (e) { setErr(e?.message || 'Action impossible.'); setBusy(''); }
  }

  return (
    <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4" onClick={(e) => e.stopPropagation()}>
      {/* Adresse */}
      <div className="rounded-xl border border-white/10 bg-ink-900/50 p-3 text-xs text-bone-300">
        <MapPin size={12} className="inline mr-1 text-bone-400" />
        <span className="text-bone-100 font-bold">{s.name}</span> — {s.address1}{s.address2 ? `, ${s.address2}` : ''}, {s.postalCode} {s.city}, {s.country}
        {s.phone && <span className="text-bone-500"> · ☎ {s.phone}</span>}
      </div>

      {/* Saisie du suivi (tant que non livré) */}
      {o.shippingStatus !== 'delivered' && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Transporteur (Colissimo…)"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="N° de suivi"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
          <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="Lien de suivi (optionnel)"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
        </div>
      )}

      {err && <p className="mt-2 text-sm text-rose-300">{err}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {o.shippingStatus === 'preparing' && (
          <button onClick={() => patch({ status: 'shipped', carrier, trackingNumber: tracking, trackingUrl }, 'ship')} disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 disabled:opacity-60">
            {busy === 'ship' ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />} Marquer expédié
          </button>
        )}
        {o.shippingStatus === 'shipped' && (
          <>
            <button onClick={() => patch({ carrier, trackingNumber: tracking, trackingUrl }, 'save')} disabled={!!busy}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-60">
              {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : null} Enregistrer le suivi
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
