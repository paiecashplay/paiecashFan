import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, Loader2, Flag, EyeOff, Trash2, Check, X, Clock, MessageSquare, User, History } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

// File de modération réutilisable :
//  - super_admin  → basePath = '/api/v2/admin/moderation'   (tous les salons)
//  - club_admin   → basePath = '/api/v2/clubs/:slug/moderation' (son salon)
// Le signalant n'est jamais affiché : l'API ne le renvoie pas.

const STATUS_STYLE = {
  open: 'text-gold-400 bg-gold-400/10 border-gold-400/30',
  in_review: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
  resolved: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
  dismissed: 'text-bone-400 bg-white/5 border-white/10',
};
const PRIORITY_STYLE = {
  critical: 'text-red-300 bg-red-500/15 border-red-500/40',
  high: 'text-gold-400 bg-gold-400/10 border-gold-400/30',
  normal: 'text-bone-300 bg-white/5 border-white/10',
  low: 'text-bone-500 bg-white/5 border-white/10',
};
const REASON_LABEL = {
  insult: 'Insulte', harassment: 'Harcèlement', hate: 'Haine', racism: 'Racisme',
  threat: 'Menace', violence: 'Violence', sexual_content: 'Contenu sexuel',
  personal_data: 'Données perso', spam: 'Spam', provocation: 'Provocation', other: 'Autre',
};
const fmt = (s) => { try { return new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); } catch { return s; } };

