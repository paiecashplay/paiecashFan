import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Ban, EyeOff, Scale, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppealModal } from './AppealModal';

const fmt = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d) ? '' : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); };
const SANCTION_LABEL = { warning: 'Avertissement', mute: 'Lecture seule', room_suspension: 'Suspension', room_ban: 'Exclusion du salon', global_chat_ban: 'Exclusion générale', account_review: 'Compte en examen' };

// Statut d'un appel déjà déposé.
function AppealBadge({ appeal }) {
  if (!appeal) return null;
  const map = {
    open: { icon: Clock, cls: 'text-gold-400 bg-gold-400/10 border-gold-400/30', label: 'Contestation en cours' },
    accepted: { icon: CheckCircle2, cls: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30', label: 'Contestation acceptée' },
    rejected: { icon: XCircle, cls: 'text-bone-400 bg-white/5 border-white/10', label: 'Contestation rejetée' },
  };
  const s = map[appeal.status] || map.open;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}><s.icon size={10} /> {s.label}</span>;
}

// Vue « Ma modération » du fan : ses contenus modérés + ses sanctions, avec la
// possibilité de contester ce qui ne l'a pas déjà été.
export function MaModeration() {
  const [data, setData] = useState(null);
  const [appealTarget, setAppealTarget] = useState(null);

  const load = useCallback(() => {
    apiFetch('/api/v2/me/moderation').then((j) => setData(j.data || { moderatedContent: [], sanctions: [] })).catch(() => setData({ moderatedContent: [], sanctions: [] }));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!data) return <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>;

  const nothing = !data.moderatedContent.length && !data.sanctions.length;
  if (nothing) {
    return (
      <GlassCard className="p-10 text-center">
        <ShieldCheck className="mx-auto text-emerald-400" size={38} />
        <p className="mt-4 text-sm text-bone-300">Aucune décision de modération te concernant. 👍</p>
        <p className="mt-1 text-xs text-bone-500">Continue de faire vivre le salon dans le respect de la charte.</p>
      </GlassCard>
    );
  }

  const AppealBtn = ({ can, onClick }) => can ? (
    <button onClick={onClick} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-400/20">
      <Scale size={12} /> Contester
    </button>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Sanctions */}
      {data.sanctions.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-widest text-bone-500 font-bold">Mes sanctions</p>
          <div className="space-y-2">
            {data.sanctions.map((s) => (
              <GlassCard key={s.id} className={`p-4 ${s.isActive ? 'border-red-500/25' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-bone-100">
                      <Ban size={14} className={s.isActive ? 'text-red-400' : 'text-bone-500'} />
                      {SANCTION_LABEL[s.sanction_type] || s.sanction_type}
                      {s.club && <span className="text-[11px] font-normal text-bone-500">· {s.club.name}</span>}
                    </p>
                    <p className="mt-1 text-[11px] text-bone-500">
                      {fmt(s.created_at)} · {s.is_permanent ? 'définitive' : s.ends_at ? `jusqu'au ${fmt(s.ends_at)}` : ''}
                      {s.revoked_at && ' · levée'}
                    </p>
                    {s.appeal && <div className="mt-2"><AppealBadge appeal={s.appeal} /></div>}
                  </div>
                  <AppealBtn can={s.canAppeal} onClick={() => setAppealTarget({ type: 'sanction', id: s.id })} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Contenus modérés */}
      {data.moderatedContent.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-widest text-bone-500 font-bold">Mes contenus modérés</p>
          <div className="space-y-2">
            {data.moderatedContent.map((c) => (
              <GlassCard key={c.caseId} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-bone-500 font-bold">
                      <EyeOff size={12} /> {c.contentLabel} {c.decision === 'remove_message' ? 'retiré' : 'masqué'}
                      {c.club && <span className="font-normal normal-case tracking-normal">· {c.club.name}</span>}
                    </p>
                    <p className="mt-1.5 truncate text-sm text-bone-300 italic">« {c.excerpt} »</p>
                    <p className="mt-1 text-[11px] text-bone-500">{fmt(c.resolvedAt)}</p>
                    {c.appeal && <div className="mt-2"><AppealBadge appeal={c.appeal} /></div>}
                  </div>
                  <AppealBtn can={c.canAppeal} onClick={() => setAppealTarget({ type: 'case', id: c.caseId })} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {appealTarget && (
        <AppealModal target={appealTarget} onClose={() => setAppealTarget(null)}
          onDone={() => { setAppealTarget(null); load(); }} />
      )}
    </div>
  );
}
