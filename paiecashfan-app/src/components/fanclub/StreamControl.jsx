import { useEffect, useState } from 'react';
import {
  Radio, Loader2, Check, Copy, RefreshCw, Eye, EyeOff, Link as LinkIcon, Tv, CalendarClock,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';

// Contrôle BO du live vidéo du club, refondu façon « Espace Club » :
//   · segmented control PaieCashFan Live (natif OBS) / Lien externe ;
//   · accès OBS : Serveur + Clé de stream (monospace, Afficher/Copier/Régénérer) ;
//   · guide OBS en 3 étapes ; go-live en 1 clic.
// Mêmes endpoints backend que la version précédente (/stream, /broadcast).
export function StreamControl({ slug }) {
  const [mode, setMode] = useState('byteplus');   // 'byteplus' | 'external'
  const [nativeOk, setNativeOk] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('idle');    // idle | saving
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [bc, setBc] = useState(null);              // { server, streamKey, expire, playUrl }
  const [bcLoading, setBcLoading] = useState(false);

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
      setNativeOk(false); setMode('external');
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
    } catch (e) { setError(e?.message || 'Impossible.'); }
    setStatus('idle');
  }

  async function saveExternal(next = isLive) {
    setError(''); setStatus('saving');
    try {
      const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`, {
        method: 'PATCH', body: JSON.stringify({ url: url.trim(), isLive: next }),
      });
      setIsLive(!!j.data?.isLive);
    } catch (e) { setError(e?.message || 'Enregistrement impossible.'); }
    setStatus('idle');
  }

  const keyExpiry = bc?.expire ? new Date(bc.expire * 1000) : null;
  const busy = status === 'saving';

  return (
    <div className="space-y-5">
      {/* Statut live */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          value={mode}
          onChange={(m) => { setMode(m); setError(''); }}
          options={[
            { value: 'byteplus', label: 'PaieCashFan Live', icon: Tv, disabled: !nativeOk },
            { value: 'external', label: 'Lien externe', icon: LinkIcon },
          ]}
        />
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> En direct
          </span>
        )}
      </div>

      {/* ─── Mode natif ─── */}
      {mode === 'byteplus' && (
        <div className="space-y-4">
          <p className="text-sm text-bone-500">
            Diffuse avec <b className="text-bone-300">OBS</b> (gratuit). Copie ces 2 champs dans OBS
            (<i>Paramètres → Stream → Service « Personnalisé »</i>), lance ta scène, puis passe en direct.
          </p>

          {bcLoading && <div className="flex items-center gap-2 text-sm text-bone-500"><Loader2 size={14} className="animate-spin" /> Génération de tes accès…</div>}

          {!bcLoading && bc && (
            <>
              <CopyField label="Serveur (OBS)" value={bc.server} />
              <CopyField label="Clé de stream (OBS)" value={bc.streamKey} secret onRegenerate={loadBroadcast} />
              {keyExpiry && (
                <p className="text-[11px] text-bone-600">
                  Clé valable jusqu'au {keyExpiry.toLocaleString('fr-FR')}. « Régénérer » invalide l'ancienne.
                </p>
              )}

              {/* Guide OBS 3 étapes */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-bone-400">Comment diffuser (3 étapes)</p>
                <ol className="space-y-2.5">
                  <Step n={1}>Installe <b className="text-bone-200">OBS Studio</b> (obsproject.com, gratuit) → <b className="text-bone-200">Paramètres → Stream</b> → Service « Personnalisé ».</Step>
                  <Step n={2}>Colle le <b className="text-bone-200">Serveur</b> et la <b className="text-bone-200">Clé de stream</b> ci-dessus, ajoute ta caméra/scène, puis <b className="text-bone-200">Démarrer le streaming</b>.</Step>
                  <Step n={3}>Reviens ici et clique <b className="text-bone-200">« Passer en direct »</b> : le live s'affiche sur ton Fan Club.</Step>
                </ol>
              </div>
            </>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <GoLiveButton isLive={isLive} busy={busy} disabled={!bc} onClick={() => goLiveNative(!isLive)} />
        </div>
      )}

      {/* ─── Mode externe ─── */}
      {mode === 'external' && (
        <div className="space-y-4">
          <p className="text-sm text-bone-500">
            Colle un lien <b className="text-bone-300">YouTube Live</b>, <b className="text-bone-300">Twitch</b>, ou un flux <b className="text-bone-300">HLS (.m3u8)</b>, puis passe en direct.
          </p>
          <div>
            <label className={LABEL}>Lien du live</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube / Twitch, ou un lien .m3u8 (HLS)"
              className="mt-1.5 h-[46px] w-full rounded-[10px] border border-white/10 bg-ink-950/50 px-3.5 text-sm text-bone-100 outline-none focus:border-emerald-400/60 placeholder:text-bone-600" />
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => saveExternal()} disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50 disabled:opacity-60">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Enregistrer le lien
            </button>
            <GoLiveButton isLive={isLive} busy={busy} disabled={!url.trim()} onClick={() => saveExternal(!isLive)} />
          </div>
        </div>
      )}

      {/* Programmation (informatif) */}
      <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-white/12 bg-white/[0.01] p-3.5 text-xs text-bone-500">
        <CalendarClock size={15} className="mt-0.5 shrink-0 text-bone-600" />
        <span><b className="text-bone-300">Programmation</b> — le passage en direct est manuel pour l'instant (tu cliques « Passer en direct » au moment voulu). La planification d'un créneau arrivera dans une prochaine version.</span>
      </div>
    </div>
  );
}

const LABEL = 'block text-[11px] font-bold uppercase tracking-[0.10em] text-bone-500';

function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-ink-950/60 p-1">
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} disabled={o.disabled}
            className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wider transition disabled:opacity-40',
              active ? 'bg-emerald-400 text-ink-900' : 'text-bone-300 hover:text-bone-50')}>
            {Icon && <Icon size={13} />} {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CopyField({ label, value, secret, onRegenerate }) {
  const [shown, setShown] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const masked = (() => {
    if (!secret || shown) return value;
    const [head] = String(value).split('?');
    return `${head}?••••••••••••`;
  })();

  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }
  function regenerate() {
    if (window.confirm('Régénérer la clé ? L\'ancienne clé cessera de fonctionner (il faudra la remettre dans OBS).')) onRegenerate();
  }

  const iconBtn = 'grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg border border-white/12 bg-white/[0.03] text-bone-300 transition hover:text-bone-50';

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="mt-1.5 flex items-stretch gap-2">
        <input readOnly value={masked}
          className="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-ink-950/50 px-3.5 font-mono text-xs text-bone-200 outline-none" />
        {secret && (
          <button type="button" onClick={() => setShown((s) => !s)} title={shown ? 'Masquer' : 'Afficher'} className={iconBtn}>
            {shown ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        <button type="button" onClick={copy} title="Copier" className={cn(iconBtn, copied && 'border-emerald-400/40 text-emerald-400')}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
        {onRegenerate && (
          <button type="button" onClick={regenerate} title="Régénérer" className={iconBtn}>
            <RefreshCw size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3 text-sm text-bone-400">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-[11px] font-black text-emerald-400">{n}</span>
      <span>{children}</span>
    </li>
  );
}

function GoLiveButton({ isLive, busy, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={busy || disabled}
      className={cn('inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wider transition disabled:opacity-50',
        isLive ? 'border border-white/12 bg-white/[0.04] text-bone-200 hover:bg-white/10' : 'bg-emerald-400 text-ink-900 hover:bg-emerald-300')}>
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Radio size={13} />} {isLive ? 'Arrêter le live' : 'Passer en direct'}
    </button>
  );
}