export function ModerationQueue({ basePath, title = 'Modération', subtitle, showClub = true }) {
  const [cases, setCases] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ status: 'open', priority: '' });
  const [openCase, setOpenCase] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    if (filter.status) qs.set('status', filter.status);
    if (filter.priority) qs.set('priority', filter.priority);
    apiFetch(`${basePath}/cases?${qs}`).then((j) => setCases(j.data?.cases || [])).catch(() => setCases([]));
    apiFetch(`${basePath}/stats`).then((j) => setStats(j.data?.stats || null)).catch(() => setStats(null));
  }, [basePath, filter]);
  useEffect(() => { load(); }, [load]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-black text-bone-50"><ShieldAlert size={20} className="text-gold-400" /> {title}</h1>
        {subtitle && <p className="text-sm text-bone-400 mt-1">{subtitle}</p>}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="À traiter" value={stats?.open ?? '—'} accent="text-gold-400" />
        <Stat label="Urgents" value={stats?.urgent ?? '—'} accent="text-red-400" />
        <Stat label="Traités" value={stats?.resolved ?? '—'} accent="text-emerald-400" />
        <Stat label="Classés" value={stats?.dismissed ?? '—'} />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {[['open', 'À traiter'], ['in_review', 'En cours'], ['resolved', 'Traités'], ['dismissed', 'Classés'], ['', 'Tous']].map(([v, l]) => (
          <button key={v || 'all'} onClick={() => setFilter((f) => ({ ...f, status: v }))}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${filter.status === v ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-bone-400 hover:text-bone-200'}`}>{l}</button>
        ))}
        <span className="mx-1 h-4 w-px bg-white/10" />
        {[['', 'Toutes priorités'], ['critical', 'Critique'], ['high', 'Haute']].map(([v, l]) => (
          <button key={v || 'allp'} onClick={() => setFilter((f) => ({ ...f, priority: v }))}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${filter.priority === v ? 'border-gold-400/40 bg-gold-400/10 text-gold-400' : 'border-white/10 bg-white/[0.03] text-bone-400 hover:text-bone-200'}`}>{l}</button>
        ))}
      </div>

      {/* File */}
      {cases === null ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-10 text-center">
          <Check className="mx-auto text-emerald-400" size={34} />
          <p className="mt-3 text-sm text-bone-400">Aucun dossier {filter.status === 'open' ? 'à traiter' : 'dans ce filtre'}. 🎉</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <button key={c.id} onClick={() => setOpenCase(c.id)} className="w-full rounded-2xl border border-white/10 bg-ink-800/40 p-4 text-left transition hover:border-white/20">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.normal}`}>{c.priority}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${STATUS_STYLE[c.status] || ''}`}>{c.status}</span>
                    {showClub && c.club && <span className="text-[10px] text-bone-500">· {c.club.name}</span>}
                    <span className="inline-flex items-center gap-1 text-[10px] text-bone-500"><Flag size={10} /> {c.reports_count}</span>
                  </div>
                  <p className="mt-2 truncate text-sm text-bone-200">{c.message?.content || <i className="text-bone-500">Message supprimé</i>}</p>
                  <p className="mt-1 text-[11px] text-bone-500">Par <b className="text-bone-400">{c.target?.name}</b> · {fmt(c.created_at)}</p>
                </div>
                {c.message?.moderation_status && c.message.moderation_status !== 'published' && (
                  <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[9px] font-bold uppercase text-bone-400">{c.message.moderation_status}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {openCase && (
        <CaseModal basePath={basePath} caseId={openCase} onClose={() => setOpenCase(null)}
          onDecided={(msg) => { setOpenCase(null); showToast(msg); load(); }} />
      )}

      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-bone-100 shadow-xl">{toast}</div>}
    </div>
  );
}

function Stat({ label, value, accent = 'text-bone-50' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-4">
      <p className={`font-display text-2xl font-black tabular-nums ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-widest text-bone-500 font-bold">{label}</p>
    </div>
  );
}

// ── Détail d'un dossier + décision ───────────────────────────
function CaseModal({ basePath, caseId, onClose, onDecided }) {
  const [c, setC] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`${basePath}/cases/${caseId}`).then((j) => setC(j.data?.case || null)).catch(() => setC(null));
  }, [basePath, caseId]);

  async function decide(decision, label) {
    setBusy(decision); setError('');
    try {
      await apiFetch(`${basePath}/cases/${caseId}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason }) });
      onDecided(label);
    } catch (e) { setError(e?.message || 'Décision impossible.'); }
    setBusy('');
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-black text-bone-50">Dossier de modération</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>

        {!c ? (
          <div className="py-12 grid place-items-center"><Loader2 size={22} className="animate-spin text-bone-500" /></div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Message signalé */}
            <Section icon={MessageSquare} title="Message signalé">
              <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                <p className="text-[11px] text-bone-500">{c.target?.name} · {fmt(c.message?.created_at)}</p>
                <p className="mt-1 text-sm text-bone-100">{c.message?.content || <i className="text-bone-500">Message supprimé</i>}</p>
                {c.message?.moderation_status !== 'published' && (
                  <p className="mt-2 text-[10px] font-bold uppercase text-gold-400">Statut : {c.message?.moderation_status}</p>
                )}
              </div>
            </Section>

            {/* Signalements (anonymes) */}
            <Section icon={Flag} title={`Signalements (${c.reports?.length || 0})`}>
              <p className="mb-2 text-[10px] text-bone-500">Les signalants restent anonymes.</p>
              <div className="space-y-1.5">
                {(c.reports || []).map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="min-w-0">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase text-bone-300">{REASON_LABEL[r.reason] || r.reason}</span>
                      {r.comment && <p className="mt-1 text-xs text-bone-400">{r.comment}</p>}
                    </div>
                    <span className="shrink-0 text-[10px] text-bone-600">{fmt(r.created_at)}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Contexte */}
            {c.context?.length > 0 && (
              <Section icon={Clock} title="Contexte du salon">
                <div className="space-y-1">
                  {c.context.map((m) => (
                    <div key={m.id} className={`rounded-lg px-3 py-1.5 text-xs ${m.isTarget ? 'bg-red-500/10 border border-red-500/25' : 'bg-white/[0.02]'}`}>
                      <span className="font-bold text-bone-300">{m.author}</span>
                      <span className="ml-2 text-bone-400">{m.content}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Historique utilisateur */}
            <Section icon={User} title="Historique du supporter">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Dossiers précédents</p>
                  <p className="mt-1 font-display text-lg font-black text-bone-100">{c.history?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Sanctions</p>
                  <p className="mt-1 font-display text-lg font-black text-bone-100">{c.sanctions?.length || 0}</p>
                </div>
              </div>
            </Section>

            {/* Audit */}
            {c.auditLogs?.length > 0 && (
              <Section icon={History} title="Journal d'audit">
                <div className="space-y-1">
                  {c.auditLogs.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-bone-300"><b className="text-bone-400">{l.actor_type}</b> — {l.action}</span>
                      <span className="text-bone-600">{fmt(l.created_at)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Décision */}
            {['open', 'in_review'].includes(c.status) ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Décision</p>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif (visible dans l'audit)"
                  className="mt-2 w-full h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-bone-100 outline-none focus:border-emerald-400/60" />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn onClick={() => decide('dismiss', 'Dossier classé sans suite')} busy={busy === 'dismiss'} icon={Check} tone="ghost">Classer sans suite</Btn>
                  <Btn onClick={() => decide('hide_message', 'Message masqué')} busy={busy === 'hide_message'} icon={EyeOff} tone="gold">Masquer le message</Btn>
                  <Btn onClick={() => decide('remove_message', 'Message retiré')} busy={busy === 'remove_message'} icon={Trash2} tone="red">Retirer le message</Btn>
                </div>
                <p className="mt-3 text-[10px] text-bone-500">Les avertissements et suspensions arriveront au lot suivant. Un message retiré n'est jamais supprimé physiquement.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs text-emerald-200">
                Dossier clos — décision : <b>{c.decision}</b>{c.decision_reason ? ` (${c.decision_reason})` : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-bone-500 font-bold"><Icon size={12} /> {title}</p>
      {children}
    </div>
  );
}
function Btn({ onClick, busy, icon: Icon, tone, children }) {
  const cls = tone === 'red' ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
    : tone === 'gold' ? 'border-gold-400/30 bg-gold-400/10 text-gold-400 hover:bg-gold-400/20'
    : 'border-white/10 bg-white/5 text-bone-200 hover:text-bone-50';
  return (
    <button onClick={onClick} disabled={!!busy} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${cls}`}>
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />} {children}
    </button>
  );
}
