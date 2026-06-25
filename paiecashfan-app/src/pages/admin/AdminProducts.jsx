// BO Super Admin — Gestion globale des produits (tous clubs)
// Permet de filtrer, changer le statut, et ouvrir l'édition complète
// d'un produit dans la boutique de son club.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, Pencil, ChevronDown, Check, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const PRODUCT_STATUS = {
  active:   { label: 'Actif',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  inactive: { label: 'Inactif',   color: 'text-bone-400    bg-white/5        border-white/10'      },
  sold_out: { label: 'Épuisé',    color: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
  draft:    { label: 'Brouillon', color: 'text-cyan-400    bg-cyan-500/10    border-cyan-500/20'   },
};
const STATUS_OPTIONS = ['active', 'inactive', 'sold_out', 'draft'];

export function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, eur_price, pcc_price, status, category_slug, display_order, tenant_id,
        tenant:tenants(name, slug)
      `)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function changeStatus(id, status) {
    setSaving(id);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/products/${id}`, {
        method: 'PUT', body: JSON.stringify({ status })
      });
      if (!json.success) throw new Error(json.error);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
      showToast(`Statut → ${PRODUCT_STATUS[status]?.label || status}`);
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(null);
  }

  async function deleteProduct(id, name) {
    if (!confirm(`Supprimer définitivement le produit « ${name} » ?\n\nCette action est irréversible.`)) return;
    setDeleting(id);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/products/${id}`, { method: 'DELETE' });
      if (!json.success) throw new Error(json.error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Produit supprimé');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setDeleting(null);
  }

  const filtered = products.filter((p) =>
    !search ||
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.tenant?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category_slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">Produits</h1>
          <p className="text-sm text-bone-400 mt-1">{products.length} produits en base</p>
        </div>
        <button onClick={load} className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
        <input
          type="text"
          placeholder="Nom, club, catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-800/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">Aucun produit trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3 font-semibold">Produit</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Club</th>
                <th className="text-left px-5 py-3 font-semibold">Prix EUR</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Prix PCC</th>
                <th className="text-left px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-bone-100">{p.name}</p>
                    <p className="text-[10px] text-bone-500">{p.category_slug || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-bone-400 hidden md:table-cell">
                    {p.tenant?.name || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-bone-200">
                    {p.eur_price != null ? `${p.eur_price} €` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-emerald-400 hidden md:table-cell">
                    {p.pcc_price != null ? `${p.pcc_price} PCC` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <ProductStatusDropdown
                      status={p.status || 'draft'}
                      saving={saving === p.id}
                      onChange={(s) => changeStatus(p.id, s)}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        title="Modifier dans la boutique du club"
                        disabled={!p.tenant_id}
                        onClick={() => navigate(`/admin/clubs/${p.tenant_id}/edit?tab=products`)}
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center transition-colors disabled:opacity-30"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        title="Supprimer"
                        disabled={deleting === p.id}
                        onClick={() => deleteProduct(p.id, p.name)}
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-red-400 hover:border-red-500/30 grid place-items-center transition-colors disabled:opacity-40"
                      >
                        {deleting === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Menu déroulant de statut produit ─────────────────────────────────
function ProductStatusDropdown({ status, saving, onChange }) {
  const [open, setOpen] = useState(false);
  const meta = PRODUCT_STATUS[status] || PRODUCT_STATUS.draft;
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
                const m = PRODUCT_STATUS[s];
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
