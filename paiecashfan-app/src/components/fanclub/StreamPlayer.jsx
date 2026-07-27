import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Video, VolumeX } from 'lucide-react';

// Reconstruit l'URL d'embed SÛRE à partir de { provider, id } validés côté
// serveur (whitelist YouTube/Twitch). Twitch exige `parent` = le domaine courant.
function embedSrc(provider, id) {
  if (!provider || !id) return null;
  if (provider === 'youtube') return `https://www.youtube.com/embed/${id}?rel=0`;
  if (provider === 'youtube_channel') return `https://www.youtube.com/embed/live_stream?channel=${id}`;
  if (provider === 'twitch') {
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'paiecashfan.com';
    return `https://player.twitch.tv/?channel=${id}&parent=${parent}&autoplay=false`;
  }
  return null;
}

// Lecteur HLS (flux .m3u8 — BytePlus Live ou autre) via hls.js, avec repli
// natif Safari. Démarre en autoplay MUTÉ (seul autoplay autorisé par les
// navigateurs) + bouton « Activer le son ». Auto-résilient : si le flux n'est
// pas encore poussé (404) ou se coupe, on affiche « En attente du direct… » et
// on réessaie tout seul → dès qu'OBS/BytePlus émet, la lecture démarre sans
// rechargement de la page.
function HlsVideo({ src }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return undefined;

    let hls;
    let retry;
    const RETRY_MS = 4000;

    const onPlaying = () => setWaiting(false);
    const onWaiting = () => setWaiting(true);
    const onVolume = () => setMuted(video.muted);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('volumechange', onVolume);

    // Safari / iOS : HLS natif (pas de lib).
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const start = () => { video.src = src; video.play().catch(() => {}); };
      const onError = () => { setWaiting(true); retry = window.setTimeout(start, RETRY_MS); };
      video.addEventListener('error', onError);
      start();
      return () => {
        if (retry) window.clearTimeout(retry);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('volumechange', onVolume);
        video.removeEventListener('error', onError);
      };
    }

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, enableWorker: true, liveDurationInfinity: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        setWaiting(true);
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          // NETWORK_ERROR (flux pas encore là / coupé) ou autre : on réessaie.
          retry = window.setTimeout(() => { hls.loadSource(src); hls.startLoad(); }, RETRY_MS);
        }
      });
      return () => {
        if (retry) window.clearTimeout(retry);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('volumechange', onVolume);
        hls.destroy();
      };
    }

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('volumechange', onVolume);
    };
  }, [src]);

  const unmute = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    video.play().catch(() => {});
    setMuted(false);
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        autoPlay
        muted
        playsInline
        controls
        className="h-full w-full bg-black lg:aspect-auto lg:h-full"
      />

      {waiting && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 text-sm text-bone-300">
          <div className="text-center">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-bone-500 border-t-transparent" />
            En attente du direct…
          </div>
        </div>
      )}

      {!waiting && muted && (
        <button
          onClick={unmute}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur hover:bg-black/90"
        >
          <VolumeX size={14} /> Activer le son
        </button>
      )}
    </div>
  );
}

// Lecteur du live officiel : iframe YouTube/Twitch, lecteur HLS (BytePlus…),
// ou état neutre « pas de live ».
export function StreamPlayer({ isLive, provider, id, url }) {
  const iframeSrc = isLive ? embedSrc(provider, id) : null;
  const hlsSrc = isLive && provider === 'hls' ? url : null;

  if (!isLive || (!iframeSrc && !hlsSrc)) {
    return (
      <div className="grid aspect-video place-items-center bg-ink-950 text-sm text-bone-500 lg:aspect-auto lg:h-full">
        <div className="text-center">
          <Video size={30} className="mx-auto mb-2 text-bone-700" />
          Aucun live en cours pour le moment.
        </div>
      </div>
    );
  }

  if (hlsSrc) {
    return (
      <div className="aspect-video bg-black lg:aspect-auto lg:h-full">
        <HlsVideo src={hlsSrc} />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black lg:aspect-auto lg:h-full">
      <iframe
        src={iframeSrc}
        title="Live officiel du club"
        className="h-full w-full"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}
