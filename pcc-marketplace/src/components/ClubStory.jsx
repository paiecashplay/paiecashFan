import { useEffect, useRef, useState } from 'react';

export default function ClubStory({ theme }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!theme) return null;

  const trophyEntries = Object.values(theme.trophies || {}).filter(t => t.count > 0);

  return (
    <section
      ref={sectionRef}
      className={`club-story ${isVisible ? 'club-story--visible' : ''}`}
      style={{
        '--story-primary': theme.primaryColor,
        '--story-secondary': theme.secondaryColor,
        '--story-accent': theme.accentColor,
        '--story-glow': theme.glowColor,
      }}
    >
      <div className="club-story__container" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
        {/* Editorial text */}
        <div className="club-story__text" style={{ maxWidth: '800px', margin: '0 auto', alignItems: 'center' }}>
          <span className="club-story__label">The Legacy</span>
          <h2 className="club-story__title">
            A History of <span style={{ color: 'var(--story-secondary)' }}>Greatness</span>
          </h2>
          <p className="club-story__description">{theme.description}</p>

          <div className="club-story__founded-badge" style={{ margin: '2rem auto 0' }}>
            <span className="club-story__founded-year">{theme.founded}</span>
            <span className="club-story__founded-label">Year Founded</span>
          </div>
        </div>
      </div>
    </section>
  );
}
