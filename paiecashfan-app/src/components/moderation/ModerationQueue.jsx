import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, ShieldOff, Loader2, Flag, EyeOff, Trash2, Check, X, Clock, MessageSquare, User, History, Send, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserHistoryModal } from './UserHistoryModal';

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
const DECISION_LABEL = {
  dismiss: 'Dossier classé', hide_message: 'Message masqué', remove_message: 'Message retiré',
};
const REASON_LABEL = {
  insult: 'Insulte', harassment: 'Harcèlement', hate: 'Haine', racism: 'Racisme',
  threat: 'Menace', violence: 'Violence', sexual_content: 'Contenu sexuel',
  personal_data: 'Données perso', spam: 'Spam', provocation: 'Provocation', other: 'Autre',
};
const fmt = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

// Badge « détecté par l'IA » — l'IA ne fait que pré-classer, jamais sanctionner.
function AiBadge({ score }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-300">
      <Sparkles size={9} /> IA{typeof score === 'number' ? ` ${Math.round(score * 100)}%` : ''}
    </span>
  );
}

export function ModerationQueue({ basePath, title = 'Modération', subtitle, showClub = true }) {
  const [cases, setCases] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ status: 'open', priority: '' });
  const [openCase, setOpenCase] = useState(null);
  const [openUser, setOpenUser] = useState(null);   // historique d'un supporter
  const [view, setView] = useState('queue');        // 'queue' | 'audit'
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

      {/* Vue : file / journal */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <button onClick={() => setView('queue')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition ${view === 'queue' ? 'bg-emerald-500/20 text-emerald-300' : 'text-bone-400 hover:text-bone-200'}`}><ShieldAlert size={12} /> Dossiers</button>
        <button onClick={() => setView('audit')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition ${view === 'audit' ? 'bg-emerald-500/20 text-emerald-300' : 'text-bone-400 hover:text-bone-200'}`}><History size={12} /> Journal d'audit</button>
      </div>

      {view === 'audit' ? <AuditJournal basePath={basePath} /> : (
      <>
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
                    {c.source === 'ai' && <AiBadge score={c.ai_risk_score} />}
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

      </>
      )}

      {openCase && (
        <CaseModal basePath={basePath} caseId={openCase} onClose={() => setOpenCase(null)}
          onOpenUser={(uid) => setOpenUser(uid)}
          onDecided={(msg) => { setOpenCase(null); showToast(msg); load(); }} />
      )}

      {openUser && (
        <UserHistoryModal basePath={basePath} userId={openUser} onClose={() => setOpenUser(null)}
          onRevoke={() => { showToast('Sanction levée'); load(); }} />
      )}

      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-bone-100 shadow-xl">{toast}</div>}
    </div>
  );
}

// ── Journal d'audit ──────────────────────────────────────────
const ACTION_LABEL = (a) => {
  if (a === 'case_opened') return 'Dossier ouvert';
  if (a?.startsWith('decision:')) return 'Décision · ' + a.split(':')[1];
  if (a?.startsWith('sanction:')) return 'Sanction · ' + a.split(':')[1];
  if (a === 'sanction_revoked') return 'Sanction levée';
  return a;
};
const ACTOR_STYLE = {
  super_admin: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
  club_admin: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
  ai: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
  system: 'text-bone-400 bg-white/5 border-white/10',
  user: 'text-bone-300 bg-white/5 border-white/10',
};

