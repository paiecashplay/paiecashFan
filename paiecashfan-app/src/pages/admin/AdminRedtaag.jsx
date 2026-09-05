import { useEffect, useRef, useState } from 'react';
import { Ticket, Loader2, Check, X, RefreshCw, ChevronDown, Search, Info } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Super-admin : attribue chaque event Redtaag (match en vente) à un club.
// Assigner = importer les tarifs de l'event comme offres billet du club →
// la billetterie du club les affiche et l'achat émet le billet.
export function AdminRedtaag() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null); // eventId en cours
  const [choice, setChoice] = useState({}); // eventId → tenantId sélectionné

  async function load() {
    setLoading(true);
    setError('');
    try {
      const evRes = await apiFetch('/api/v2/admin/redtaag/events');
      setEvents(evRes?.data?.events || []);
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

      {/* Mode d'emploi pour les admins. */}
      <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="text-sm leading-relaxed text-bone-300">
          <p className="font-bold text-bone-100">Comment ça marche</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 marker:text-emerald-400/70">
            <li>
              Chaque ligne = un <strong className="text-bone-100">match en vente sur Redtaag</strong>.
              Choisis le <strong className="text-bone-100">club</strong> auquel il appartient (recherche
              par nom), puis clique <strong className="text-bone-100">Assigner</strong>.
            </li>
            <li>
              À l'attribution, les <strong className="text-bone-100">tarifs du match sont importés</strong>{' '}
              comme billets dans la billetterie de ce club : les fans les voient et peuvent les acheter.
            </li>
            <li>
              À l'achat, le <strong className="text-bone-100">vrai billet Redtaag est émis</strong>{' '}
              automatiquement (QR envoyé par email au fan).
            </li>
            <li>
              <strong className="text-bone-100">Réassigner</strong> déplace les billets vers un autre
              club ; la <strong className="text-bone-100">croix rouge</strong> les retire (le match n'est
              plus en vente chez ce club).
            </li>
          </ol>
        </div>
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
                      <Check size={12} /> Assigné à {ev.tenantName || '—'} ·{' '}
                      {ev.offerCount} tarif(s)
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <ClubCombo
                    value={choice[ev.id] ?? ev.tenantId ?? ''}
                    defaultLabel={ev.tenantName || ''}
                    onChange={(id) =>
                      setChoice((c) => ({ ...c, [ev.id]: id }))
                    }
                  />

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

// Sélecteur de club avec RECHERCHE CÔTÉ SERVEUR : indispensable car la base
// compte des centaines de clubs (bien plus que la limite d'une page). On
// interroge /admin/clubs?search= à chaque frappe (débouncé) → tous les clubs
// sont trouvables, pas seulement les 100 premiers.
function ClubCombo({ value, defaultLabel = '', onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(defaultLabel);
  const boxRef = useRef(null);

  // Le libellé du bouton suit le club assigné (fourni par le parent).
  useEffect(() => { setLabel(defaultLabel); }, [defaultLabel]);

  // Recherche serveur débouncée (250 ms), uniquement quand le menu est ouvert.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const term = q.trim();
        const res = await apiFetch(
          `/api/v2/admin/clubs?limit=100${term ? `&search=${encodeURIComponent(term)}` : ''}`
        );
        const raw = res?.data?.clubs || [];
        if (alive) {
          setResults(
            raw
              .map((c) => ({ id: c.id, name: c.name }))
              .filter((c) => c.id && c.name)
          );
        }
      } catch {
        if (alive) setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q, open]);

  return (
    <div className="relative w-full min-w-[160px] flex-1 sm:w-[220px] sm:flex-none" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 text-left text-sm text-bone-100 outline-none transition hover:border-white/20 focus:border-emerald-400/50"
      >
        <span className={label ? 'truncate' : 'truncate text-bone-500'}>
          {label || 'Choisir un club…'}
        </span>
        <ChevronDown size={15} className="shrink-0 text-bone-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-950 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-3">
              <Search size={14} className="text-bone-500" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un club…"
                className="h-10 w-full bg-transparent text-sm text-bone-100 outline-none placeholder:text-bone-500"
              />
              {loading && <Loader2 size={13} className="animate-spin text-bone-500" />}
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {results.length === 0 ? (
                <p className="px-3 py-3 text-xs text-bone-500">
                  {loading ? 'Recherche…' : 'Aucun club trouvé.'}
                </p>
              ) : (
                results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setLabel(c.name);
                      setOpen(false);
                      setQ('');
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/[0.05] ${
                      c.id === value ? 'text-emerald-300' : 'text-bone-200'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === value && (
                      <Check size={14} className="shrink-0 text-emerald-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
