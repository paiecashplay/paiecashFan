import { useRef, useEffect, useState } from 'react';

export default function ClubStats({ theme }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (!isVisible || !theme) return;

    const targets = {
      trophies: Object.values(theme.trophies).reduce((sum, t) => sum + t.count, 0),
      founded: theme.founded,
      squad: theme.squad?.length || 0,
      tokens: parseFloat(String(theme.fanTokens).replace(/[^\d.]/g, '')) || 0,
    };

    // Animate each number from 0
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setCounts({
        trophies: Math.round(targets.trophies * eased),
        founded: targets.founded,
        squad: Math.round(targets.squad * eased),
        tokens: (targets.tokens * eased).toFixed(1),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, theme]);

  if (!theme) return null;

  const stats = [
    { label: 'Total Trophies', value: counts.trophies || 0, suffix: '' },
    { label: 'Year Founded', value: counts.founded || theme.founded, suffix: '' },
    { label: 'Squad Size', value: counts.squad || 0, suffix: ' Players' },
    { label: 'Fan Tokens', value: counts.tokens || '0', suffix: 'M' },
  ];

  return (
    <section
      ref={sectionRef}
      className={`club-stats-ribbon ${isVisible ? 'club-stats-ribbon--visible' : ''}`}
      style={{
        '--stats-primary': theme.primaryColor,
        '--stats-secondary': theme.secondaryColor,
        '--stats-glow': theme.glowColor,
        '--stats-dark': theme.darkColor,
        background: theme.darkColor,
      }}
    >
      <div className="club-stats-ribbon__inner">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="club-stats-ribbon__item"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="club-stats-ribbon__value">
              {stat.value}{stat.suffix}
            </span>
            <span className="club-stats-ribbon__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
