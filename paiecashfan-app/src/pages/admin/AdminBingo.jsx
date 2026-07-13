import { useEffect, useMemo, useState } from 'react';
import { Grid3x3, Plus, Trophy, Trash2, Loader2, ChevronDown, ChevronRight, ClipboardPaste, Calendar, Eye, FlaskConical, Users, Rocket, X, Pencil } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { useImageUpload } from '@/hooks/useImageUpload';

const STATUS = ['draft', 'scheduled', 'open', 'locked', 'live', 'calculating', 'completed', 'cancelled'];
const FORMATS = { express: '3×3 (9)', standard: '5×5 (24)', expert: '6×6 (36)' };
const NEEDED = { express: 9, standard: 24, expert: 36 };
const input = 'w-full h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60';
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function AdminBingo() {
  const [editions, setEditions] = useState(null);
  const [toast, setToast] = useState('');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', format: 'standard', costCredits: 0, rewardPoints: 100, status: 'open', badge: '', description: '', coverUrl: '', subtitle: '' });
  const [creating, setCreating] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const load = () => apiFetch('/api/v2/bingo/admin/editions').then((j) => setEditions(j.data?.editions || [])).catch(() => setEditions([]));
  useEffect(() => { load(); }, []);

  async function pickCover(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const url = await uploadImage(file, 'bingo'); setForm((f) => ({ ...f, coverUrl: url })); showToast('Image ajoutée'); }
    catch (err) { showToast('Upload : ' + err.message); }
  }

  async function create() {
    const slug = form.slug.trim() || slugify(form.title);
    if (!form.title.trim() || !slug) { showToast('Titre requis'); return; }
    setCreating(true);
    try {
      await apiFetch('/api/v2/bingo/admin/editions', { method: 'POST', body: JSON.stringify({ ...form, slug, costCredits: Number(form.costCredits) || 0, rewardPoints: Number(form.rewardPoints) || 0, theme: { subtitle: form.subtitle || '' } }) });
      setForm({ title: '', slug: '', format: 'standard', costCredits: 0, rewardPoints: 100, status: 'open', badge: '', description: '', coverUrl: '', subtitle: '' });
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
          <L label="Sous-titre (carte)"><input className={input} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Le meilleur de l'Europe" /></L>
          <L label="Description"><input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></L>
          <L label="Image de fond (carte)">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-sm text-bone-200 hover:text-emerald-400 cursor-pointer shrink-0">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Choisir
                <input type="file" accept="image/*" className="hidden" onChange={pickCover} />
              </label>
              {form.coverUrl
                ? <img src={form.coverUrl} alt="" className="h-10 w-16 rounded-lg object-cover border border-white/10" />
                : <input className={input} value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="…ou colle une URL" />}
            </div>
          </L>
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
              {openId === ed.id && <EditionManage edition={ed} showToast={showToast} onChanged={load} />}
            </div>
          ))}
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-bone-100 shadow-xl">{toast}</div>}
    </div>
  );
}

