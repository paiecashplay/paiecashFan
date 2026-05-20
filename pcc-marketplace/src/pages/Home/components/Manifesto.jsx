import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomLink } from './CustomLink';

gsap.registerPlugin(ScrollTrigger);

export const Manifesto = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mf-word',
        { opacity: 0, y: 50, rotate: 5 },
        { opacity: 1, y: 0, rotate: 0, stagger: 0.05, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: ref.current, start: 'top 75%' } }
      );

      gsap.fromTo('.mf-desc-line',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 60%' } }
      );

      gsap.fromTo('.mf-btn',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', scrollTrigger: { trigger: ref.current, start: 'top 50%' } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  // Split text for word-by-word animation
  const title1 = "The future of sports".split(" ");
  const title2 = "fandom is ".split(" ");

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="mf-section">

        {/* Massive Background Text */}
        <div className="mf-bg-text">MANIFESTO</div>

        <div className="mf-content">
          <div className="mf-badge">
            <span className="mf-dot"></span> OUR VISION
          </div>

          <h2 className="mf-title">
            <div className="mf-title-row">
              {title1.map((word, i) => (
                <div key={i} className="mf-word-wrap"><span className="mf-word">{word}</span></div>
              ))}
            </div>
            <div className="mf-title-row">
              {title2.map((word, i) => (
                <div key={i} className="mf-word-wrap"><span className="mf-word">{word}</span></div>
              ))}
              <div className="mf-word-wrap"><span className="mf-word mf-accent">on-chain.</span></div>
            </div>
          </h2>

          <div className="mf-grid">
            <p className="mf-desc-line">
              We are redefining the relationship between fans and clubs. By leveraging blockchain, PaieCash creates a verifiable, immutable ledger of your passion.
            </p>
            <p className="mf-desc-line">
              No longer spectators - you are stakeholders. Participate in governance, earn through skill, and own a piece of sports history forever.
            </p>
          </div>

          <div className="mf-action">
            <CustomLink to="/clubs" className="mf-btn">
              Join The Movement
              <span className="mf-btn-arrow">→</span>
            </CustomLink>
          </div>
        </div>
      </section>
    </>
  );
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .mf-section {
    padding: 4rem 5vw 8rem;
    background: #070c11;
    position: relative;
    z-index: 2;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }

  .mf-bg-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: clamp(8rem, 18vw, 20rem);
    color: rgba(255, 255, 255, 0.02);
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
    z-index: 0;
  }

  .mf-content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .mf-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
  }

  .mf-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }

  .mf-title {
    margin: 0 0 4rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mf-title-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .mf-word-wrap {
    overflow: hidden;
    padding-bottom: 0.2em; /* prevent clipping descenders */
  }

  .mf-word {
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: clamp(3rem, 6vw, 6.5rem);
    color: #fff;
    line-height: 1;
    letter-spacing: -0.02em;
    transform-origin: bottom left;
  }

  .mf-accent {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    color: var(--accent);
    text-shadow: 0 0 40px rgba(var(--accent-rgb), 0.3);
  }

  .mf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    text-align: left;
    max-width: 900px;
    margin: 0 auto 5rem;
  }

  .mf-desc-line {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .mf-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 1.2rem 3rem;
    background: #fff;
    color: #000;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 50px;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .mf-btn:hover {
    background: var(--accent);
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(var(--accent-rgb), 0.3);
  }

  .mf-btn-arrow {
    transition: transform 0.3s ease;
  }

  .mf-btn:hover .mf-btn-arrow {
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    .mf-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
      text-align: center;
    }
    .mf-title-row {
      gap: 0.5rem;
    }
    .mf-section {
      padding: 6rem 5vw;
    }
  }
  @media (max-width: 480px) {
    .mf-section { padding: 3rem 4vw 4rem; }
    .mf-title { margin-bottom: 2rem; }
    .mf-word { font-size: clamp(2rem, 8vw, 3.5rem); }
    .mf-btn { padding: 1rem 2rem; font-size: 0.85rem; width: 100%; justify-content: center; }
    .mf-desc-line { font-size: 0.95rem; }
    .mf-badge { font-size: 0.68rem; padding: 6px 12px; }
    .mf-grid { gap: 1.5rem; margin-bottom: 3rem; }
  }
`;

