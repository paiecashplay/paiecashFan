import { useEffect, useState } from 'react';
import { Video, Loader2, Check, Radio } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Contrôle BO : régler le live vidéo du club (lien YouTube/Twitch + on/off).
// Utilisé dans le BO club et le BO super admin.
export function StreamControl({ slug }) {
  const [url, setUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`)
      .then((j) => { setUrl(j.data?.url || ''); setIsLive(!!j.data?.isLive); })
      .catch(() => {});
  }, [slug]);

  async function save(nextLive = isLive) {
    setError(''); setStatus('saving');
    try {
      const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`, {
        method: 'PATCH', body: JSON.stringify({ url: url.trim(), isLive: nextLive }),
      });
      setIsLive(!!j.data?.isLive);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (e) {
      setError(e?.message || 'Enregistrement impossible.');
      setStatus('idle');
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-5">
      <div className="flex items-center gap-2">
        <Video size={18} className="text-emerald-400" />
        <h3 className="font-display text-lg font-black text-bone-50">Live vidéo du Fan Club</h3>
        {isLive && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" /> En direct
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs text-bone-400">
        Colle un lien <b className="text-bone-200">YouTube Live</b>, <b className="text-bone-200">Twitch</b>, ou un flux <b className="text-bone-200">HLS (.m3u8)</b> (ex. BytePlus Live), puis active « En direct » quand tu diffuses.
      </p>

      <label className="mt-4 block">
        <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">Lien du live</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube / Twitch, ou un lien .m3u8 (HLS)"
          className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50"
        />
      </label>

      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => save()}
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-60"
        >
          {status === 'saving' ? <Loader2 size={13} className="animate-spin" /> : status === 'saved' ? <Check size={13} /> : null}
          Enregistrer le lien
        </button>

        <button
          onClick={() => save(!isLive)}
          disabled={status === 'saving' || !url.trim()}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider transition disabled:opacity-60 ${
            isLive ? 'bg-white/[0.06] text-bone-200 hover:bg-white/10' : 'bg-emerald-400 text-ink-900 hover:bg-emerald-300'
          }`}
        >
          <Radio size={13} /> {isLive ? 'Arrêter le live' : 'Passer en direct'}
        </button>
      </div>
    </div>
  );
}
