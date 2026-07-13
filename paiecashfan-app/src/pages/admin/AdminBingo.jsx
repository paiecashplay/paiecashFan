import { useEffect, useState } from 'react';
import { Grid3x3, Plus, Trophy, Trash2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

const STATUS = ['draft', 'scheduled', 'open', 'locked', 'live', 'calculating', 'completed', 'cancelled'];
const FORMATS = { express: '3×3 (9)', standard: '5×5 (24)', expert: '6×6 (36)' };
const NEEDED = { express: 9, standard: 24, expert: 36 };
const input = 'w-full h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60';
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function AdminBingo() {
  const [editions, setEditions] = useState(null);
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', format: 'standard', costCredits: 0, rewardPoints: 100, status: 'open', badge: '', description: '' });
  const [creating, setCreating] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const load = () => apiFetch('/api/v2/bingo/admin/editions').then((j) => setEditions(j.data?.editions || [])).catch(() => setEditions([]));
  useEffect(() => { load(); }, []);

  async function create() {
    const slug = form.slug.trim() || slugify(form.title);
    if (!form.title.trim() || !slug) { showToast('Titre requis'); return; }
    setCreating(true);
    try {
      await apiFetch('/api/v2/bingo/admin/editions', { method: 'POST', body: JSON.stringify({ ...form, slug, costCredits: Number(form.costCredits) || 0, rewardPoints: Number(form.rewardPoints) || 0 }) });
      setForm({ title: '', slug: '', format: 'standard', costCredits: 0, rewardPoints: 100, status: 'open', badge: '', description: '' });
      showToast('Édition créée'); load();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setCreating(false);
  }

  async function setStatus(id, status) { try { await apiFetch(`/api/v2/bingo/admin/editions/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); load(); } catch (e) { showToast(e.message); } }
  async function settle(id) { if (!confirm('Clôturer et calculer les points ? (les résultats officiels 1/N/2 doivent être saisis)')) return; try { const j = await apiFetch(`/api/v2/bingo/admin/editions/${id}/settle`, { method: 'POST' }); showToast(`Calculé : ${j.data?.scored ?? 0} grille(s) notée(s)`); load(); } catch (e) { showToast('Erreur : ' + e.message); } }
  async function del(id) { if (!confirm('Supprimer cette édition ? (matchs, événements et grilles associés seront supprimés)')) return; try { await apiFetch(`/api/v2/bingo/admin/editions/${id}`, { method: 'DELETE' }); showToast('Supprimée'); load(); } catch (e) { showToast(e.message); } }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Sport Bingo — Éditions</h1>
        <p className="text-sm text-bone-400 mt-1">Crée des éditions, ajoute les matchs et les événements (1/N/2). Crédits virtuels, aucun argent réel.</p>
      </div>

      {/* Création */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
        <h2 className="flex items-center gap-2 font-display font-black text-bone-100 text-sm uppercase tracking-widest"><Plus size={15} /> Nouvelle édition</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <L label="Titre *"><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Spécial Ligue des Champions" /></L>
          <L label="Slug (auto si vide)"><input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="champions-league-special" /></L>
          <L label="Format"><select className={input} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>{Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></L>
          <L label="Statut"><select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></L>
          <L label="Coût (crédits)"><input type="number" min="0" className={input} value={form.costCredits} onChange={(e) => setForm({ ...form, costCredits: e.target.value })} /></L>
          <L label="Récompense (points)"><input type="number" min="0" className={input} value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: e.target.value })} /></L>
          <L label="Badge"><input className={input} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Édition prestige" /></L>
          <L label="Description"><input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></L>
        </div>
        <button onClick={create} disabled={creating} className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition disabled:opacity-50">
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Créer l'édition
        </button>
        <p className="mt-2 text-[11px] text-bone-500">Rappel : une édition {form.format} nécessite au moins <b>{NEEDED[form.format]}</b> événements pour générer une grille.</p>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {editions === null ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
          : editions.length === 0 ? <p className="text-center text-sm text-bone-400 py-8">Aucune édition.</p>
          : editions.map((ed) => (
            <div key={ed.id} className="rounded-2xl border border-white/10 bg-ink-800/40 overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <button onClick={() => setOpenId(openId === ed.id ? null : ed.id)} className="flex items-center gap-3 min-w-0 text-left">
                  {openId === ed.id ? <ChevronDown size={16} className="text-bone-400 shrink-0" /> : <ChevronRight size={16} className="text-bone-400 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-display font-black text-bone-50 truncate">{ed.title} <span className="text-[10px] text-bone-500">/{ed.slug}</span></p>
                    <p className="text-xs text-bone-500">{FORMATS[ed.format]} · {ed.cost_credits} crédits · {ed.reward_points} pts</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {ed.status !== 'completed' && (
                    <button onClick={() => settle(ed.id)} title="Clôturer & calculer les points" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gold-400/30 bg-gold-400/10 text-[11px] font-bold text-gold-400 hover:bg-gold-400/20"><Trophy size={13} /> Clôturer</button>
                  )}
                  <select value={ed.status} onChange={(e) => setStatus(ed.id, e.target.value)} className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-[11px] text-bone-200">{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                  <button onClick={() => del(ed.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>
                </div>
              </div>
              {openId === ed.id && <EditionManage editionId={ed.id} format={ed.format} showToast={showToast} />}
            </div>
          ))}
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-bone-100 shadow-xl">{toast}</div>}
    </div>
  );
}

// Panneau de gestion d'une édition : matchs + événements.
function EditionManage({ editionId, format, showToast }) {
  const [data, setData] = useState(null);
  const [mForm, setMForm] = useState({ home: '', away: '', competition: '' });
  const [eForm, setEForm] = useState({ label: '', matchId: '' });

  const load = () => apiFetch(`/api/v2/bingo/admin/editions/${editionId}`).then((j) => setData(j.data)).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [editionId]);

  async function addMatch() {
    if (!mForm.home.trim() || !mForm.away.trim()) { showToast('Domicile et extérieur requis'); return; }
    try { await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/matches`, { method: 'POST', body: JSON.stringify({ ...mForm, displayOrder: (data?.matches?.length || 0) }) }); setMForm({ home: '', away: '', competition: '' }); load(); }
    catch (e) { showToast(e.message); }
  }
  async function delMatch(id) { try { await apiFetch(`/api/v2/bingo/admin/matches/${id}`, { method: 'DELETE' }); load(); } catch (e) { showToast(e.message); } }
  async function addEvent() {
    const m = data?.matches?.find((x) => x.id === eForm.matchId);
    const label = eForm.label.trim() || (m ? `${m.home} - ${m.away}` : '');
    if (!label) { showToast('Libellé ou match requis'); return; }
    try { await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/events`, { method: 'POST', body: JSON.stringify({ label, matchId: eForm.matchId || null, options: ['1', 'N', '2'], displayOrder: (data?.events?.length || 0) }) }); setEForm({ label: '', matchId: '' }); load(); }
    catch (e) { showToast(e.message); }
  }
  async function delEvent(id) { try { await apiFetch(`/api/v2/bingo/admin/events/${id}`, { method: 'DELETE' }); load(); } catch (e) { showToast(e.message); } }
  // Saisie du résultat officiel d'un événement (Phase 1 : renseigne official_answer + settled)
  async function setResult(ev, answer) { try { await apiFetch(`/api/v2/bingo/admin/events/${ev.id}`, { method: 'PUT', body: JSON.stringify({ officialAnswer: answer, validationStatus: 'settled' }) }); load(); } catch (e) { showToast(e.message); } }

  if (!data) return <div className="p-4 border-t border-white/5"><Skeleton className="h-10 w-full" /></div>;
  const needed = { express: 9, standard: 24, expert: 36 }[format];

  return (
    <div className="border-t border-white/5 p-4 grid gap-6 md:grid-cols-2 bg-black/20">
      {/* Matchs */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-bone-300">Matchs ({data.matches.length})</h4>
        <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
          {data.matches.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <span className="text-bone-200 truncate">{m.home} <span className="text-bone-500">vs</span> {m.away}</span>
              <button onClick={() => delMatch(m.id)} className="text-bone-500 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <input className={input + ' h-9'} placeholder="Domicile" value={mForm.home} onChange={(e) => setMForm({ ...mForm, home: e.target.value })} />
          <input className={input + ' h-9'} placeholder="Extérieur" value={mForm.away} onChange={(e) => setMForm({ ...mForm, away: e.target.value })} />
          <input className={input + ' h-9 col-span-2'} placeholder="Compétition (optionnel)" value={mForm.competition} onChange={(e) => setMForm({ ...mForm, competition: e.target.value })} />
        </div>
        <button onClick={addMatch} className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-bone-200 hover:text-emerald-400"><Plus size={12} /> Ajouter le match</button>
      </div>

      {/* Événements */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-bone-300">Événements — {data.events.length}/{needed} <span className={data.events.length >= needed ? 'text-emerald-400' : 'text-amber-400'}>{data.events.length >= needed ? '✓ prêt' : '(insuffisant)'}</span></h4>
        <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
          {data.events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <span className="text-bone-200 truncate flex-1">{ev.label}</span>
              <div className="flex items-center gap-1 shrink-0">
                {['1', 'N', '2'].map((o) => (
                  <button key={o} onClick={() => setResult(ev, o)} className={`h-6 w-6 rounded text-[10px] font-bold ${ev.official_answer === o ? 'bg-emerald-500 text-ink-900' : 'bg-white/5 text-bone-400 hover:bg-white/10'}`}>{o}</button>
                ))}
                <button onClick={() => delEvent(ev.id)} className="text-bone-500 hover:text-red-400 ml-1"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-1.5">
          <select className={input + ' h-9'} value={eForm.matchId} onChange={(e) => setEForm({ ...eForm, matchId: e.target.value, label: '' })}>
            <option value="">— libellé libre —</option>
            {data.matches.map((m) => <option key={m.id} value={m.id}>{m.home} vs {m.away}</option>)}
          </select>
          <input className={input + ' h-9'} placeholder="Libellé (si pas de match)" value={eForm.label} onChange={(e) => setEForm({ ...eForm, label: e.target.value })} />
        </div>
        <button onClick={addEvent} className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-bone-200 hover:text-emerald-400"><Plus size={12} /> Ajouter l'événement</button>
        <p className="mt-2 text-[10px] text-bone-500">Les boutons 1/N/2 servent à saisir le <b>résultat officiel</b> (pour le calcul des points en Phase 2).</p>
      </div>
    </div>
  );
}

function L({ label, children }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{label}</span><div className="mt-1">{children}</div></label>;
}
