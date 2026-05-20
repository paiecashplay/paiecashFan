import { useRef, useEffect, useState } from 'react';
import { fetchPlayerImage } from '../playerImages';

export default function StarPlayer({ theme }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [playerImg, setPlayerImg] = useState(null);

  const star = theme?.squad?.[0]; // Top scorer / star player

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!star) return;
    fetchPlayerImage(star.name).then(img => setPlayerImg(img));
  }, [star?.name]);

  if (!theme || !star) return null;

  const imgSrc = playerImg?.cutout || playerImg?.thumb || null;

  return (
    <section
      ref={sectionRef}
      className={`star-player ${isVisible ? 'star-player--visible' : ''}`}
      style={{
        '--sp-primary': theme.primaryColor,
        '--sp-secondary': theme.secondaryColor,
        '--sp-accent': theme.accentColor,
        '--sp-glow': theme.glowColor,
        '--sp-glow-strong': theme.glowColorStrong,
        background: theme.darkColor,
      }}
    >
      {/* Decorative number watermark */}
      <div className="star-player__watermark">{star.number}</div>

      <div className="star-player__container">
        {/* Left: Player image */}
        <div className="star-player__visual">
          <div className="star-player__glow-ring" />
          {imgSrc ? (
            <img src={imgSrc} alt={star.name} className="star-player__image" />
          ) : (
            <div className="star-player__emoji-fallback" style={{ background: theme.cardGradient }}>
              <span>{star.emoji}</span>
            </div>
          )}
          {/* Diagonal accent line */}
          <div className="star-player__accent-line" />
        </div>

        {/* Right: Player info */}
        <div className="star-player__info">
          <span className="star-player__label">Star Player</span>
          <span className="star-player__number">#{star.number}</span>
          <h2 className="star-player__name">{star.name}</h2>
          <span className="star-player__position">{star.position}</span>

          <div className="star-player__stats-grid">
            <div className="star-player__stat-box">
              <span className="star-player__stat-value">{star.goals}</span>
              <span className="star-player__stat-key">Goals</span>
            </div>
            <div className="star-player__stat-box">
              <span className="star-player__stat-value">{star.assists}</span>
              <span className="star-player__stat-key">Assists</span>
            </div>
            <div className="star-player__stat-box">
              <span className="star-player__stat-value">{star.goals + star.assists}</span>
              <span className="star-player__stat-key">G+A</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