// Parse un collage libre en lignes de matchs. Accepte : tableau markdown (|),
// tabulation, point-virgule, « Domicile vs Extérieur », « Domicile - Extérieur ».
// Colonne résultat (1/N/2) optionnelle. Ignore en-têtes et lignes de séparation.
function parseBulkMatches(text) {
  const RESULT = new Set(['1', 'N', '2']);
  const rows = [];
  for (const raw of (text || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    let cells;
    if (line.includes('|')) cells = line.split('|');
    else if (line.includes('\t')) cells = line.split('\t');
    else if (line.includes(';')) cells = line.split(';');
    else if (/\svs?\s/i.test(line)) cells = line.split(/\s+vs?\s+/i);
    else cells = line.split(/\s+[-–]\s+/);
    cells = cells.map((c) => c.trim()).filter((c) => c !== '');
    if (!cells.length) continue;
    if (cells.every((c) => /^[-:]+$/.test(c))) continue;                       // séparateur markdown
    const low = cells.map((c) => c.toLowerCase());
    if (low.some((c) => /domicile|ext[eé]rieur|r[eé]sultat|[eé]quipe/.test(c))) continue; // en-tête
    if (/^n[°o]?$/i.test(cells[0])) continue;
    if (/^\d+$/.test(cells[0]) && cells.length > 2) cells = cells.slice(1);     // colonne N°
    if (cells.length < 2) continue;
    const home = cells[0], away = cells[1];
    let officialAnswer = null;
    if (cells.length >= 3) { const r = cells[2].toUpperCase(); if (RESULT.has(r)) officialAnswer = r; }
    if (home && away) rows.push({ home, away, officialAnswer });
  }
  return rows;
}

// Panneau de gestion d'une édition : liste unifiée matchs/événements + saisie.
function EditionManage({ edition, showToast, onChanged }) {
  const editionId = edition.id;
  const format = edition.format;
  const [data, setData] = useState(null);
  const [row, setRow] = useState({ home: '', away: '', competition: '', kickoffAt: '' });
  const [busy, setBusy] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [importing, setImporting] = useState(false);
  const [modal, setModal] = useState(null);   // { type: 'preview'|'simulate'|'cards', data }
  const [modalBusy, setModalBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState(null);     // formulaire d'édition
  const [saving, setSaving] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  const load = () => apiFetch(`/api/v2/bingo/admin/editions/${editionId}`).then((j) => setData(j.data)).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [editionId]);

  const parsed = useMemo(() => parseBulkMatches(bulkText), [bulkText]);

  // Événements affichés = source de vérité ; on joint le match pour le coup d'envoi.
  const matchById = useMemo(() => Object.fromEntries((data?.matches || []).map((m) => [m.id, m])), [data]);

  async function addRow() {
    if (!row.home.trim() || !row.away.trim()) { showToast('Domicile et extérieur requis'); return; }
    setBusy(true);
    try {
      await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/match-event`, { method: 'POST', body: JSON.stringify(row) });
      setRow({ home: '', away: '', competition: '', kickoffAt: '' }); load();
    } catch (e) { showToast(e.message); }
    setBusy(false);
  }
  async function importBulk() {
    if (!parsed.length) { showToast('Rien à importer'); return; }
    setImporting(true);
    try {
      const j = await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/matches/bulk`, { method: 'POST', body: JSON.stringify({ matches: parsed }) });
      showToast(`${j.data?.created ?? 0} match(s) importé(s)`); setBulkText(''); setBulkOpen(false); load();
    } catch (e) { showToast(e.message); }
    setImporting(false);
  }
  async function delRow(ev) {
    try {
      if (ev.match_id) await apiFetch(`/api/v2/bingo/admin/events/${ev.id}/with-match`, { method: 'DELETE' });
      else await apiFetch(`/api/v2/bingo/admin/events/${ev.id}`, { method: 'DELETE' });
      load();
    } catch (e) { showToast(e.message); }
  }
  async function setResult(ev, answer) {
    const next = ev.official_answer === answer ? null : answer;   // re-cliquer = effacer
    try { await apiFetch(`/api/v2/bingo/admin/events/${ev.id}`, { method: 'PUT', body: JSON.stringify({ officialAnswer: next, validationStatus: next ? 'settled' : 'pending' }) }); load(); }
    catch (e) { showToast(e.message); }
  }

  async function publish() {
    setPublishing(true);
    try { await apiFetch(`/api/v2/bingo/admin/editions/${editionId}`, { method: 'PUT', body: JSON.stringify({ status: 'open' }) }); showToast('Édition publiée'); onChanged?.(); }
    catch (e) { showToast(e.message); }
    setPublishing(false);
  }
  function toggleEdit() {
    if (!editOpen) setEdit({
      title: edition.title || '', badge: edition.badge || '', subtitle: edition.theme?.subtitle || '',
      description: edition.description || '', costCredits: edition.cost_credits ?? 0, rewardPoints: edition.reward_points ?? 0,
      coverUrl: edition.cover_url || '',
    });
    setEditOpen((v) => !v);
  }
  async function pickEditCover(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const url = await uploadImage(file, 'bingo'); setEdit((f) => ({ ...f, coverUrl: url })); showToast('Image ajoutée'); }
    catch (err) { showToast('Upload : ' + err.message); }
  }
  async function saveEdit() {
    if (!edit.title.trim()) { showToast('Titre requis'); return; }
    setSaving(true);
    try {
      await apiFetch(`/api/v2/bingo/admin/editions/${editionId}`, { method: 'PUT', body: JSON.stringify({
        title: edit.title, badge: edit.badge || null, description: edit.description || null,
        costCredits: Number(edit.costCredits) || 0, rewardPoints: Number(edit.rewardPoints) || 0,
        coverUrl: edit.coverUrl || null, theme: { ...(edition.theme || {}), subtitle: edit.subtitle || '' },
      }) });
      showToast('Édition mise à jour'); setEditOpen(false); onChanged?.();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(false);
  }
  async function openModal(type) {
    setModal({ type, data: null }); setModalBusy(true);
    try {
      if (type === 'preview') { const j = await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/preview`); setModal({ type, data: j.data }); }
      if (type === 'simulate') { const j = await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/simulate`, { method: 'POST' }); setModal({ type, data: j.data }); }
      if (type === 'cards') { const j = await apiFetch(`/api/v2/bingo/admin/editions/${editionId}/cards`); setModal({ type, data: j.data?.cards || [] }); }
    } catch (e) { showToast(e.message); setModal(null); }
    setModalBusy(false);
  }

  if (!data) return <div className="p-4 border-t border-white/5"><Skeleton className="h-10 w-full" /></div>;
  const needed = NEEDED[format];
  const count = data.events.length;
  const withResults = data.events.filter((e) => e.official_answer).length;
  const fmtKick = (s) => { if (!s) return null; try { return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return null; } };

  return (
    <div className="border-t border-white/5 p-4 bg-black/20 space-y-4">
      {/* Barre d'actions de l'édition */}
      <div className="flex items-center gap-2 flex-wrap">
        {edition.status !== 'open' && (
          <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">
            {publishing ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />} Publier
          </button>
        )}
        <ToolBtn icon={Pencil} onClick={toggleEdit}>Modifier</ToolBtn>
        <ToolBtn icon={Eye} onClick={() => openModal('preview')} disabled={count < needed}>Prévisualiser la grille</ToolBtn>
        <ToolBtn icon={FlaskConical} onClick={() => openModal('simulate')}>Simuler la validation</ToolBtn>
        <ToolBtn icon={Users} onClick={() => openModal('cards')}>Cartes joueurs</ToolBtn>
      </div>

      {/* Panneau d'édition des paramètres */}
      {editOpen && edit && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 grid gap-3 md:grid-cols-2">
          <L label="Titre *"><input className={input} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></L>
          <L label="Sous-titre (carte)"><input className={input} value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} placeholder="Le meilleur de l'Europe" /></L>
          <L label="Badge"><input className={input} value={edit.badge} onChange={(e) => setEdit({ ...edit, badge: e.target.value })} /></L>
          <L label="Description"><input className={input} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></L>
          <L label="Coût (crédits)"><input type="number" min="0" className={input} value={edit.costCredits} onChange={(e) => setEdit({ ...edit, costCredits: e.target.value })} /></L>
          <L label="Récompense (points)"><input type="number" min="0" className={input} value={edit.rewardPoints} onChange={(e) => setEdit({ ...edit, rewardPoints: e.target.value })} /></L>
          <L label="Image de fond (carte)">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-sm text-bone-200 hover:text-emerald-400 cursor-pointer shrink-0">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Choisir
                <input type="file" accept="image/*" className="hidden" onChange={pickEditCover} />
              </label>
              <input className={input} value={edit.coverUrl} onChange={(e) => setEdit({ ...edit, coverUrl: e.target.value })} placeholder="…ou colle une URL" />
            </div>
          </L>
          <div className="md:col-span-2 flex items-center gap-3">
            {edit.coverUrl && <img src={edit.coverUrl} alt="" className="h-14 w-24 rounded-lg object-cover border border-white/10" />}
            <button onClick={saveEdit} disabled={saving} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />} Enregistrer
            </button>
            <button onClick={() => setEditOpen(false)} className="h-10 px-4 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-100">Annuler</button>
          </div>
        </div>
      )}

      {/* En-tête d'état */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="text-xs font-black uppercase tracking-widest text-bone-300">
          Matchs & événements — <span className={count >= needed ? 'text-emerald-400' : 'text-amber-400'}>{count}/{needed} {count >= needed ? '✓ prêt' : '(insuffisant)'}</span>
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-bone-500">
          {withResults > 0 && <span>{withResults}/{count} résultats saisis</span>}
          <button onClick={() => setBulkOpen((v) => !v)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-bold text-emerald-400 hover:bg-emerald-500/20"><ClipboardPaste size={13} /> Import en masse</button>
        </div>
      </div>

      {modal && <BingoModal modal={modal} busy={modalBusy} format={format} onClose={() => setModal(null)} onReload={() => openModal(modal.type)} />}

      {/* Import en masse (collage) */}
      {bulkOpen && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 space-y-2">
          <p className="text-[11px] text-bone-400">
            Colle une ligne par match. Formats acceptés : <code className="text-bone-300">Domicile ; Extérieur ; 1</code>,
            <code className="text-bone-300"> Domicile vs Extérieur</code>, ou un tableau collé depuis Excel/Markdown.
            La <b>3ᵉ colonne (1/N/2)</b> est optionnelle et pré-remplit le résultat officiel.
          </p>
          <textarea
            className="w-full h-40 rounded-xl border border-white/10 bg-ink-900/60 p-3 text-xs font-mono text-bone-100 outline-none focus:border-emerald-400/60"
            placeholder={'Paris FC ; Madrid United ; 1\nLondon City ; Milan Stars ; N\nMunich Eagles ; Lisbon Lions ; 2'}
            value={bulkText} onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-bone-400"><b className={parsed.length ? 'text-emerald-400' : 'text-bone-500'}>{parsed.length}</b> match(s) détecté(s){parsed.filter((p) => p.officialAnswer).length ? ` · ${parsed.filter((p) => p.officialAnswer).length} avec résultat` : ''}</span>
            <button onClick={importBulk} disabled={importing || !parsed.length} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50">
              {importing ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Importer {parsed.length || ''}
            </button>
          </div>
        </div>
      )}

      {/* Liste unifiée */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {data.events.length === 0 && <p className="text-xs text-bone-500 py-2">Aucun match. Ajoute-les ci-dessous ou via l'import en masse.</p>}
        {data.events.map((ev, i) => {
          const m = ev.match_id ? matchById[ev.match_id] : null;
          const kick = fmtKick(m?.kickoff_at);
          return (
            <div key={ev.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <span className="w-5 shrink-0 text-right font-mono text-bone-600">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <span className="text-bone-200 truncate block">{ev.label}</span>
                {kick && <span className="inline-flex items-center gap-1 text-[10px] text-bone-500"><Calendar size={9} /> {kick}</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {['1', 'N', '2'].map((o) => (
                  <button key={o} onClick={() => setResult(ev, o)} title={o === '1' ? 'Victoire domicile' : o === 'N' ? 'Match nul' : 'Victoire extérieur'}
                    className={`h-6 w-6 rounded text-[10px] font-bold ${ev.official_answer === o ? 'bg-emerald-500 text-ink-900' : 'bg-white/5 text-bone-400 hover:bg-white/10'}`}>{o}</button>
                ))}
                <button onClick={() => delRow(ev)} className="text-bone-500 hover:text-red-400 ml-1"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saisie rapide (une ligne = un match + son événement 1/N/2) */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="grid gap-1.5 sm:grid-cols-2">
          <input className={input + ' h-9'} placeholder="Équipe à domicile" value={row.home} onChange={(e) => setRow({ ...row, home: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addRow()} />
          <input className={input + ' h-9'} placeholder="Équipe à l'extérieur" value={row.away} onChange={(e) => setRow({ ...row, away: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addRow()} />
          <input className={input + ' h-9'} placeholder="Compétition (optionnel)" value={row.competition} onChange={(e) => setRow({ ...row, competition: e.target.value })} />
          <input type="datetime-local" className={input + ' h-9'} value={row.kickoffAt} onChange={(e) => setRow({ ...row, kickoffAt: e.target.value })} />
        </div>
        <button onClick={addRow} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Ajouter le match
        </button>
        <p className="mt-2 text-[10px] text-bone-500">Un match crée automatiquement son événement <b>1/N/2</b>. Les boutons 1/N/2 de la liste servent à saisir le <b>résultat officiel</b> (1 = domicile, N = nul, 2 = extérieur).</p>
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={disabled ? 'Complète la grille d\'abord' : ''}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-400/30 disabled:opacity-40 disabled:cursor-not-allowed">
      <Icon size={13} /> {children}
    </button>
  );
}

const FIG_LABELS = {
  LINE_HORIZONTAL: 'Ligne', LINE_VERTICAL: 'Colonne', DIAGONAL: 'Diagonale', FOUR_CORNERS: '4 coins',
  DOUBLE_LINE: 'Double ligne', TRIPLE_LINE: 'Triple ligne', SQUARE_2X2: 'Carré', CROSS: 'Croix', X_SHAPE: 'X', FULL_CARD: 'BINGO',
};
const STATUS_CARD = { draft: 'À compléter', submitted: 'Validée', scored: 'Notée' };

// Modale unique pour prévisualisation / simulation / cartes joueurs.
function BingoModal({ modal, busy, format, onClose, onReload }) {
  const title = { preview: 'Prévisualisation de la grille', simulate: 'Simulation de la validation', cards: 'Cartes des joueurs' }[modal.type];
  const size = NEEDED[format] === 9 ? 3 : NEEDED[format] === 36 ? 6 : 5;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-black text-bone-50">{title}</h3>
          <div className="flex items-center gap-2">
            {modal.type === 'simulate' && <button onClick={onReload} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">↻ Recalculer</button>}
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
          </div>
        </div>

        <div className="mt-4">
          {busy || !modal.data ? (
            <div className="py-12 grid place-items-center"><Loader2 size={22} className="animate-spin text-bone-500" /></div>
          ) : modal.type === 'preview' ? (
            <div>
              <p className="text-xs text-bone-500 mb-3">Exemple de grille générée pour ce format (l'ordre change à chaque carte).</p>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}>
                {modal.data.cells.map((c) => (
                  <div key={c.cell} className={`rounded-lg border p-2 min-h-[64px] text-[9px] leading-tight flex items-center justify-center text-center ${c.free ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400 font-black' : 'border-white/10 bg-white/[0.03] text-bone-300'}`}>
                    {c.free ? 'FREE' : c.label}
                  </div>
                ))}
              </div>
            </div>
          ) : modal.type === 'simulate' ? (
            <div>
              <div className="flex gap-4 text-xs text-bone-400 mb-3">
                <span><b className="text-bone-100">{modal.data.withResult}</b>/{modal.data.events} résultats saisis</span>
                <span><b className="text-bone-100">{modal.data.cards}</b> carte(s)</span>
              </div>
              {modal.data.withResult < modal.data.events && <p className="mb-3 text-[11px] text-amber-400">⚠ Tous les résultats ne sont pas encore saisis : les scores simulés sont partiels.</p>}
              {modal.data.results.length === 0 ? <p className="text-sm text-bone-500 py-6 text-center">Aucune carte validée à simuler.</p> : (
                <div className="space-y-1.5">
                  {modal.data.results.map((r, i) => (
                    <div key={r.cardId} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <span className="w-6 text-center font-display font-black text-bone-500">{i + 1}</span>
                      <span className="flex-1 min-w-0 truncate text-sm text-bone-200">{r.player}</span>
                      <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[55%]">
                        {r.figures.map((f) => <span key={f} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-bone-400">{FIG_LABELS[f] || f}</span>)}
                      </div>
                      <span className="font-display text-base font-black text-emerald-400 tabular-nums shrink-0">{r.points} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[10px] text-bone-500">Simulation à blanc : aucune donnée n'est écrite. Utilise « Clôturer » pour valider définitivement.</p>
            </div>
          ) : (
            <div>
              {modal.data.length === 0 ? <p className="text-sm text-bone-500 py-6 text-center">Aucune carte pour cette édition.</p> : (
                <div className="space-y-1.5">
                  {modal.data.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-white/10 overflow-hidden grid place-items-center">
                        {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-[11px] font-black text-bone-400">{(c.player || '?').charAt(0).toUpperCase()}</span>}
                      </div>
                      <span className="flex-1 min-w-0 truncate text-sm text-bone-200">{c.player}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold text-bone-400">{STATUS_CARD[c.status] || c.status}</span>
                      {c.status === 'scored' && <span className="font-display text-base font-black text-emerald-400 tabular-nums shrink-0">{c.points_total} pts</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function L({ label, children }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{label}</span><div className="mt-1">{children}</div></label>;
}
