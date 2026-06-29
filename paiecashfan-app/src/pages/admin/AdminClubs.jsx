// BO Super Admin — Gestion des clubs / tenants
// Affiche tous les tenants, permet d'approuver / rejeter / suspendre.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Pause, RefreshCw, Plus, Pencil, Download, ChevronDown, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImportFromFootball } from '@/components/admin/ImportFromFootball';
import { cn } from '@/lib/cn';

const STATUS_META = {
  active:    { label: 'Actif',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending:   { label: 'En attente', color: 'text-amber-400  bg-amber-500/10  border-amber-500/20'  },
  rejected:  { label: 'Rejeté',    color: 'text-red-400    bg-red-500/10    border-red-500/20'    },
  suspended: { label: 'Suspendu',  color: 'text-bone-400   bg-white/5       border-white/10'      },
};

export function AdminClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [saving, setSaving]   = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]     = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { id, name }
  const [rejectReason, setRejectReason] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [pendingCount, setPendingCount] = useState(0);

  const LIMIT = 50;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Chargement serveur : recherche multi-colonnes + filtre statut + pagination.
  async function load(p = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (search.trim())   params.set('search', search.trim());
      if (filter !== 'all') params.set('status', filter);
      const json = await apiFetch(`/api/v2/admin/clubs?${params.toString()}`);
      setClubs(json.data?.clubs || []);
      setTotal(json.data?.total ?? 0);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Recherche / filtre → recharge la page 1 (debounce sur la frappe).
  useEffect(() => {
    const t = setTimeout(() => { load(1); }, 300);
    return () => clearTimeout(t);
  }, [search, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compteur "en attente" indépendant de la pagination courante.
  async function loadPendingCount() {
    try {
      const json = await apiFetch('/api/v2/admin/clubs?status=pending&limit=1');
      setPendingCount(json.data?.total ?? 0);
    } catch { /* ignore */ }
  }
  useEffect(() => { loadPendingCount(); }, []);

  async function approve(id) {
    setSaving(id);
    try {
      await apiFetch(`/api/v2/admin/clubs/${id}/approve`, {
        method: 'POST', body: JSON.stringify({ adminId: 'super_admin' })
      });
      setClubs((prev) => prev.map((c) => c.id === id ? { ...c, status: 'active' } : c));
      showToast('Club approuvé');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(null);
  }

  async function reject(id, reason) {
    setSaving(id);
    try {
      await apiFetch(`/api/v2/admin/clubs/${id}/reject`, {
        method: 'POST', body: JSON.stringify({ adminId: 'super_admin', reason })
      });
      setClubs((prev) => prev.map((c) => c.id === id ? { ...c, status: 'rejected' } : c));
      showToast('Club rejeté');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(null);
    setRejectModal(null);
    setRejectReason('');
  }

  async function changeStatus(id, status) {
    setSaving(id);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${id}`, {
        method: 'PUT', body: JSON.stringify({ status })
      });
      if (!json.success) throw new Error(json.error);
      setClubs((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      showToast(`Statut → ${STATUS_META[status]?.label || status}`);
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(null);
  }

  async function deleteClub(id, name) {
    if (!confirm(`Supprimer définitivement « ${name} » ?\n\nCette action est irréversible (joueurs, palmarès et produits liés seront aussi supprimés).`)) return;
    setDeleting(id);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${id}`, { method: 'DELETE' });
      if (!json.success) throw new Error(json.error);
      setClubs((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      showToast('Club supprimé');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setDeleting(null);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">Clubs & Tenants</h1>
          <p className="text-sm text-bone-400 mt-1">{total} club{total > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {pendingCount} en attente
            </div>
          )}
          <button
            onClick={() => load(page)}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
          >
            <Download size={14} /> Importer depuis API-Football
          </button>
          <button
            onClick={() => navigate('/admin/clubs/new')}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
          >
            <Plus size={14} /> Nouveau club
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
          <input
            type="text"
            placeholder="Nom, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-800/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'active', 'rejected', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                filter === f
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'text-bone-400 border-white/10 hover:border-white/20 hover:text-bone-200'
              )}
            >
              {f === 'all' ? 'Tous' : STATUS_META[f]?.label || f}
              {f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">Aucun club trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3 font-semibold">Club</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Pays</th>
                <th className="text-left px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => {
                const name = club.name || club.club_name || '—';
                const status = club.status || 'pending';
                const meta = STATUS_META[status] || STATUS_META.pending;
                return (
                  <tr key={club.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    {/* Nom */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt="" className="h-8 w-8 rounded-lg object-contain bg-white/5" />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center text-xs font-black text-bone-400">
                            {name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-bone-100">{name}</p>
                          <p className="text-[10px] text-bone-500 font-mono">{club.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Pays */}
                    <td className="px-5 py-3.5 text-xs text-bone-400 hidden md:table-cell">
                      {club.country || '—'}
                    </td>

                    {/* Statut (modifiable) */}
                    <td className="px-5 py-3.5">
                      <StatusDropdown
                        status={status}
                        saving={saving === club.id}
                        onChange={(s) => changeStatus(club.id, s)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/clubs/${club.id}/edit`)}
                          title="Éditer"
                          className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteClub(club.id, name)}
                          disabled={deleting === club.id}
                          title="Supprimer"
                          className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-red-400 hover:border-red-500/30 grid place-items-center transition-colors disabled:opacity-40"
                        >
                          {deleting === club.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => approve(club.id)}
                              disabled={saving === club.id}
                              title="Approuver"
                              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 text-[11px] font-bold transition-colors disabled:opacity-40"
                            >
                              {saving === club.id
                                ? <span className="h-3 w-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
                                : <><Check size={11} /> Approuver</>
                              }
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: club.id, name })}
                              disabled={saving === club.id}
                              title="Rejeter"
                              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-[11px] font-bold transition-colors disabled:opacity-40"
                            >
                              <X size={11} /> Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > LIMIT && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-bone-500">
            Page {page} / {totalPages} · {total} club{total > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Import API-Football (global → crée/complète par slug) */}
      <AnimatePresence>
        {importOpen && (
          <ImportFromFootball
            onClose={() => setImportOpen(false)}
            onImported={() => load()}
          />
        )}
      </AnimatePresence>

      {/* Modal rejet */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur"
            onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl"
            >
              <h3 className="font-display font-bold text-bone-50 mb-1">Rejeter le club</h3>
              <p className="text-sm text-bone-400 mb-4">Club : <strong className="text-bone-200">{rejectModal.name}</strong></p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Raison du rejet (optionnel)…"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-red-500/40 resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="h-9 px-4 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => reject(rejectModal.id, rejectReason)}
                  disabled={saving === rejectModal.id}
                  className="h-9 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  Confirmer le rejet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Menu déroulant de statut (changement direct depuis la liste) ──────
const STATUS_OPTIONS = ['active', 'pending', 'suspended', 'rejected'];
function StatusDropdown({ status, saving, onChange }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-opacity hover:opacity-80 disabled:opacity-50', meta.color)}
      >
        {saving
          ? <span className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
          : meta.label}
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 mt-1 w-36 rounded-xl border border-white/10 bg-ink-800 shadow-xl z-20 overflow-hidden"
            >
              {STATUS_OPTIONS.map((s) => {
                const m = STATUS_META[s];
                return (
                  <button
                    key={s}
                    onClick={() => { setOpen(false); if (s !== status) onChange(s); }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold transition-colors',
                      s === status ? 'text-emerald-400 bg-emerald-500/10' : 'text-bone-300 hover:text-bone-50 hover:bg-white/5'
                    )}
                  >
                    {m.label}
                    {s === status && <Check size={11} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
