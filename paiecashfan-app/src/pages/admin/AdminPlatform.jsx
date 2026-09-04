// BO Super Admin — Produits « plateforme » (ex. lunettes Aivora) affichés dans
// diffusion des produits plateforme + vue « Reversements » vers les bénéficiaires.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, RefreshCw, Pencil, Trash2, Loader2, X, Upload, Coins, HandCoins, Store } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/cn';

const fmtPcc = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
const fmtEur = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmtDate = (iso) => { try { return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

const STATUS_META = {
  paid:    { label: 'Reversé',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending: { label: 'En attente', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  failed:  { label: 'Échec',      cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const GLOBAL_TARGET_OPTIONS = [
  { value: 'clubs', label: 'Clubs' },
  { value: 'federations', label: 'Fédérations' },

  // Plus tard :
  // { value: 'leagues', label: 'Ligues' },
];

export function AdminPlatform() {
  const [tab, setTab] = useState('products');
  const [store, setStore] = useState(null);
  const [storeErr, setStoreErr] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  useEffect(() => {
    apiFetch('/api/v2/admin/platform/store')
      .then((j) => setStore(j.data?.store || null))
      .catch((e) => setStoreErr(e.message || 'Compte plateforme introuvable.'));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50 flex items-center gap-2">
            <Sparkles size={22} className="text-gold-400" /> Plateforme
          </h1>
          <p className="text-sm text-bone-400 mt-1"> Produits plateforme & reversements aux bénéficiaires </p>
        </div>
      </div>

      {storeErr && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {storeErr} <span className="text-amber-400/80">— applique la migration <code>platform-products.sql</code>.</span>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-ink-800/40 p-1 w-fit">
        {[['products', 'Produits plateforme'], ['payouts', 'Reversements']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn('px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              tab === id ? 'bg-emerald-500/15 text-emerald-400' : 'text-bone-400 hover:text-bone-100')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'products' ? <ProductsTab store={store} showToast={showToast} /> : <PayoutsTab />}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg z-[60]"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Onglet Produits plateforme ──────────────────────────────────────
function ProductsTab({ store, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (nouveau) | produit
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const j = await apiFetch('/api/v2/admin/platform/products');
      setProducts(j.data?.products || []);
    } catch { /* noop */ }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(p) {
    if (!confirm(`Supprimer « ${p.name} » de toutes les boutiques ?`)) return;
    setDeleting(p.id);
    try {
      await apiFetch(`/api/v2/admin/platform/products/${p.id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      showToast('Produit supprimé');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-bone-400">{products.length} produit(s) partenaire(s) — visibles dans toutes les boutiques</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 h-9 text-xs font-bold text-white hover:opacity-90 transition"
          >
            <Plus size={14} /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-400" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gold-500/10 p-4"><Sparkles size={26} className="text-gold-400" /></div>
            <h3 className="text-lg font-bold text-bone-100">Aucun produit plateforme</h3>
            <p className="mt-2 text-sm text-bone-500 max-w-sm">  Crée un produit plateforme (ex. lunettes Aivora) : il apparaîtra dans les boutiques de tous les clubs et de toutes les fédérations.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3 font-semibold">Produit</th>
                <th className="text-left px-5 py-3 font-semibold">Prix</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Reversement (%)</th>
                <th className="text-left px-5 py-3 font-semibold">Boutiques</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.image_url ? <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">🕶️</span>}
                      <div>
                        <p className="font-semibold text-bone-100">{p.name}</p>
                        <p className="text-[10px] text-bone-500">{p.status === 'active' ? 'Actif' : p.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-emerald-400">{fmtPcc(p.pcc_price)} PCC<span className="text-bone-500"> · {p.eur_price != null ? fmtEur(p.eur_price) : '—'}</span></td>
                  <td className="px-5 py-3.5 text-xs text-bone-300 hidden md:table-cell">{Number(p.metadata?.commissionPct ?? 10)}%</td>
                  <td className="px-5 py-3.5">
                    {p.is_global
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 border border-gold-500/30 px-2 py-0.5 text-[10px] font-bold text-gold-400">Toutes</span>
                      : <span className="text-[11px] text-bone-500">Masqué</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => setEditing(p)} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center"><Pencil size={12} /></button>
                      <button disabled={deleting === p.id} onClick={() => remove(p)} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-red-400 grid place-items-center disabled:opacity-40">
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

      <AnimatePresence>
        {editing && (
          <ProductForm
            product={editing.id ? editing : null}
            storeMissing={!store}
            onClose={() => setEditing(null)}
            onSaved={(saved) => {
              setProducts((prev) => editing.id ? prev.map((x) => x.id === saved.id ? saved : x) : [saved, ...prev]);
              setEditing(null);
              showToast(editing.id ? 'Produit mis à jour' : 'Produit créé');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Formulaire création/édition ─────────────────────────────────────
function ProductForm({ product, storeMissing, onClose, onSaved }) {
  const { uploadImage, uploading } = useImageUpload();
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => {
    const savedTargets = product?.metadata?.globalTargets;

    return {
      name: product?.name || '',
      description: product?.description || '',
      eur_price: product?.eur_price ?? '',
      pcc_price: product?.pcc_price ?? '',
      stock: product?.stock ?? -1,
      commissionPct: product?.metadata?.commissionPct ?? 10,
      image:
        product?.image_url ||
        (Array.isArray(product?.images) ? product.images[0] : '') ||
        '',
      status: product?.status || 'active',

      globalTargets: Array.isArray(savedTargets)
        ? savedTargets
        : ['clubs', 'federations'],
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value }));

  function toggleGlobalTarget(target) {
    setForm((current) => {
      const targets = current.globalTargets || [];

      const exists = targets.includes(target);

      return {
        ...current,
        globalTargets: exists
          ? targets.filter((item) => item !== target)
          : [...targets, target],
      };
    });
  }


  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await uploadImage(file, 'partenaire'); if (url) setForm((f) => ({ ...f, image: url })); }
    catch (err) { setError('Upload échoué : ' + err.message); }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    if (!Number(form.pcc_price) || Number(form.pcc_price) <= 0) { setError('Le prix PCC doit être > 0.'); return; }
    if (!form.globalTargets.length) {
      setError('Sélectionne au moins une cible de diffusion.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        eur_price: form.eur_price !== '' ? Number(form.eur_price) : null,
        pcc_price: Number(form.pcc_price),
        images: form.image ? [form.image] : [],
        stock: Number(form.stock),
        commissionPct: Number(form.commissionPct),
        status: form.status,

        globalTargets: form.globalTargets,

        // Global dès qu'au moins une cible est sélectionnée.
        is_global: form.globalTargets.length > 0,
      };
      const j = product
        ? await apiFetch(`/api/v2/admin/platform/products/${product.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await apiFetch('/api/v2/admin/platform/products', { method: 'POST', body: JSON.stringify(body) });
      if (!j.success) throw new Error(j.error);
      onSaved(j.data.product);
    } catch (err) { setError(err.message || 'Enregistrement impossible.'); }
    setSaving(false);
  }

  const input = 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/70 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.form
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-base font-bold text-bone-50">{product ? 'Modifier le produit' : 'Nouveau produit plateforme'}</h3>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-bone-400 hover:bg-white/5"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {storeMissing && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">Compte « PaieCash Store » manquant — applique d'abord la migration.</p>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-bone-300">Nom *</label>
            <input value={form.name} onChange={set('name')} placeholder="Lunettes connectées Aivora" className={input} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-bone-300">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className={cn(input, 'h-auto py-2 resize-y')} />
          </div>

          {/* Image */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-bone-300">Image</label>
            <div className="flex items-center gap-3">
              {form.image ? <img src={form.image} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-lg bg-white/5 text-xl">🕶️</span>}
              <input value={form.image} onChange={set('image')} placeholder="https://… ou upload →" className={cn(input, 'flex-1')} />
              <input type="file" accept="image/*" ref={fileRef} onChange={onFile} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-xs font-semibold text-bone-200 hover:bg-white/10 disabled:opacity-50">
                <Upload size={13} /> {uploading ? '…' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-bone-300">Prix PCC *</label>
              <input type="number" min="0" step="any" value={form.pcc_price} onChange={set('pcc_price')} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-bone-300">Prix EUR</label>
              <input type="number" min="0" step="any" value={form.eur_price} onChange={set('eur_price')} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-bone-300">Stock (-1 = illimité)</label>
              <input type="number" step="1" value={form.stock} onChange={set('stock')} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-bone-300">Reversement (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.commissionPct} onChange={set('commissionPct')} className={input} />
              <p className="mt-1 text-[10px] text-bone-500">Même pourcentage appliqué aux clubs et aux fédérations. </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs font-semibold text-bone-300">
              Diffusion du produit
            </p>

            <p className="mt-1 text-[10px] text-bone-500">
              Sélectionne les types de boutiques dans lesquelles ce produit sera disponible.
            </p>

            <div className="mt-3 flex flex-wrap gap-4">
              {GLOBAL_TARGET_OPTIONS.map((target) => {
                const checked = form.globalTargets.includes(target.value);

                return (
                  <label
                    key={target.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGlobalTarget(target.value)}
                      className="h-4 w-4 accent-emerald-500"
                    />

                    <span className="text-sm text-bone-200">
                      {target.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-bone-300 hover:bg-white/5">Annuler</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {saving && <Loader2 size={15} className="animate-spin" />} {product ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

// ─── Onglet Reversements ─────────────────────────────────────────────
function PayoutsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const j = await apiFetch('/api/v2/admin/platform/commissions');
      setData(j.data || null);
    } catch {
      setData(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = data?.totals || {
    paidPcc: 0,
    pendingPcc: 0,
    count: 0,
  };

  const summary = data?.summary || [];
  const recent = data?.recent || [];

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Bandeau totaux */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={HandCoins}
          label="Total reversé aux bénéficiaires"
          value={`${fmtPcc(totals.paidPcc)} PCC`}
          accent="text-emerald-400"
        />

        <StatCard
          icon={Coins}
          label="En attente de reversement"
          value={`${fmtPcc(totals.pendingPcc)} PCC`}
          accent="text-amber-400"
        />

        <StatCard
          icon={Store}
          label="Ventes plateforme"
          value={totals.count}
          accent="text-bone-100"
        />
      </div>

      {/* Totaux par bénéficiaire */}
      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-bone-100">
            Par bénéficiaire
          </h3>

          <button
            onClick={load}
            className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {summary.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-bone-500">
            Aucun reversement pour l'instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-5 py-3 font-semibold">
                    Bénéficiaire
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Ventes
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Reversé
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    En attente
                  </th>
                </tr>
              </thead>

              <tbody>
                {summary.map((s) => (
                  <tr
                    key={s.clubId || 'x'}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-bone-100">
                          {s.club?.name || '—'}
                        </span>

                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold',
                            s.beneficiaryType === 'federation'
                              ? 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                              : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          )}
                        >
                          {s.beneficiaryType === 'federation'
                            ? 'Fédération'
                            : 'Club'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-bone-300">
                      {s.count}
                    </td>

                    <td className="px-5 py-3 font-mono text-emerald-400">
                      {fmtPcc(s.paidPcc)} PCC
                    </td>

                    <td className="px-5 py-3 font-mono text-amber-400">
                      {s.pendingPcc > 0
                        ? `${fmtPcc(s.pendingPcc)} PCC`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historique */}
      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-bone-100">
            Historique récent
          </h3>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-bone-500">
            —
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-5 py-3 font-semibold">
                    Date
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Bénéficiaire
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Produit
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Taux
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Reversement
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Statut
                  </th>
                </tr>
              </thead>

              <tbody>
                {recent.map((r) => {
                  const m =
                    STATUS_META[r.status] ||
                    STATUS_META.pending;

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-5 py-3 text-xs text-bone-400 whitespace-nowrap">
                        {fmtDate(r.created_at)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-bone-200">
                            {r.club?.name || '—'}
                          </span>

                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold',
                              r.beneficiaryType === 'federation'
                                ? 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                            )}
                          >
                            {r.beneficiaryType === 'federation'
                              ? 'Fédération'
                              : 'Club'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-bone-300">
                        {r.product?.name || '—'}
                      </td>

                      <td className="px-5 py-3 text-bone-400">
                        {Number(r.rate)}%
                      </td>

                      <td className="px-5 py-3 font-mono text-emerald-400">
                        {fmtPcc(r.commission_pcc)} PCC
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold',
                            m.cls
                          )}
                        >
                          {m.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-4">
      <div className="flex items-center gap-2 text-bone-500"><Icon size={15} /><span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span></div>
      <p className={cn('mt-2 text-xl font-black font-mono', accent)}>{value}</p>
    </div>
  );
}
