import { useEffect, useState } from 'react';
import { Video, Loader2, Check, Radio, Copy, RefreshCw, Link as LinkIcon, Tv } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Contrôle BO du live vidéo du club, 2 modes :
//   · « PaieCashFan Live » (natif BytePlus) : le club reçoit ses accès OBS
//     (Serveur + Clé signée) tout prêts + un bouton « Passer en direct ».
//   · « Lien externe » : coller un lien YouTube / Twitch / flux HLS (.m3u8).
export function StreamControl({ slug }) {
  const [mode, setMode] = useState('byteplus');   // 'byteplus' | 'external'
  const [nativeOk, setNativeOk] = useState(true);  // le mode natif est-il dispo côté serveur ?

  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('idle');    // idle | saving | saved
  const [error, setError] = useState('');

  const [url, setUrl] = useState('');              // mode externe
  const [bc, setBc] = useState(null);              // mode natif : { server, streamKey, expire, playUrl }
  const [bcLoading, setBcLoading] = useState(false);
  const [copied, setCopied] = useState('');

  // État initial : mode courant + live on/off.
  useEffect(() => {
    if (!slug) return;
    apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`)
      .then((j) => {
        const d = j.data || {};
        setUrl(d.url || '');
        setIsLive(!!d.isLive);
        setMode(d.mode === 'external' ? 'external' : 'byteplus');
      })
      .catch(() => {});
  }, [slug]);

  // Charge les accès OBS quand on passe en mode natif.
  useEffect(() => {
    if (!slug || mode !== 'byteplus') return;
    loadBroadcast();
  }, [slug, mode]); // eslint-disable-line

  async function loadBroadcast() {
    setBcLoading(true); setError('');
    try {
      const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/broadcast`);
      setBc(j.data); setNativeOk(true);
      if (typeof j.data?.isLive === 'boolean') setIsLive(j.data.isLive);
    } catch {
      setNativeOk(false); setMode('external'); // serveur non configuré → repli externe
    }
    setBcLoading(false);
  }

  async function goLiveNative(next) {
    setError(''); setStatus('saving');
    try {
      const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/broadcast`, {
        method: 'POST', body: JSON.stringify({ isLive: next }),
      });
      setIsLive(!!j.data?.isLive);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 1500);
    } catch (e) { setError(e?.message || 'Impossible.'); setStatus('idle'); }
  }

  async function saveExternal(next = isLive) {
    setError(''); setStatus('saving');
    try {
      const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`, {
        method: 'PATCH', body: JSON.stringify({ url: url.trim(), isLive: next }),
      });
      setIsLive(!!j.data?.isLive);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 1500);
    } catch (e) { setError(e?.message || 'Enregistrement impossible.'); setStatus('idle'); }
  }

  async function copy(text, tag) {
    try { await navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(''), 1500); } catch { /* noop */ }
  }

  const keyExpiry = bc?.expire ? new Date(bc.expire * 1000) : null;

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

      {/* Sélecteur de mode */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-ink-900/60 p-1">
        {[['byteplus', 'PaieCashFan Live', Tv], ['external', 'Lien externe', LinkIcon]].map(([m, label, Icon]) => (
          <button key={m} onClick={() => { setMode(m); setError(''); }}
            disabled={m === 'byteplus' && !nativeOk}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider transition disabled:opacity-40 ${
              mode === m ? 'bg-emerald-400 text-ink-900' : 'text-bone-300 hover:text-bone-50'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ─── Mode natif « PaieCashFan Live » ─── */}
      {mode === 'byteplus' && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-bone-400">
            Diffuse avec <b className="text-bone-200">OBS</b> (gratuit). Copie ces 2 champs dans OBS
            (<i>Paramètres → Stream → Service « Personnalisé »</i>), lance ta scène, puis clique « Passer en direct ».
          </p>

          {bcLoading && <div className="flex items-center gap-2 text-sm text-bone-400"><Loader2 size={14} className="animate-spin" /> Génération de tes accès…</div>}

          {!bcLoading && bc && (
            <>
              <CopyRow label="Serveur (OBS)" value={bc.server} tag="server" copied={copied} onCopy={copy} />
              <CopyRow label="Clé de stream (OBS)" value={bc.streamKey} tag="key" copied={copied} onCopy={copy} mono />
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-bone-500">
                <span>{keyExpiry ? `Clé valable jusqu'au ${keyExpiry.toLocaleString('fr-FR')}.` : ''}</span>
                <button onClick={loadBroadcast} className="inline-flex items-center gap-1.5 text-bone-400 hover:text-emerald-400 transition-colors">
                  <RefreshCw size={12} /> Régénérer la clé
                </button>
              </div>

              <details className="rounded-xl border border-white/10 bg-ink-900/40 p-3 text-xs text-bone-400">
                <summary className="cursor-pointer font-bold text-bone-200">Comment diffuser avec OBS ?</summary>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Installe <b>OBS Studio</b> (obsproject.com, gratuit).</li>
                  <li>OBS → <b>Paramètres → Stream</b> → Service = <b>Personnalisé</b>.</li>
                  <li>Colle le <b>Serveur</b> et la <b>Clé de stream</b> ci-dessus.</li>
                  <li>Ajoute ta caméra/scène → <b>Démarrer le streaming</b>.</li>
                  <li>Reviens ici et clique <b>« Passer en direct »</b>.</li>
                </ol>
              </details>
            </>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button onClick={() => goLiveNative(!isLive)} disabled={status === 'saving' || !bc}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider transition disabled:opacity-60 ${
              isLive ? 'bg-white/[0.06] text-bone-200 hover:bg-white/10' : 'bg-emerald-400 text-ink-900 hover:bg-emerald-300'}`}>
            {status === 'saving' ? <Loader2 size={13} className="animate-spin" /> : <Radio size={13} />}
            {isLive ? 'Arrêter le live' : 'Passer en direct'}
          </button>
        </div>
      )}

      {/* ─── Mode externe (YouTube / Twitch / HLS) ─── */}
      {mode === 'external' && (
        <div className="mt-4">
          <p className="text-xs text-bone-400">
            Colle un lien <b className="text-bone-200">YouTube Live</b>, <b className="text-bone-200">Twitch</b>, ou un flux <b className="text-bone-200">HLS (.m3u8)</b>, puis active « En direct ».
          </p>

          <label className="mt-3 block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">Lien du live</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube / Twitch, ou un lien .m3u8 (HLS)"
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
          </label>

          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => saveExternal()} disabled={status === 'saving'}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-60">
              {status === 'saving' ? <Loader2 size={13} className="animate-spin" /> : status === 'saved' ? <Check size={13} /> : null}
              Enregistrer le lien
            </button>
            <button onClick={() => saveExternal(!isLive)} disabled={status === 'saving' || !url.trim()}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider transition disabled:opacity-60 ${
                isLive ? 'bg-white/[0.06] text-bone-200 hover:bg-white/10' : 'bg-emerald-400 text-ink-900 hover:bg-emerald-300'}`}>
              <Radio size={13} /> {isLive ? 'Arrêter le live' : 'Passer en direct'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Champ en lecture seule avec bouton copier.
function CopyRow({ label, value, tag, copied, onCopy, mono }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">{label}</span>
      <div className="mt-1 flex items-stretch gap-2">
        <input readOnly value={value}
          className={`min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none ${mono ? 'font-mono text-xs' : ''}`} />
        <button onClick={() => onCopy(value, tag)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50">
          {copied === tag ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied === tag ? 'Copié' : 'Copier'}
        </button>
      </div>
    </div>
  );
}
