// BO Super Admin — Vérification des candidatures de représentants de club.
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, FileText, ExternalLink, Check, X, Clock, AlertTriangle,
  Loader2, Building2, User, ShieldCheck, MessageSquare
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const STATUS_META = {
  submitted:    { label: 'À vérifier',      color: 'text-amber-400  bg-amber-500/10  border-amber-500/20' },
  under_review: { label: 'En revue',        color: 'text-cyan-400   bg-cyan-500/10   border-cyan-500/20'  },
  more_info:    { label: 'Infos demandées', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  approved:     { label: 'Validée',         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected:     { label: 'Refusée',         color: 'text-red-400    bg-red-500/10    border-red-500/20' },
  draft:        { label: 'Brouillon',       color: 'text-bone-400   bg-white/5       border-white/10' },
};
const FILTERS = ['submitted', 'more_info', 'approved', 'rejected', 'all'];
const DOC_LABEL = { kbis: 'Kbis', contract: 'Contrat', id: 'Pièce d\'identité', other: 'Autre' };

export function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2800); };

  async function load() {
    setLoading(true);
    try {
      const json = await apiFetch(`/api/v2/admin/applications?status=${filter}`);
      setApps(json.data?.applications || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  return (
    <div className="max-w-5xl space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-black text-bone-50">Candidatures</h1>
        <p className="text-sm text-bone-400 mt-1">Représentants de club à vérifier</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('min-h-10 shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              filter === f ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'text-bone-400 border-white/10 hover:border-white/20 hover:text-bone-200')}>
            {f === 'all' ? 'Toutes' : STATUS_META[f]?.label || f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : apps.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">Aucune candidature</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-5 py-3 font-semibold">Candidat</th>
                  <th className="text-left px-5 py-3 font-semibold">Club</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Docs</th>
                  <th className="text-left px-5 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => {
                  const meta = STATUS_META[a.status] || STATUS_META.draft;
                  return (
                    <tr key={a.id} onClick={() => setOpenId(a.id)}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                          <span className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 grid place-items-center text-[11px] font-black text-bone-100 shrink-0">
                            {(a.applicant_name || a.applicant_email || '?')[0]?.toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-bone-100 truncate">{a.applicant_name || '—'}</p>
                            <p className="text-[10px] text-bone-500 truncate">{a.applicant_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-bone-100">{a.club_name || a.tenant?.name || '—'}</p>
                        <p className="text-[10px] text-bone-500">{a.claim_type === 'existing' ? 'existant' : 'nouveau'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-bone-400 hidden md:table-cell">{(a.documents || []).length} fichier(s)</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-bold', meta.color)}>{meta.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openId && (
          <ApplicationModal id={openId} onClose={() => setOpenId(null)}
            onReviewed={(msg) => { showToast(msg); setOpenId(null); load(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicationModal({ id, onClose, onReviewed }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/v2/admin/applications/${id}`)
      .then((j) => { if (!cancelled) setApp(j.data?.application || null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function act(action, label) {
    if ((action === 'reject' || action === 'request-info') && !notes.trim()) {
      alert('Ajoute une note (motif) pour cette action.');
      return;
    }
    setBusy(action);
    try {
      const json = await apiFetch(`/api/v2/admin/applications/${id}/${action}`, {
        method: 'POST', body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      if (!json.success) throw new Error(json.error);
      onReviewed(label);
    } catch (e) { alert('Erreur : ' + e.message); setBusy(''); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-800 p-4 sm:p-6 shadow-2xl">
        {loading || !app ? (
          <div className="py-16 grid place-items-center"><Loader2 size={26} className="text-emerald-400 animate-spin" /></div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-black text-bone-50">{app.club_name || app.tenant?.name}</h3>
                <p className="text-xs text-bone-400 mt-0.5">{app.claim_type === 'existing' ? 'Club existant revendiqué' : 'Nouveau club (brouillon)'}</p>
              </div>
              <button onClick={onClose} className="text-bone-400 hover:text-bone-100"><X size={18} /></button>
            </div>

            <div className="space-y-2 text-sm mb-5">
              <InfoRow icon={User} label="Candidat" value={`${app.applicant_name || ''} · ${app.applicant_email || ''}`} />
              <InfoRow icon={Building2} label="Club" value={app.tenant?.name || app.club_name} />
            </div>

            {/* Documents */}
            <p className="text-[11px] font-bold text-bone-400 uppercase tracking-wider mb-2">Documents</p>
            <div className="space-y-2 mb-5">
              {(app.documents || []).length === 0 && <p className="text-xs text-bone-500">Aucun document.</p>}
              {(app.documents || []).map((d) => (
                <div key={d.path} className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-900/40 px-3 py-2">
                  <FileText size={14} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-bone-100 truncate">{DOC_LABEL[d.type] || d.type}</div>
                    <div className="text-[10px] text-bone-500 truncate">{d.name}</div>
                  </div>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300">
                      <ExternalLink size={12} /> Ouvrir
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Note de revue */}
            <label className="block text-[11px] font-bold text-bone-400 uppercase tracking-wider mb-1.5">Note (motif si refus / infos)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Optionnel pour validation, requis pour refus / demande d'infos"
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 resize-none mb-4" />

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button onClick={() => act('request-info', 'Informations demandées')} disabled={!!busy}
                className="inline-flex items-center gap-1.5 min-h-10 w-full sm:w-auto px-4 rounded-xl border border-violet-500/30 bg-violet-500/10 text-xs font-bold text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-40">
                {busy === 'request-info' ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />} Demander infos
              </button>
              <button onClick={() => act('reject', 'Candidature refusée')} disabled={!!busy}
                className="inline-flex items-center gap-1.5 min-h-10 w-full sm:w-auto px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40">
                {busy === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Refuser
              </button>
              <button onClick={() => act('approve', 'Candidature validée ✅')} disabled={!!busy}
                className="inline-flex items-center gap-1.5 min-h-10 w-full sm:w-auto px-5 rounded-xl bg-gradient-hero text-xs font-bold text-white hover:opacity-90 transition-all disabled:opacity-50">
                {busy === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Valider
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-bone-300">
      <Icon size={13} className="text-bone-500 shrink-0" />
      <span className="text-bone-500 text-xs">{label} :</span>
      <span className="text-bone-100 truncate">{value}</span>
    </div>
  );
}
