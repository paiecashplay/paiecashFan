import { useMemo } from 'react';

// Lightweight sparkle particle system
function HeroParticles({ color }) {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 4 + 4,
    }));
  }, []);

  return (
    <div className="club-hero__particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="club-hero__particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ClubHero({ theme }) {
  if (!theme) return null;

  return (
    <>
      <section
        className="club-hero"
        style={{
          '--hero-primary': theme.primaryColor,
          '--hero-secondary': theme.secondaryColor,
          '--hero-accent': theme.accentColor,
          '--hero-glow': theme.glowColor,
          '--hero-glow-strong': theme.glowColorStrong,
          background: theme.heroGradient,
        }}
      >
        {/* Animated background effects */}
        <div className="club-hero__bg-effects">
          <div className="club-hero__orb club-hero__orb--1" style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 70%)` }} />
          <div className="club-hero__orb club-hero__orb--2" style={{ background: `radial-gradient(circle, ${theme.glowColor.replace('0.4', '0.2')}, transparent 70%)` }} />
          <div className="club-hero__orb club-hero__orb--3" style={{ background: `radial-gradient(circle, ${theme.glowColorStrong.replace('0.6', '0.15')}, transparent 70%)` }} />
          <div className="club-hero__streak club-hero__streak--1" style={{ background: `linear-gradient(90deg, transparent, ${theme.glowColor}, transparent)` }} />
          <div className="club-hero__streak club-hero__streak--2" style={{ background: `linear-gradient(90deg, transparent, ${theme.glowColor.replace('0.4', '0.2')}, transparent)` }} />
        </div>

        {/* Floating sparkle particles */}
        <HeroParticles color={theme.secondaryColor} />

        {/* Noise grain */}
        <div className="club-hero__noise" />

        {/* Stadium background image */}
        {theme.cardBgImage && (
          <div className="club-hero__stadium-bg" style={{ backgroundImage: `url(${theme.cardBgImage})` }} />
        )}

        {/* Geometric pattern */}
        <div className="club-hero__pattern" />

        {/* Content - Removed GSAP visibility classes, just render directly */}
        <div className="club-hero__content club-hero__content--visible">
          
          {/* Crest with glow halo */}
          <div className="club-hero__crest-container">
            <div
              className="club-hero__crest-glow"
              style={{ boxShadow: `0 0 120px 60px ${theme.glowColor}, 0 0 200px 100px ${theme.glowColor.replace('0.4', '0.15')}` }}
            />
            {theme.crestUrl ? (
              <img src={theme.crestUrl} alt={theme.name} className="club-hero__crest-img" />
            ) : (
              <span className="club-hero__crest-emoji">{theme.crestEmoji}</span>
            )}
          </div>

          {/* Club name */}
          <h1 className="club-hero__name">{theme.name}</h1>

          {/* Tagline */}
          <p className="club-hero__tagline">"{theme.tagline}"</p>

          {/* Metadata row */}
          <div className="club-hero__meta">
            <span className="club-hero__meta-item">
              <span className="club-hero__meta-label">Founded</span>
              <span className="club-hero__meta-value">{theme.founded}</span>
            </span>
            <span className="club-hero__meta-divider" />
            <span className="club-hero__meta-item">
              <span className="club-hero__meta-label">Stadium</span>
              <span className="club-hero__meta-value">{theme.stadium}</span>
            </span>
            <span className="club-hero__meta-divider" />
            <span className="club-hero__meta-item">
              <span className="club-hero__meta-label">Manager</span>
              <span className="club-hero__meta-value">{theme.manager}</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
