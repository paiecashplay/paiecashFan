import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomLink } from './CustomLink';

gsap.registerPlugin(ScrollTrigger);

export const Clubs = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.club-row', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, stagger: 0.06, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 82%' }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const clubs = [
    { name: 'Real Madrid',         country: 'Spain',   players: '2.1K' },
    { name: 'FC Barcelona',        country: 'Spain',   players: '1.9K' },
    { name: 'Liverpool FC',        country: 'England', players: '1.8K' },
    { name: 'Bayern Munich',       country: 'Germany', players: '1.4K' },
    { name: 'Paris Saint-Germain', country: 'France',  players: '1.2K' },
    { name: 'Manchester City',     country: 'England', players: '1.1K' },
  ];

  return (
    <section ref={ref} className="home-section">
      <div className="section-header">
        <h2 className="section-title">Clubs</h2>
        <CustomLink to="/clubs" className="section-link">All Clubs →</CustomLink>
      </div>
      {clubs.map((c, i) => (
        <CustomLink key={i} to={`/clubs/${c.name.toLowerCase().replace(/ /g, '-')}`} className="club-row" style={{ opacity: 0 }}>
          <span className="club-row__num">0{i + 1}</span>
          <span className="club-row__name">{c.name}</span>
          <span className="club-row__meta">{c.country}</span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>{c.players}</span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--home-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Players</span>
          </span>
          <span className="club-row__arrow">→</span>
        </CustomLink>
      ))}
    </section>
  );
};
