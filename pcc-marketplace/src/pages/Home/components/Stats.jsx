import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Box, Gamepad2, ShoppingBag, TrendingUp, ArrowRight, Crown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    v: 12500, fmt: 'comma-plus', label: 'ACTIVE PLAYERS',
    color: '#05966A', icon: Users, image: '/images/stats/1.png',
    badge: { type: 'trend', pct: '+18%', text: 'vs last 7 days' },
  },
  {
    v: 186000, fmt: 'comma', label: 'PCC DISTRIBUTED',
    color: '#a78bfa', icon: Box, image: '/images/stats/2.png',
    badge: { type: 'trend', pct: '+24%', text: 'vs last 7 days' },
  },
  {
    v: 9, fmt: 'plain', label: 'LIVE GAMES',
    color: '#38bdf8', icon: Gamepad2, image: '/images/stats/3.png',
    badge: { type: 'dot', count: 3, text: 'ongoing now' },
  },
  {
    v: 70, fmt: 'plus', label: 'MERCH ITEMS',
    color: '#fbbf24', icon: ShoppingBag, image: '/images/stats/4.png',
    badge: { type: 'dot', count: 12, text: 'new arrivals' },
  },
];

function formatNum(v, fmt) {
  if (fmt === 'comma') return Math.round(v).toLocaleString();
  if (fmt === 'comma-plus') return Math.round(v).toLocaleString() + '+';
  if (fmt === 'plus') return Math.round(v) + '+';
  return String(Math.round(v));
}

const Counter = ({ value, fmt, className }) => {
  const elRef = useRef(null);

  useLayoutEffect(() => {
    let obj = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: elRef.current,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: value,
          duration: 2.5,
          ease: 'expo.out',
          onUpdate: () => {
            if (elRef.current) {
              elRef.current.textContent = formatNum(obj.v, fmt);
            }
          }
        });
      }
    });
    return () => st.kill();
  }, [value, fmt]);

  return <div ref={elRef} className={className}>0</div>;
};

export const Stats = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {

          // Header animation
          gsap.fromTo('.st-header-el',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
          );

          // Card entrance
          gsap.fromTo('.stat-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
          );

          // Note: Number counter animation is now handled internally by Counter component
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="st-section">
        {/* Header */}
        <div className="st-header">
          <div>
            <div className="st-eyebrow st-header-el">
              <span>PLATFORM STATS</span>
              <div className="st-eyebrow-line" />
            </div>
            <h2 className="st-heading st-header-el">
              By the <span className="st-accent">numbers</span>
            </h2>
            <p className="st-sub st-header-el">Real-time stats from the PaieCash ecosystem</p>
          </div>
          <button className="st-view-btn st-header-el">
            <span>VIEW ALL STATS</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Cards */}
        <div className="st-grid">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="stat-card"
              style={{ '--card-color': card.color }}
            >
              {/* Top border glow */}
              <div className="st-top-glow" />

              {/* Background Image Masked to the right */}
              <img src={card.image} alt={card.label} className="st-bg-img" />

              <div className="st-content">
                <div className="st-icon" style={{ borderColor: card.color + '40', boxShadow: `0 0 20px ${card.color}20` }}>
                  <card.icon size={28} color={card.color} />
                </div>

                <Counter value={card.v} fmt={card.fmt} className="st-num" />
                
                <div className="st-line" style={{ background: card.color, boxShadow: `0 0 10px ${card.color}80` }} />

                <div className="st-label">{card.label}</div>

                <div className="st-badge">
                  {card.badge.type === 'trend' ? (
                    <TrendingUp size={16} color={card.color} />
                  ) : (
                    <span className="st-dot" style={{ background: card.color, boxShadow: `0 0 8px ${card.color}` }} />
                  )}
                  <span className="st-badge-pct" style={{ color: card.color }}>
                    {card.badge.pct || card.badge.count}
                  </span>
                  <span className="st-badge-vs">{card.badge.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </>
  );
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .st-section {
    padding: 2rem 5vw 2rem;
    background: #070c11;
    position: relative;
    z-index: 2;
    font-family: 'Space Grotesk', sans-serif;
  }

  .st-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 3rem;
  }

  .st-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    color: #05966A;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
  }

  .st-eyebrow-line {
    width: 30px;
    height: 1px;
    background: #05966A;
    opacity: 0.6;
  }

  .st-heading {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: clamp(2.6rem, 5vw, 4rem);
    color: #fff;
    line-height: 1;
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
  }

  .st-accent {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    color: #05966A;
    text-shadow: 0 0 30px rgba(5, 150, 106, 0.4);
  }

  .st-sub {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }

  .st-view-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: #fff;
    background: transparent;
    border: 1px solid rgba(5, 150, 106, 0.4);
    border-radius: 20px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .st-view-btn:hover {
    background: rgba(5, 150, 106, 0.1);
    border-color: #05966A;
  }

  .st-view-btn i {
    color: #05966A;
    font-size: 1.1rem;
  }

  .st-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  /* Card */
  .stat-card {
    position: relative;
    background: linear-gradient(180deg, rgba(15, 20, 25, 0.6) 0%, rgba(10, 15, 20, 0.8) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 2.5rem 2rem;
    overflow: hidden;
    transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    border-color: rgba(var(--card-color), 0.3);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(var(--card-color), 0.05);
  }

  .st-top-glow {
    position: absolute;
    top: 0;
    left: 2rem;
    width: 60px;
    height: 2px;
    background: var(--card-color);
    box-shadow: 0 0 15px 1px var(--card-color);
    border-radius: 0 0 4px 4px;
  }

  /* Faded Image on the right */
  .st-bg-img {
    position: absolute;
    top: -10%;
    right: -20%;
    width: 130%;
    height: 120%;
    object-fit: contain;
    object-position: right center;
    opacity: 0.15;
    z-index: 0;
    mask-image: linear-gradient(to right, transparent 30%, black 90%);
    -webkit-mask-image: linear-gradient(to right, transparent 30%, black 90%);
    transition: opacity 0.4s ease, transform 0.6s ease;
    mix-blend-mode: screen;
  }

  .stat-card:hover .st-bg-img {
    opacity: 0.25;
    transform: scale(1.05);
  }

  .st-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .st-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 2rem;
    transition: transform 0.3s ease;
  }

  .stat-card:hover .st-icon {
    transform: scale(1.05);
  }

  .st-num {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .st-line {
    width: 36px;
    height: 2px;
    border-radius: 2px;
    margin-bottom: 1.25rem;
  }

  .st-label {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 2rem;
  }

  .st-badge {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    margin-top: auto;
  }

  .st-badge-pct {
    font-weight: 700;
    font-size: 0.85rem;
  }

  .st-badge-vs {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.4);
  }

  .st-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  @media (max-width: 1200px) {
    .st-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .st-grid { grid-template-columns: 1fr; }
    .st-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  }
  @media (max-width: 480px) {
    .st-section { padding: 1.5rem 4vw 1.5rem; }
    .stat-card { padding: 2rem 1.5rem; border-radius: 18px; }
    .st-num { font-size: 2.2rem; }
    .st-icon { width: 44px; height: 44px; margin-bottom: 1.5rem; }
    .st-icon svg { width: 22px; height: 22px; }
    .st-label { font-size: 0.7rem; margin-bottom: 1.5rem; }
    .st-badge { padding: 0.5rem 0.8rem; }
    .st-badge-pct { font-size: 0.8rem; }
    .st-badge-vs { font-size: 0.7rem; }
    .st-view-btn { width: 100%; justify-content: center; }
    .st-heading { font-size: clamp(2rem, 6vw, 3rem); }
  }
`;