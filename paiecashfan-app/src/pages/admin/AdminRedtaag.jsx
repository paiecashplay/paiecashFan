import { useEffect, useState } from 'react';
import { Ticket, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Super-admin : attribue chaque event Redtaag (match en vente) à un club.
// Assigner = importer les tarifs de l'event comme offres billet du club →
// la billetterie du club les affiche et l'achat émet le billet.
export function AdminRedtaag() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null); // eventId en cours
  const [choice, setChoice] = useState({}); // eventId → tenantId sélectionné

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [evRes, clubRes] = await Promise.all([
        apiFetch('/api/v2/admin/redtaag/events'),
        apiFetch('/api/v2/admin/clubs?limit=500'),
      ]);
      setEvents(evRes?.data?.events || []);
      const rawClubs =
        clubRes?.data?.clubs || clubRes?.data || clubRes?.clubs || [];
      setClubs(
        rawClubs
          .map((c) => ({ id: c.id || c.uuid, name: c.name || c.club_name }))
          .filter((c) => c.id && c.name)
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      );
    } catch (err) {
      setError(err?.message || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function assign(eventId) {
    const tenantId = choice[eventId];
    if (!tenantId) return;
    setBusy(eventId);
    setError('');
    try {
      await apiFetch('/api/v2/admin/redtaag/map', {
        method: 'POST',
        body: JSON.stringify({ eventId, tenantId }),
      });
      await load();
    } catch (err) {
      setError(err?.message || 'Attribution impossible.');
    } finally {
      setBusy(null);
    }
  }

  async function unassign(eventId) {
    setBusy(eventId);
    setError('');
    try {
      await apiFetch(`/api/v2/admin/redtaag/map/${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
      });
      await load();
    } catch (err) {
      setError(err?.message || 'Retrait impossible.');
    } finally {
      setBusy(null);
    }
  }

  const clubName = (id) => clubs.find((c) => c.id === id)?.name || '—';

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-black uppercase text-bone-50">
            <Ticket size={22} className="text-emerald-400" />
            Billetterie Redtaag
          </h1>
          <p className="mt-1 text-sm text-bone-400">
            Attribue chaque match en vente sur Redtaag à un club. Les tarifs sont
            importés automatiquement comme billets achetables.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-bone-200 transition hover:text-bone-50"
        >
          <RefreshCw size={14} /> Rafraîchir
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-bone-400">
          <Loader2 size={20} className="animate-spin text-emerald-400" />
          Chargement des events Redtaag…
        </div>
      ) : events.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <Ticket size={32} className="mx-auto text-bone-600" />
          <p className="mt-3 text-sm text-bone-300">
            Aucun event Redtaag en vente pour le moment.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((ev) => {
            const assigned = !!ev.tenantId;
            const isBusy = busy === ev.id;
            return (
              <div
                key={ev.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-black text-bone-50">
                    {ev.title || `Event ${ev.id}`}
                  </p>
                  <p className="mt-0.5 text-xs text-bone-500">
                    #{ev.id}
                    {ev.endSale ? ` · vente jusqu'au ${ev.endSale}` : ''}
                    {ev.sold ? ` · ${ev.sold} vendu(s)` : ''}
                  </p>
                  {assigned && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                      <Check size={12} /> Assigné à {clubName(ev.tenantId)} ·{' '}
                      {ev.offerCount} tarif(s)
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={choice[ev.id] ?? ev.tenantId ?? ''}
                    onChange={(e) =>
                      setChoice((c) => ({ ...c, [ev.id]: e.target.value }))
                    }
                    className="h-10 min-w-[180px] rounded-xl border border-white/10 bg-ink-950 px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/50"
                  >
                    <option value="">Choisir un club…</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => assign(ev.id)}
                    disabled={isBusy || !(choice[ev.id] ?? ev.tenantId)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-xs font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {isBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {assigned ? 'Réassigner' : 'Assigner'}
                  </button>

                  {assigned && (
                    <button
                      onClick={() => unassign(ev.id)}
                      disabled={isBusy}
                      aria-label="Retirer l'attribution"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-red-500/30 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
