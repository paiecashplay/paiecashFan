import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Eye, EyeOff, RadioTower, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Panneau de diffusion OBS du Live Boutique (MediaLive) — BO uniquement.
// Les accès (Serveur + clé signée) sont GÉNÉRÉS côté serveur (comme le Fan Club) :
// aucune saisie, aucune console. La clé signée est secrète, jamais exposée aux fans.
export default function ShopLiveObs({ liveId }) {
  const [data, setData] = useState(null); // { server, streamKey, expire, playUrl }
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function load() {
    setLoading(true); setErr('');
    apiFetch(`/api/v2/shop-live/${liveId}/broadcast`)
      .then((j) => setData(j.data))
      .catch((e) => setErr(e.message || 'Diffusion indisponible.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { if (liveId) load(); }, [liveId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function copy(text, which) {
    try { await navigator.clipboard.writeText(text || ''); setCopied(which); setTimeout(() => setCopied(''), 1500); } catch { /* noop */ }
  }

  const expireDate = data?.expire
    ? new Date(data.expire * 1000).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400"><RadioTower size={18} /></span>
          <div>
            <h3 className="font-display text-base font-bold text-bone-50">Diffusion OBS</h3>
            <p className="text-xs leading-5 text-bone-400">Diffuse avec OBS (gratuit). Copie ces 2 champs dans OBS (Paramètres → Stream → Service « Personnalisé »), lance ta scène, puis passe en direct.</p>
          </div>
        </div>
        <button type="button" onClick={load} disabled={loading} title="Régénérer la clé" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-bone-300 transition hover:bg-white/5 disabled:opacity-50">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        </button>
      </div>

      {err ? (
        <p className="mt-4 text-sm text-amber-400">{err}</p>
      ) : !data ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-bone-500"><Loader2 size={15} className="animate-spin" /> Chargement des accès…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {/* Serveur */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-bone-500">Serveur (OBS)</label>
            <div className="flex gap-2">
              <input readOnly value={data.server || ''} className="h-11 flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-3 font-mono text-sm text-bone-100 outline-none" />
              <button type="button" onClick={() => copy(data.server, 'server')} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-bone-300 transition hover:bg-white/5">
                {copied === 'server' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Clé de stream (signée) */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-bone-500">Clé de stream (OBS)</label>
            <div className="flex gap-2">
              <input readOnly type={reveal ? 'text' : 'password'} value={data.streamKey || ''} className="h-11 flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-3 font-mono text-sm text-bone-100 outline-none" />
              <button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? 'Masquer' : 'Afficher'} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-bone-300 transition hover:bg-white/5">
                {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button type="button" onClick={() => copy(data.streamKey, 'key')} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-bone-300 transition hover:bg-white/5">
                {copied === 'key' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            {expireDate && <p className="mt-1 text-[11px] text-bone-600">Clé valable jusqu'au {expireDate}. « Régénérer » invalide l'ancienne.</p>}
          </div>

          <div className="mt-1 space-y-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3.5 text-[11px] leading-5 text-bone-400">
            <div>
              <p className="font-bold text-emerald-300">▶️ Démarrer la diffusion</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>Dans <b className="text-bone-100">OBS</b> → Paramètres → Stream → Service « Personnalisé » → colle le <b className="text-bone-100">Serveur</b> et la <b className="text-bone-100">Clé</b> ci-dessus.</li>
                <li>Ajoute ta source (caméra / image / scène), puis clique <b className="text-bone-100">« Démarrer le streaming »</b> dans OBS.</li>
                <li>Reviens ici et clique <b className="text-bone-100">« Démarrer le live »</b> → le direct s'affiche chez les supporters.</li>
              </ol>
            </div>
            <div>
              <p className="font-bold text-red-300">⏹️ Arrêter la diffusion</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>Clique <b className="text-bone-100">« Terminer le live »</b> ici (bouton orange, section « Actions du live »).</li>
                <li>Clique <b className="text-bone-100">« Arrêter le streaming »</b> dans OBS.</li>
              </ol>
            </div>
            <div className="border-t border-white/10 pt-2 text-bone-500">
              <p>⚠️ <b className="text-amber-200">Ne regarde pas le live sur cette machine</b> (écho + décalage) — utilise un casque ou un autre appareil.</p>
              <p className="mt-1">🔑 <b className="text-amber-200">À chaque nouveau live, la clé change</b> : recopie-la dans OBS. Pour un même live, elle reste valable ~7 jours.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
