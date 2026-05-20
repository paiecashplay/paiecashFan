import { useRef, useEffect, useState } from 'react';
import { fetchSquadImages } from '../playerImages';

export default function SquadSpotlight({ theme }) {
  const scrollRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [playerImages, setPlayerImages] = useState({});
  const [imgErrors, setImgErrors] = useState({});

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch real player images from TheSportsDB
  useEffect(() => {
    if (!theme?.squad) return;
    let cancelled = false;

    fetchSquadImages(theme.squad).then(images => {
      if (!cancelled) setPlayerImages(images);
    });

    return () => { cancelled = true; };
  }, [theme?.id]);

  if (!theme || !theme.squad) return null;

  const handleImgError = (url) => {
    setImgErrors(prev => ({ ...prev, [url]: true }));
  };

  // Get the best image for a player - prefer cutout, fallback to thumb, then direct URL (skip blocked domains), then emoji
  const getPlayerImg = (player) => {
    const apiImages = playerImages[player.name];
    if (apiImages?.cutout && !imgErrors[apiImages.cutout]) return { src: apiImages.cutout, type: 'cutout' };
    if (apiImages?.thumb && !imgErrors[apiImages.thumb]) return { src: apiImages.thumb, type: 'thumb' };
    // Only use hardcoded image if it's NOT from a blocked domain
    if (player.image && !imgErrors[player.image] && !player.image.includes('transfermarkt.technology')) {
      return { src: player.image, type: player.image.includes('/cutout/') ? 'cutout' : 'thumb' };
    }
    return null;
  };

  return (
    <section
      ref={scrollRef}
      className={`squad-spotlight ${isVisible ? 'squad-spotlight--visible' : ''}`}
      style={{
        '--squad-primary': theme.primaryColor,
        '--squad-secondary': theme.secondaryColor,
        '--squad-accent': theme.accentColor,
        '--squad-glow': theme.glowColor,
        '--squad-glow-strong': theme.glowColorStrong,
        '--squad-dark': theme.darkColor,
      }}
    >
      <div className="squad-spotlight__header">
        <span className="squad-spotlight__label">Featured Players</span>
        <h2 className="squad-spotlight__title">Squad Spotlight</h2>
        <p className="squad-spotlight__subtitle">{theme.squad.length} star players · Season 2024/25</p>
      </div>

      <div className="squad-spotlight__grid">
        {theme.squad.map((player, i) => {
          const img = getPlayerImg(player);
          const isCutout = img?.type === 'cutout';

          return (
            <div
              key={player.name}
              className={`squad-card ${isCutout ? 'squad-card--cutout' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Jersey number watermark */}
              <div className="squad-card__number-watermark">{player.number}</div>

              {/* Player photo */}
              <div className={`squad-card__photo-wrap ${isCutout ? 'squad-card__photo-wrap--cutout' : ''}`}>
                {img ? (
                  <img
                    src={img.src}
                    alt={player.name}
                    className={`squad-card__photo ${isCutout ? 'squad-card__photo--cutout' : ''}`}
                    onError={() => handleImgError(img.src)}
                    loading="lazy"
                  />
                ) : (
                  <div className="squad-card__emoji-avatar" style={{ background: theme.cardGradient }}>
                    <span>{player.emoji}</span>
                  </div>
                )}
                {/* Glow ring */}
                <div className="squad-card__photo-glow" />
              </div>

              {/* Player info */}
              <div className="squad-card__info">
                <span className="squad-card__jersey">#{player.number}</span>
                <h4 className="squad-card__name">{player.name}</h4>
                <span className="squad-card__position">{player.position}</span>
              </div>

              {/* Stats bar */}
              {(player.goals > 0 || player.assists > 0) && (
                <div className="squad-card__stats">
                  <div className="squad-card__stat">
                    <span className="squad-card__stat-num">{player.goals}</span>
                    <span className="squad-card__stat-label">Goals</span>
                  </div>
                  <div className="squad-card__stat-divider" />
                  <div className="squad-card__stat">
                    <span className="squad-card__stat-num">{player.assists}</span>
                    <span className="squad-card__stat-label">Assists</span>
                  </div>
                </div>
              )}

              {/* Accent line */}
              <div className="squad-card__accent" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
