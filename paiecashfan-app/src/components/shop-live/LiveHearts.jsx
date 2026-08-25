import { useEffect, useRef, useState } from 'react';

const HEART_EMOJIS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🔥'];
const MAX_BURST = 6; // cœurs max générés par tick (anti-flood si gros écart)

// Overlay de cœurs flottants (façon Whatnot) posé sur la vidéo. Fait monter
// des cœurs à chaque incrément de `likeCount` (le sien comme celui des autres
// viewers, détecté au polling). N'affiche rien d'autre : pointer-events none.
export function LiveHearts({ likeCount = 0, seed = 0 }) {
  const [hearts, setHearts] = useState([]);
  const prevRef = useRef(likeCount);
  const idRef = useRef(0);

  useEffect(() => {
    const delta = likeCount - prevRef.current;
    prevRef.current = likeCount;
    if (delta <= 0) return;

    const n = Math.min(delta, MAX_BURST);
    const batch = Array.from({ length: n }, () => {
      const id = idRef.current++;
      const emoji = HEART_EMOJIS[(id + seed) % HEART_EMOJIS.length];
      const left = 8 + Math.abs(Math.sin(id * 12.9898 + seed) * 10000) % 78; // 8–86%
      const drift = ((id % 5) - 2) * 14; // -28..28px
      const dur = 2.2 + (id % 4) * 0.35; // 2.2–3.25s
      return { id, emoji, left, drift, dur };
    });
    setHearts((prev) => [...prev, ...batch].slice(-40));

    // Nettoyage après la fin de l'animation la plus longue.
    const t = window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !batch.some((b) => b.id === h.id)));
    }, 3600);
    return () => window.clearTimeout(t);
  }, [likeCount, seed]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="pcf-heart text-2xl"
          style={{ left: `${h.left}%`, '--pcf-heart-x': `${h.drift}px`, '--pcf-heart-dur': `${h.dur}s` }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
