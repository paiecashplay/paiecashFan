import { useEffect, useState } from 'react';
import { Gift, Plus, Trophy, Trash2, Loader2, Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

const STATUS_STYLE = {
  active:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  drawn:     'text-gold-400   bg-gold-400/10    border-gold-400/20',
  closed:    'text-bone-400   bg-white/5        border-white/10',
  cancelled: 'text-rose-400   bg-rose-500/10    border-rose-500/20',
  draft:     'text-sky-400    bg-sky-500/10     border-sky-500/20',
};
const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (s) => { try { return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; } };

const BLANK = { title: '', prizeLabel: '', description: '', ticketPricePcc: '', ticketsTotal: '', endsAt: '', imageUrl: '' };

export function AdminTombola() {
  const [campaigns, setCampaigns] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(BLANK);
  const [creating, setCreating] = useState(false);
  const [acting, setActing] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const load = () => apiFetch('/api/v2/tombola').then((j) => setCampaigns(j.data?.campaigns || [])).catch(() => setCampaigns([]));
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.title.trim() || !form.endsAt) { showToast('Titre et date de fin requis'); return; }
    setCreating(true);
    try {
      await apiFetch('/api/v2/tombola', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          prizeLabel: form.prizeLabel.trim() || null,
          description: form.description.trim() || null,
          ticketPricePcc: Number(form.ticketPricePcc) || 0,
          ticketsTotal: form.ticketsTotal === '' ? null : Number(form.ticketsTotal),
          endsAt: new Date(form.endsAt).toISOString(),
          imageUrl: form.imageUrl.trim() || null,
        }),
      });
      setForm(BLANK);
      showToast('Tombola créée');
      load();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setCreating(false);
  }

  async function draw(id) {
    if (!confirm('Tirer le gagnant maintenant ?')) return;
    setActing(id);
    try {
      const j = await apiFetch(`/api/v2/tombola/${id}/draw`, { method: 'POST' });
      showToast(j.data?.drawn ? 'Gagnant tiré !' : `Pas de tirage (${j.data?.reason || '—'})`);
      load();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setActing(null);
  }

  async function remove(id) {
    if (!confirm('Supprimer cette tombola ? (les tickets seront supprimés)')) return;
    setActing(id);
    try { await apiFetch(`/api/v2/tombola/${id}`, { method: 'DELETE' }); showToast('Supprimée'); load(); }
    catch (e) { showToast('Erreur : ' + e.message); }
    setActing(null);
  }

  const input = 'w-full h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60';

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Tombolas</h1>
        <p className="text-sm text-bone-400 mt-1">Crée et gère les tombolas plateforme (tirage auto à la date de fin).</p>
      </div>

      {/* Création */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
        <h2 className="flex items-center gap-2 font-display font-black text-bone-100 text-sm uppercase tracking-widest"><Plus size={15} /> Nouvelle tombola</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <L label="Titre *"><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tombola de la saison" /></L>
          <L label="Lot"><input className={input} value={form.prizeLabel} onChange={(e) => setForm({ ...form, prizeLabel: e.target.value })} placeholder="Maillot signé + 500 PCC" /></L>
          <L label="Prix du ticket (PCC)"><input type="number" min="0" className={input} value={form.ticketPricePcc} onChange={(e) => setForm({ ...form, ticketPricePcc: e.target.value })} /></L>
          <L label="Nb de tickets max (vide = illimité)"><input type="number" min="1" className={input} value={form.ticketsTotal} onChange={(e) => setForm({ ...form, ticketsTotal: e.target.value })} /></L>
          <L label="Date de fin *"><input type="datetime-local" className={input} value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></L>
          <L label="Image (URL)"><input className={input} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" /></L>
          <div className="md:col-span-2">
            <L label="Description"><textarea rows={2} className={input.replace('h-10', 'py-2 min-h-[2.5rem]')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></L>
          </div>
        </div>
        <button onClick={create} disabled={creating} className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition disabled:opacity-50">
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Créer la tombola
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {campaigns === null ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-10 text-center">
            <Gift className="mx-auto text-bone-600" size={34} />
            <p className="mt-3 text-sm text-bone-400">Aucune tombola pour le moment.</p>
          </div>
        ) : campaigns.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 bg-ink-800/40 p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-black text-bone-50 truncate">{c.prizeLabel || c.title}</p>
                <span className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLE[c.status] || ''}`}>{c.status}</span>
                {c.clubName && <span className="text-[10px] text-bone-500">· {c.clubName}</span>}
              </div>
              <p className="mt-1 text-xs text-bone-500">
                {fmt(c.ticketPricePcc)} PCC/ticket · {c.ticketsSold} vendu(s){c.ticketsTotal ? `/${c.ticketsTotal}` : ''} · fin {fmtDate(c.endsAt)}
                {c.status === 'drawn' && c.winnerName ? ` · 🏆 ${c.winnerName}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {c.status === 'active' && (
                <button onClick={() => draw(c.id)} disabled={acting === c.id} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gold-400/30 bg-gold-400/10 text-xs font-bold text-gold-400 hover:bg-gold-400/20 transition disabled:opacity-50">
                  {acting === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trophy size={13} />} Tirer
                </button>
              )}
              <button onClick={() => remove(c.id)} disabled={acting === c.id} className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-bone-100 shadow-xl">{toast}</div>
      )}
    </div>
  );
}

function L({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
