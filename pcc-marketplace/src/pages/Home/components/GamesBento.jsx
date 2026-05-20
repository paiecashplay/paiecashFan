import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomLink } from './CustomLink';
import { Users, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   GAME DATA
───────────────────────────────────────── */
const GAMES = [
  {
    id: 'aviator',
    title: 'Aviator',
    desc: 'Cash out before the plane flies away — pure nerve.',
    prize: '500',
    players: '1,284',
    accent: '#05966A',
    accentRgb: '5,150,106',
    badge: 'HOT',
    image: '/images/home/1.png',
    multipliers: ['10.00x', '5.00x', '2.00x', '1.00x'],
    fallbackGradient: 'radial-gradient(ellipse at 70% 40%, rgba(5,150,106,0.25) 0%, rgba(2,60,40,0.2) 50%, transparent 80%)',
    fallbackIcon: '✈️',
  },
  {
    id: 'slots',
    title: 'Slots',
    desc: 'Three reels, endless spins, massive PCC jackpots.',
    prize: '1,200',
    players: '2,340',
    accent: '#05966A',
    accentRgb: '5,150,106',
    badge: null,
    image: '/images/home/2.png',
    fallbackGradient: 'radial-gradient(ellipse at 70% 40%, rgba(5,150,106,0.25) 0%, rgba(2,60,40,0.2) 50%, transparent 80%)',
    fallbackIcon: '🎰',
    reels: ['7', '7', '7'],
  },
  {
    id: 'roulette',
    title: 'Roulette',
    desc: 'Place your bets and watch the wheel decide your fate.',
    prize: '800',
    players: '934',
    accent: '#05966A',
    accentRgb: '5,150,106',
    badge: null,
    image: '/images/home/3.png',
    fallbackGradient: 'radial-gradient(ellipse at 70% 40%, rgba(5,150,106,0.25) 0%, rgba(2,60,40,0.2) 50%, transparent 80%)',
    fallbackIcon: '🎡',
  },
  {
    id: 'poker',
    title: 'Poker',
    desc: 'Outbluff every rival at the table and take the pot.',
    prize: '2,500',
    players: '1,756',
    accent: '#fbbf24', // Keeping Poker gold for that premium casino feel, but muted slightly
    accentRgb: '251,191,36',
    badge: null,
    image: '/images/home/4.png',
    fallbackGradient: 'radial-gradient(ellipse at 70% 40%, rgba(251,191,36,0.25) 0%, rgba(120,80,5,0.2) 50%, transparent 80%)',
    fallbackIcon: '🃏',
  },
];

/* ─────────────────────────────────────────
   GAME CARD
───────────────────────────────────────── */
const GameCard = ({ game }) => {
  const [imgOk, setImgOk] = useState(true);

  return (
    <CustomLink
      to="/gaming"
      className="gb-card game-card"
      style={{
        '--accent':     game.accent,
        '--accent-rgb': game.accentRgb,
        opacity: 0,
      }}
    >
      {/* ── Background visual area ── */}
      <div className="gb-card__visual">
        {imgOk ? (
          <img
            src={game.image}
            alt={game.title}
            className="gb-card__img"
            onError={() => setImgOk(false)}
          />
        ) : (
          /* Fallback when image missing */
          <div className="gb-card__fallback">
            <span className="gb-card__fallback-icon">{game.fallbackIcon}</span>
            {/* Multiplier ticker (Aviator style) */}
            {game.multipliers && (
              <div className="gb-mult-list">
                {game.multipliers.map(m => (
                  <span key={m} className="gb-mult">{m}</span>
                ))}
              </div>
            )}
            {/* Slots reels */}
            {game.reels && (
              <div className="gb-reels">
                {game.reels.map((r, i) => (
                  <div key={i} className="gb-reel">{r}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Gradient overlay so bottom content is readable */}
        <div
          className="gb-card__overlay"
          style={{ background: `${game.fallbackGradient}` }}
        />
        {/* Bottom glow bar */}
        <div className="gb-card__glow-bar" />
      </div>

      {/* ── Top badges ── */}
      <div className="gb-card__toprow">
        <div className="gb-card__icon-badge">
          <span>{game.fallbackIcon}</span>
        </div>
        {game.badge && (
          <div className="gb-badge">🔥 {game.badge}</div>
        )}
      </div>

      {/* ── Body text ── */}
      <div className="gb-card__body">
        <h3 className="gb-card__title">{game.title}</h3>
        <p className="gb-card__desc">{game.desc}</p>
      </div>

      {/* ── Footer ── */}
      <div className="gb-card__footer">
        <div className="gb-stat-group gb-pool-group">
          <span className="gb-stat-label">PCC POOL</span>
          <span className="gb-stat-value">{game.prize}</span>
        </div>
        
        <div className="gb-stat-divider" />
        
        <div className="gb-stat-group gb-players-group">
          <span className="gb-stat-label">PLAYING NOW</span>
          <div className="gb-stat-value-sm">
            <Users size={14} className="gb-stat-icon" />
            <span>{game.players}</span>
          </div>
        </div>

        <div className="gb-card__cta">
          <ArrowRight size={18} />
        </div>
      </div>
    </CustomLink>
  );
};

/* ─────────────────────────────────────────
   SECTION
───────────────────────────────────────── */
export const GamesBento = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gb-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
      );
      gsap.fromTo('.gb-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.05,
          scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
      );
      gsap.fromTo('.game-card',
        { opacity: 0, y: 80, rotationX: 15, scale: 0.92 },
        { 
          opacity: 1, y: 0, rotationX: 0, scale: 1, 
          stagger: 0.15, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: { 
            trigger: ref.current, 
            start: 'top 85%',
          } 
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="gb-section home-section">

        {/* Header */}
        <div className="gb-header">
          <div>
            <p className="gb-eyebrow" style={{ opacity: 0 }}>PLAY. WIN. EARN.</p>
            <h2 className="gb-heading" style={{ opacity: 0 }}>
              Featured <span className="gb-heading--green">Games</span>
            </h2>
            <div className="gb-divider" />
          </div>
          <CustomLink to="/gaming" className="gb-viewall">VIEW ALL →</CustomLink>
        </div>

        {/* Cards grid */}
        <div className="gb-grid">
          {GAMES.map(g => <GameCard key={g.id} game={g} />)}
        </div>

      </section>
    </>
  );
};

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500&display=swap');

  @keyframes gb-pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.35; transform:scale(.6); }
  }
  @keyframes gb-shimmer {
    0%   { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(250%) skewX(-12deg); }
  }
  @keyframes gb-glow-breathe {
    0%,100% { opacity:.6; }
    50%      { opacity:1; }
  }

  /* ── Section ── */
  .gb-section {
    padding: 5rem 5vw 4rem;
    background: #070c11;
    position: relative;
  }

  /* ── Header ── */
  .gb-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2.5rem;
  }
  .gb-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: .7rem;
    letter-spacing: .18em;
    color: #22d35e;
    margin: 0 0 .5rem;
    text-transform: uppercase;
  }
  .gb-heading {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(2.6rem, 5vw, 4rem);
    color: #fff;
    margin: 0 0 .75rem;
    line-height: 1;
    letter-spacing: -.01em;
  }
  .gb-heading--green { color: #22d35e; }
  .gb-divider {
    width: 80px; height: 3px;
    background: linear-gradient(90deg, #22d35e, transparent);
    border-radius: 99px;
  }
  .gb-viewall {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: .8rem;
    letter-spacing: .14em;
    color: #22d35e;
    text-decoration: none;
    text-transform: uppercase;
    padding-bottom: 1rem;
    transition: opacity .2s;
  }
  .gb-viewall:hover { opacity: .7; }

  /* ── Grid ── */
  .gb-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    perspective: 1200px;
  }

  /* ── Card base ── */
  .gb-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(180deg, #111822 0%, #070a0f 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    min-height: 420px;
  }
  .gb-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(var(--accent-rgb), 0.6);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.8),
      0 0 45px rgba(var(--accent-rgb), 0.2);
  }
  /* Shimmer on hover */
  .gb-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.06) 50%, transparent 60%);
    transform: translateX(-100%) skewX(-12deg);
    pointer-events: none;
    z-index: 10;
  }
  .gb-card:hover::after {
    animation: gb-shimmer 0.7s ease forwards;
  }

  /* ── Visual area (top half of card) ── */
  .gb-card__visual {
    position: relative;
    height: 220px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .gb-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .gb-card:hover .gb-card__img { transform: scale(1.08); }

  /* Fallback (no image) */
  .gb-card__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .gb-card__fallback-icon {
    font-size: 4.5rem;
    opacity: 0.25;
    filter: blur(2px);
    position: absolute;
    right: 16%;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Multiplier ticker (Aviator) */
  .gb-mult-list {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  .gb-mult {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    color: rgba(var(--accent-rgb), 0.8);
    letter-spacing: 0.05em;
  }

  /* Slots reels */
  .gb-reels {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 6px;
  }
  .gb-reel {
    width: 48px; height: 64px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 2.2rem;
    color: var(--accent);
    text-shadow: 0 0 24px var(--accent);
    box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
  }

  /* Gradient overlay on top of the visual */
  .gb-card__overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    /* extra dark bottom fade so text is readable */
    background: linear-gradient(
      to bottom,
      transparent 10%,
      rgba(7, 10, 15, 0.95) 100%
    ) !important;
  }

  /* Accent glow bar at bottom of visual */
  .gb-card__glow-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    z-index: 3;
    opacity: 0.8;
    animation: gb-glow-breathe 3s ease-in-out infinite;
  }

  /* ── Top row (icon badge + HOT badge) ── */
  .gb-card__toprow {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 4;
  }
  .gb-card__icon-badge {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: rgba(var(--accent-rgb), 0.15);
    border: 1px solid rgba(var(--accent-rgb), 0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  .gb-badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 100, 100, 0.5);
    color: #fff;
    border-radius: 100px;
    padding: 0.35rem 0.8rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  /* ── Body ── */
  .gb-card__body {
    padding: 1.25rem 1.4rem 0.5rem;
    flex: 1;
    position: relative;
    z-index: 2;
  }
  .gb-card__title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 1.8rem;
    color: #fff;
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .gb-card__desc {
    font-family: 'Barlow', sans-serif;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.6;
  }

  /* ── Footer ── */
  .gb-card__footer {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .gb-stat-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .gb-pool-group {
    flex: 1;
  }

  .gb-players-group {
    flex: 1;
  }

  .gb-stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
  }

  .gb-stat-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.1em;
    line-height: 1;
  }

  .gb-stat-value {
    color: var(--accent);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
    text-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3);
  }

  .gb-stat-value-sm {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: #fff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1;
  }

  .gb-stat-icon {
    color: rgba(255, 255, 255, 0.5);
  }

  .gb-card__cta {
    width: 40px; 
    height: 40px;
    border-radius: 50%;
    background: rgba(var(--accent-rgb), 0.1);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    display: flex; 
    align-items: center; 
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .gb-card:hover .gb-card__cta {
    background: var(--accent);
    color: #000;
    transform: rotate(-45deg);
  }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .gb-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .gb-grid { grid-template-columns: 1fr; }
    .gb-header { flex-direction: column; align-items: flex-start; gap: .75rem; }
    .gb-viewall { padding-bottom: 0; }
  }
  @media (max-width: 480px) {
    .gb-section { padding: 3rem 4vw 2.5rem; }
    .gb-card { min-height: 340px; border-radius: 18px; }
    .gb-card__visual { height: 180px; }
    .gb-card__body { padding: 1rem 1.1rem 0.4rem; }
    .gb-card__title { font-size: 1.4rem; }
    .gb-card__desc { font-size: 0.8rem; }
    .gb-card__footer { flex-wrap: wrap; gap: 0.75rem; padding-top: 1rem; }
    .gb-stat-value { font-size: 1.3rem; }
    .gb-stat-label { font-size: 0.55rem; }
    .gb-card__cta { width: 36px; height: 36px; }
    .gb-card__icon-badge { width: 40px; height: 40px; font-size: 1.1rem; }
    .gb-badge { font-size: 0.65rem; padding: 0.3rem 0.65rem; }
  }
`;