function AuditJournal({ basePath }) {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    apiFetch(`${basePath}/audit?limit=100`).then((j) => setLogs(j.data?.logs || [])).catch(() => setLogs([]));
  }, [basePath]);

  if (logs === null) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>;
  if (!logs.length) return <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-10 text-center text-sm text-bone-400">Aucune action enregistrée.</div>;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-bone-500">Toutes les décisions de modération sont tracées (qui, quoi, quand). Journal en lecture seule.</p>
      {logs.map((l) => (
        <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-800/40 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${ACTOR_STYLE[l.actor_type] || ACTOR_STYLE.system}`}>{l.actor_type}</span>
            <span className="truncate text-xs text-bone-200"><b className="text-bone-100">{l.actorName}</b> — {ACTION_LABEL(l.action)}</span>
            {l.new_value?.reason && <span className="hidden truncate text-[11px] text-bone-500 sm:inline">« {l.new_value.reason} »</span>}
          </div>
          <span className="shrink-0 text-[10px] text-bone-600">{fmt(l.created_at)}</span>
        </div>
      ))}
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
function CaseModal({ basePath, caseId, onClose, onDecided, onOpenUser }) {
  const [c, setC] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [msgAction, setMsgAction] = useState('dismiss');   // action sur le message signalé
  const [sanction, setSanction] = useState({ type: '', durationHours: 24, isPermanent: false });

  useEffect(() => {
    apiFetch(`${basePath}/cases/${caseId}`).then((j) => setC(j.data?.case || null)).catch(() => setC(null));
    apiFetch(`${basePath}/config`).then((j) => setConfig(j.data || null)).catch(() => setConfig(null));
  }, [basePath, caseId]);

  async function decide(decision, label) {
    setBusy(decision); setError('');
    try {
      const body = { decision, reason };
      if (sanction.type) body.sanction = { type: sanction.type, durationHours: sanction.isPermanent ? null : Number(sanction.durationHours), isPermanent: sanction.isPermanent };
      await apiFetch(`${basePath}/cases/${caseId}/decision`, { method: 'POST', body: JSON.stringify(body) });
      onDecided(sanction.type ? `${label} + sanction appliquée` : label);
    } catch (e) { setError(e?.message || 'Décision impossible.'); }
    setBusy('');
  }

  async function revoke(sanctionId) {
    setBusy('revoke-' + sanctionId); setError('');
    try {
      await apiFetch(`${basePath}/sanctions/${sanctionId}/revoke`, { method: 'POST' });
      onDecided('Sanction levée');
    } catch (e) { setError(e?.message || 'Révocation impossible.'); }
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
            {/* Verdict IA — pré-classement uniquement, la décision reste humaine */}
            {c.source === 'ai' && (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.06] p-3">
                <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-violet-300 font-bold">
                  <Sparkles size={11} /> Pré-classement automatique
                </p>
                <p className="mt-1.5 text-xs text-bone-200">{c.ai_summary || 'Analyse indisponible.'}</p>
                {c.ai_categories?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.ai_categories.map((cat) => (
                      <span key={cat} className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-200">{REASON_LABEL[cat] || cat}</span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-bone-500">L'IA n'a fait que signaler ce message pour revue. Toute décision et toute sanction restent les tiennes.</p>
              </div>
            )}

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
              <button onClick={() => onOpenUser?.(c.target?.id)}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                <User size={12} /> Voir le profil complet de {c.target?.name}
              </button>
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
              {c.sanctions?.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {c.sanctions.map((s) => {
                    const active = !s.revoked_at && (s.is_permanent || !s.ends_at || new Date(s.ends_at) > new Date());
                    return (
                      <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <span className={`font-bold ${active ? 'text-red-300' : 'text-bone-500'}`}>{config?.labels?.[s.sanction_type] || s.sanction_type}</span>
                          <span className="ml-2 text-[10px] text-bone-500">
                            {s.is_permanent ? 'définitive' : s.ends_at ? `jusqu'au ${fmt(s.ends_at)}` : ''}
                            {s.revoked_at && ' · levée'}
                          </span>
                        </div>
                        {active && (
                          <button onClick={() => revoke(s.id)} disabled={busy === 'revoke-' + s.id}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                            {busy === 'revoke-' + s.id ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />} Lever
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                {/* 1. Message notifié au supporter */}
                <label className="mt-2 block">
                  <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Message au supporter (envoyé en notification)</span>
                  <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={400}
                    placeholder="Ex. : Vous recevez cet avertissement car votre message ne respecte pas la charte."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-xs text-bone-100 outline-none focus:border-emerald-400/60" />
                </label>

                {/* 2. Action sur le message signalé */}
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Action sur le message</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[['dismiss', 'Aucune (classer)'], ['hide_message', 'Masquer'], ['remove_message', 'Retirer']].map(([v, l]) => (
                      <button key={v} onClick={() => setMsgAction(v)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold transition ${msgAction === v ? 'border-gold-400/50 bg-gold-400/15 text-gold-400' : 'border-white/10 text-bone-400 hover:text-bone-200'}`}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* 3. Sanction optionnelle */}
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Sanction (optionnelle)</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => setSanction((s) => ({ ...s, type: '' }))}
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold transition ${!sanction.type ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 text-bone-400 hover:text-bone-200'}`}>Aucune</button>
                    {(config?.sanctionTypes || []).map((tp) => (
                      <button key={tp} onClick={() => setSanction((s) => ({ ...s, type: tp, isPermanent: false }))}
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold transition ${sanction.type === tp ? 'border-red-500/50 bg-red-500/15 text-red-300' : 'border-white/10 text-bone-400 hover:text-bone-200'}`}>
                        {config?.labels?.[tp] || tp}
                      </button>
                    ))}
                  </div>

                  {sanction.type && !['warning', 'account_review'].includes(sanction.type) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Durée</span>
                      {[['1', '1 h'], ['24', '24 h'], ['168', '7 j'], ['720', '30 j']].map(([h, l]) => (
                        <button key={h} onClick={() => setSanction((s) => ({ ...s, durationHours: h, isPermanent: false }))}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${!sanction.isPermanent && String(sanction.durationHours) === h ? 'border-gold-400/40 bg-gold-400/10 text-gold-400' : 'border-white/10 text-bone-400 hover:text-bone-200'}`}>{l}</button>
                      ))}
                      {(config?.permanentAllowed || []).includes(sanction.type) && (
                        <button onClick={() => setSanction((s) => ({ ...s, isPermanent: !s.isPermanent }))}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-black transition ${sanction.isPermanent ? 'border-red-500/60 bg-red-500/20 text-red-300' : 'border-white/10 text-bone-400 hover:text-red-300'}`}>
                          Définitive
                        </button>
                      )}
                    </div>
                  )}
                  {sanction.isPermanent && (
                    <p className="mt-2 inline-flex items-start gap-1.5 text-[10px] text-red-300"><ShieldAlert size={11} className="mt-0.5 shrink-0" /> Exclusion définitive — confirmée par toi (jamais par l'IA).</p>
                  )}
                </div>

                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                {/* Récapitulatif + action unique */}
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Ce qui va se passer</p>
                  <ul className="mt-1.5 space-y-0.5 text-[11px] text-bone-300">
                    <li>• {msgAction === 'dismiss' ? 'Le message reste publié, le dossier est classé.' : msgAction === 'hide_message' ? 'Le message est masqué du salon (conservé en base).' : 'Le message est retiré du salon (conservé en base).'}</li>
                    <li>• {sanction.type
                      ? <>Sanction <b className="text-red-300">{config?.labels?.[sanction.type] || sanction.type}</b>{!['warning', 'account_review'].includes(sanction.type) ? (sanction.isPermanent ? ' — définitive' : ` — ${({ 1: '1 h', 24: '24 h', 168: '7 j', 720: '30 j' })[sanction.durationHours] || sanction.durationHours + ' h'}`) : ''} appliquée.</>
                      : 'Aucune sanction.'}</li>
                    <li>• {sanction.type
                      ? <><b className="text-emerald-300">Le supporter est notifié</b> (cloche) {reason.trim() ? 'avec ton message.' : '— ajoute un message ci-dessus pour lui expliquer.'}</>
                      : 'Pas de notification (aucune sanction).'}</li>
                  </ul>
                </div>

                <button onClick={() => decide(msgAction, DECISION_LABEL[msgAction])} disabled={!!busy}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-400 disabled:opacity-50">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {sanction.type ? 'Appliquer et notifier le supporter' : 'Enregistrer la décision'}
                </button>
                <p className="mt-2 text-[10px] text-bone-500">Un message retiré n'est jamais supprimé physiquement. Toute décision est tracée dans le journal d'audit.</p>
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
