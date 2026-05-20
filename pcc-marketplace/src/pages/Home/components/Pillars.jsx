import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wallet, Gamepad2, ShoppingBag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HowItWorks = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hiw-eyebrow, .hiw-heading',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start: 'top 80%' } }
      );

      gsap.fromTo('.hiw-card',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 75%' } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Create Account',
      desc: 'Sign up in seconds. Your PCC wallet is instantly created - no seed phrases, no complexity.',
      icon: Wallet,
      color: '#38bdf8'
    },
    {
      num: '02',
      title: 'Play & Earn',
      desc: 'Jump into skill-based games like Aviator, Poker, or Roulette. Every win earns you real PCC tokens.',
      icon: Gamepad2,
      color: '#fbbf24'
    },
    {
      num: '03',
      title: 'Shop & Own',
      desc: 'Spend your PCC on premium club merchandise. Authentic jerseys, collectibles, and limited drops.',
      icon: ShoppingBag,
      color: '#05966A'
    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="hiw-section">

        <div className="hiw-header">
          <div className="hiw-eyebrow">
            <span>THE ECOSYSTEM</span>
            <div className="hiw-line" />
          </div>
          <h2 className="hiw-heading">
            How it <span className="hiw-accent">works</span>
          </h2>
        </div>

        <div className="hiw-grid">
          {steps.map((s, i) => (
            <div key={i} className="hiw-card" style={{ '--card-color': s.color }}>
              <div className="hiw-card-bg-num">{s.num}</div>

              <div className="hiw-icon-wrap">
                <s.icon size={28} className="hiw-icon" />
              </div>

              <h3 className="hiw-card-title">{s.title}</h3>
              <p className="hiw-card-desc">{s.desc}</p>

              {/* Decorative bottom line */}
              <div className="hiw-card-line" />
            </div>
          ))}
        </div>

      </section>
    </>
  );
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .hiw-section {
    padding: 2rem 5vw 4rem;
    background: #070c11;
    position: relative;
    z-index: 2;
  }

  .hiw-header {
    margin-bottom: 4rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hiw-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    color: #fbbf24;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .hiw-line {
    width: 40px;
    height: 1px;
    background: #fbbf24;
    opacity: 0.6;
  }

  .hiw-heading {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    color: #fff;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .hiw-accent {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    color: #05966A;
    text-shadow: 0 0 30px rgba(5, 150, 106, 0.4);
  }

  .hiw-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .hiw-card {
    position: relative;
    background: linear-gradient(180deg, rgba(15, 20, 25, 0.6) 0%, rgba(10, 15, 20, 0.8) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 3rem 2.5rem;
    overflow: hidden;
    transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .hiw-card:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .hiw-card-bg-num {
    position: absolute;
    top: -10px;
    right: -10px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 8rem;
    color: rgba(255, 255, 255, 0.03);
    line-height: 1;
    user-select: none;
    pointer-events: none;
  }

  .hiw-card:hover .hiw-card-bg-num {
    color: rgba(255, 255, 255, 0.05);
  }

  .hiw-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    color: var(--card-color);
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
  }

  .hiw-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }

  .hiw-card-desc {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.6;
    margin: 0;
  }

  .hiw-card-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--card-color);
    opacity: 0.5;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .hiw-card:hover .hiw-card-line {
    transform: scaleX(1);
    opacity: 1;
    box-shadow: 0 0 15px var(--card-color);
  }

  @media (max-width: 900px) {
    .hiw-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 480px) {
    .hiw-section { padding: 1.5rem 4vw 3rem; }
    .hiw-header { margin-bottom: 2.5rem; }
    .hiw-heading { font-size: clamp(2rem, 7vw, 3rem); }
    .hiw-card { padding: 2rem 1.5rem; border-radius: 18px; overflow: hidden; }
    .hiw-card-bg-num { font-size: 5rem; }
    .hiw-icon-wrap { width: 52px; height: 52px; border-radius: 14px; margin-bottom: 1.5rem; }
    .hiw-card-title { font-size: 1.25rem; }
    .hiw-card-desc { font-size: 0.88rem; }
  }
`;

