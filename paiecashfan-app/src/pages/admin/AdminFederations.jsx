// BO Super Admin — Gestion des fédérations
// Liste des fédérations + création. L'édition complète (hero + clubs
// membres) se fait sur /admin/federations/:id/edit.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Pencil, Loader2, Check, X, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const CONFEDERATIONS = ['CAF', 'UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'OFC'];

export function AdminFederations() {
  const navigate = useNavigate();
  const [feds, setFeds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast]     = useState('');

  async function load() {
    setLoading(true);
    try {
      const json = await apiFetch('/api/v2/admin/clubs-crud/federations');
      setFeds(json.data?.federations || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  const q = search.toLowerCase().trim();
  const filtered = !q ? feds : feds.filter((f) =>
    [f.name, f.country, f.confederation_code].some((v) => (v || '').toLowerCase().includes(q)));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">Fédérations</h1>
          <p className="text-sm text-bone-400 mt-1">{feds.length} fédérations en base</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
          <Plus size={14} /> Nouvelle fédération
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, pays, confédération…"
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-800/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40" />
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">
            {feds.length === 0 ? 'Aucune fédération. Crée la première.' : `Aucun résultat pour « ${search} ».`}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3">Fédération</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Pays</th>
                <th className="text-left px-5 py-3">Confédération</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/federations/${f.id}/edit`)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {f.logo_url
                        ? <img src={f.logo_url} alt="" className="h-9 w-9 rounded-lg object-contain bg-white/5" />
                        : <div className="h-9 w-9 rounded-lg bg-white/5 grid place-items-center text-bone-500"><Globe size={15} /></div>}
                      <div>
                        <p className="font-semibold text-bone-100">{f.flag_emoji ? `${f.flag_emoji} ` : ''}{f.name}</p>
                        <p className="text-[10px] text-bone-500 font-mono">{f.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-bone-400 hidden md:table-cell">{f.country || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-bold text-bone-300">
                      {f.confederation_code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/federations/${f.id}/edit`); }}
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center transition-colors">
                        <Pencil size={12} />
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
        {createOpen && (
          <CreateFederationModal
            onClose={() => setCreateOpen(false)}
            onCreated={(fed) => { setCreateOpen(false); showToast('Fédération créée'); navigate(`/admin/federations/${fed.id}/edit`); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modale création (minimal) → redirige vers l'édition complète ──────
function CreateFederationModal({ onClose, onCreated }) {
  const [f, setF] = useState({ name: '', country: '', country_code: '', confederation_code: 'CAF' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const input = 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';

  async function submit() {
    setErr('');
    if (!f.name || !f.country_code) { setErr('Nom et code pays requis'); return; }
    setSaving(true);
    try {
      const json = await apiFetch('/api/v2/admin/clubs-crud/federations', { method: 'POST', body: JSON.stringify(f) });
      if (!json.success) throw new Error(json.error);
      onCreated(json.data.federation);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center text-emerald-400"><Globe size={16} /></div>
          <div>
            <h3 className="font-display font-bold text-bone-50">Nouvelle fédération</h3>
            <p className="text-xs text-bone-400">Tu compléteras le hero (logo, photo…) juste après.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Nom *</label>
            <input value={f.name} onChange={set('name')} placeholder="Fédération Camerounaise de Football" className={input} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Pays</label>
            <input value={f.country} onChange={set('country')} placeholder="Cameroun" className={input} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Code pays *</label>
            <input value={f.country_code} onChange={set('country_code')} placeholder="CM" maxLength={3} className={input} />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Confédération</label>
            <select value={f.confederation_code} onChange={set('confederation_code')} className={input}>
              {CONFEDERATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-[11px] text-red-400">{err}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-50 transition-colors">Annuler</button>
          <button onClick={submit} disabled={saving || !f.name || !f.country_code}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Créer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
