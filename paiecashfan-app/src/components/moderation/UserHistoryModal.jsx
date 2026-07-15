import { useEffect, useState } from 'react';
import { Loader2, X, MessageSquare, EyeOff, FolderOpen, Ban, ShieldOff, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const fmt = (s) => { try { return new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); } catch { return s; } };
const fmtDay = (s) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return s; } };

// Profil de modération d'un supporter (dossiers, sanctions, activité).
// La vue est bornée côté serveur : un club_admin ne voit que son salon.
export function UserHistoryModal({ basePath, userId, onClose, onRevoke }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState('');

  const load = () => apiFetch(`${basePath}/users/${userId}`).then((j) => setData(j.data || null)).catch(() => setData(null));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [basePath, userId]);

  async function revoke(id) {
    setBusy(id);
    try { await apiFetch(`${basePath}/sanctions/${id}/revoke`, { method: 'POST' }); await load(); onRevoke?.(); }
    catch { /* silencieux */ }
    setBusy('');
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-black text-bone-50">Historique du supporter</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>

        {!data ? (
          <div className="py-12 grid place-items-center"><Loader2 size={22} className="animate-spin text-bone-500" /></div>
        ) : (
          <div className="mt-4 space-y-5">
            {/* Identité */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-white/10 overflow-hidden grid place-items-center">
                {data.user.avatar ? <img src={data.user.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-black text-bone-400">{(data.user.name || '?').charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <p className="font-display text-base font-black text-bone-50">{data.user.name}</p>
                {data.user.memberSince && <p className="text-[11px] text-bone-500">Membre depuis {fmtDay(data.user.memberSince)}</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat icon={MessageSquare} label="Messages" value={data.stats.messages} />
              <Stat icon={EyeOff} label="Modérés" value={data.stats.moderated} accent={data.stats.moderated > 0 ? 'text-gold-400' : ''} />
              <Stat icon={FolderOpen} label="Dossiers" value={data.stats.cases} />
              <Stat icon={Ban} label="Sanctions" value={data.stats.sanctions} accent={data.stats.activeSanctions > 0 ? 'text-red-400' : ''} />
            </div>

            {/* Sanctions */}
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-widest text-bone-500 font-bold">Sanctions</p>
              {data.sanctions.length === 0 ? (
                <p className="text-xs text-bone-500">Aucune sanction. 👍</p>
              ) : (
                <div className="space-y-1.5">
                  {data.sanctions.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${s.isActive ? 'border-red-500/30 bg-red-500/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
                      <div className="min-w-0">
                        <span className={`font-bold ${s.isActive ? 'text-red-300' : 'text-bone-400'}`}>{s.label}</span>
                        {s.club && <span className="ml-2 text-[10px] text-bone-500">{s.club.name}</span>}
                        {s.scope === 'global' && <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-red-300">global</span>}
                        <p className="mt-0.5 text-[10px] text-bone-500">
                          {fmt(s.created_at)} · {s.is_permanent ? 'définitive' : s.ends_at ? `jusqu'au ${fmt(s.ends_at)}` : 'sans fin'}
                          {s.revoked_at && ' · levée'}
                          {s.reason_text ? ` · ${s.reason_text}` : ''}
                        </p>
                      </div>
                      {s.isActive && (
                        <button onClick={() => revoke(s.id)} disabled={busy === s.id}
                          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                          {busy === s.id ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />} Lever
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dossiers */}
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-widest text-bone-500 font-bold">Dossiers de modération</p>
              {data.cases.length === 0 ? (
                <p className="text-xs text-bone-500">Aucun dossier.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.cases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-bone-200">{c.decision || c.status}</span>
                        {c.club && <span className="ml-2 text-[10px] text-bone-500">{c.club.name}</span>}
                        {c.decision_reason && <p className="mt-0.5 text-[10px] text-bone-500">{c.decision_reason}</p>}
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-bone-600"><Clock size={10} /> {fmt(c.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent = 'text-bone-50' }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center">
      <Icon size={13} className="mx-auto text-bone-500" />
      <p className={`mt-1 font-display text-lg font-black tabular-nums ${accent}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-bone-500 font-bold">{label}</p>
    </div>
  );
}
