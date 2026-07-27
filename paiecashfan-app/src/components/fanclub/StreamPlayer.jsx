import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Video } from 'lucide-react';

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
// natif Safari (qui lit le HLS sans lib).
function HlsVideo({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return undefined;
    // Safari / iOS : HLS natif.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return undefined;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    return undefined;
  }, [src]);

  return <video ref={ref} controls playsInline className="h-full w-full bg-black lg:aspect-auto lg:h-full" />;
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
