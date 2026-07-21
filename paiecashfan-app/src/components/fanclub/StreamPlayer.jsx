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

// Lecteur du live officiel : iframe YouTube/Twitch quand le club diffuse,
// sinon un état neutre « pas de live ».
export function StreamPlayer({ isLive, provider, id }) {
  const src = isLive ? embedSrc(provider, id) : null;

  if (!src) {
    return (
      <div className="grid aspect-video place-items-center bg-ink-950 text-sm text-bone-500">
        <div className="text-center">
          <Video size={30} className="mx-auto mb-2 text-bone-700" />
          Aucun live en cours pour le moment.
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black">
      <iframe
        src={src}
        title="Live officiel du club"
        className="h-full w-full"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}
