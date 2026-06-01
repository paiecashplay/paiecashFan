import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Trophy, ShoppingBag, Tv, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Mots qui cyclent dans le titre (style marketplace)
const CYCLE_WORDS = ['fans', 'clubs', 'sponsors', 'champions'];

// Cards flottantes positionnées autour du joueur (équivalent CONTESTS/BETTING marketplace)
const FEATURE_CARDS = [
  {
    id: 'tombola',
    title: 'TOMBOLA',
    desc: 'Tirage chaque soir 20h',
    stat: '950+ joueurs',
    link: '/tombola',
    position: 'top-right',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4M7 4h10M6 4v5a6 6 0 0 0 12 0V4M4 4h2v5H4zM18 4h2v5h-2z" />
      </svg>
    )
  },
  {
    id: 'boutique',
    title: 'BOUTIQUE',
    desc: 'Maillots officiels',
    stat: '500+ clubs',
    link: '/boutique',
    position: 'bottom-right',
    icon: <ShoppingBag size={20} strokeWidth={1.5} />
  },
  {
    id: 'costreaming',
    title: 'CO-STREAMING',
    desc: 'Match avec tes potes',
    stat: 'P2P illimité',
    link: '/fan-club',
    position: 'top-left',
    icon: <Tv size={20} strokeWidth={1.5} />
  },
  {
    id: 'fan-club',
    title: 'FAN CLUB',
    desc: 'Communauté VIP',
    stat: '125k+ fans',
    link: '/fan-club',
    position: 'bottom-left',
    icon: <Users size={20} strokeWidth={1.5} />
  }
];

// Trust row : clubs partenaires (les couleurs hover dérivent de leur palette officielle)
const TRUSTED_CLUBS = [
  { name: 'OM',          color: 'rgba(0,153,216,0.3)',  border: 'rgba(0,153,216,0.6)' },
  { name: 'PSG',         color: 'rgba(0,65,112,0.3)',   border: 'rgba(0,65,112,0.6)' },
  { name: 'RAJA',        color: 'rgba(0,114,61,0.3)',   border: 'rgba(0,114,61,0.6)' },
  { name: 'BARCA',       color: 'rgba(165,0,68,0.3)',   border: 'rgba(165,0,68,0.6)' },
  { name: 'BAYERN',      color: 'rgba(220,5,45,0.3)',   border: 'rgba(220,5,45,0.6)' },
  { name: 'LIVERPOOL',   color: 'rgba(200,16,46,0.3)',  border: 'rgba(200,16,46,0.6)' }
];

export function HeroFuturist() {
  const sectionRef = useRef(null);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % CYCLE_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo('.hero-line',         { opacity: 0, y: 80, skewY: 4 }, { opacity: 1, y: 0, skewY: 0, stagger: 0.12, duration: 1.2 }, 0.1);
      tl.fromTo('.hero-sub',          { opacity: 0, y: 24 },           { opacity: 1, y: 0, duration: 0.9 }, 0.6);
      tl.fromTo('.hero-btn',          { opacity: 0, y: 18 },           { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, 0.8);
      tl.fromTo('.hero-trusted',      { opacity: 0, y: 16 },           { opacity: 1, y: 0, duration: 0.8 }, 1.0);
      tl.fromTo('.ph-portal-wrap',    { opacity: 0, scale: 1.04 },     { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0.05);
      tl.fromTo('.fcard--top-left',    { opacity: 0, x: -50, y: -20, scale: 0.85 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.55);
      tl.fromTo('.fcard--bottom-left', { opacity: 0, x: -50, y:  20, scale: 0.85 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.7);
      tl.fromTo('.fcard--top-right',   { opacity: 0, x:  50, y: -20, scale: 0.85 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.6);
      tl.fromTo('.fcard--bottom-right',{ opacity: 0, x:  50, y:  20, scale: 0.85 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.75);

      // Parallax scroll
      gsap.to('.ph-portal-wrap', {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.4 }
      });
      gsap.to('.hero-title', {
        y: -40, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: '30% top', end: 'bottom top', scrub: 0.3 }
      });
      // Floaty cards
      document.querySelectorAll('.ph-fcard').forEach((card, i) => {
        gsap.to(card, { y: (i % 2 === 0 ? -14 : 14), duration: 3 + i * 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{HERO_CSS}</style>
      <section ref={sectionRef} className="ph-section">
        {/* Joueur en fond avec mask + screen blend */}
        <div className="ph-portal-wrap">
          <img src="/images/hero-portal.png" alt="" className="ph-portal-img" />
          <div className="ph-portal-glow" />
        </div>

        <div className="ph-noise" />

        {/* Contenu principal */}
        <div className="ph-content">
          {/* Colonne gauche : texte + CTAs + trust */}
          <div className="ph-left">
            <h1 className="hero-title ph-title">
              <div className="ph-overflow"><div className="hero-line ph-tline">CONNECTEZ-VOUS</div></div>
              <div className="ph-overflow">
                <div className="hero-line ph-tline ph-tline--cycle">
                  <span>AUX&nbsp;</span>
                  <span key={wordIdx} className="ph-word">{CYCLE_WORDS[wordIdx]}</span>
                </div>
              </div>
              <div className="ph-overflow"><div className="hero-line ph-tline">DE FOOT.</div></div>
            </h1>

            <p className="hero-sub ph-sub">
              Cartes prépayées, eSIM mondiale, boutiques officielles, tombola live,
              co-streaming P2P entre fans — <span className="ph-green">tout-en-un</span>.
            </p>

            <div className="ph-btns">
              <a href="/boutique" className="hero-btn ph-btn ph-btn--primary">
                <span>Découvrir</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </a>
              <a href="#tabs" className="hero-btn ph-btn ph-btn--ghost">
                <span>Explorer les clubs</span>
              </a>
            </div>

            <div className="hero-trusted ph-trusted">
              <span className="ph-trusted__label">Déjà 125 000+ fans · 500+ clubs partenaires</span>
              <div className="ph-trusted__row">
                {TRUSTED_CLUBS.map((c) => (
                  <div
                    key={c.name}
                    className="ph-crest"
                    style={{ '--hover-bg': c.color, '--hover-border': c.border }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite : cards flottantes par-dessus l'image */}
          <div className="ph-right">
            {FEATURE_CARDS.map((f) => (
              <a key={f.id} href={f.link} className={`hero-fcard ph-fcard fcard--${f.position}`}>
                <div className="ph-fcard__top">
                  <div className="ph-fcard__icon">{f.icon}</div>
                  <div className="ph-fcard__copy">
                    <h4 className="ph-fcard__title">{f.title}</h4>
                    <p className="ph-fcard__desc">{f.desc}</p>
                  </div>
                  <span className="ph-fcard__arrow">↗</span>
                </div>
                <div className="ph-fcard__bottom">
                  <span className="ph-fcard__stat">{f.stat}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const HERO_CSS = `
  @keyframes word-in {
    0% { opacity: 0; transform: translateY(40px) skewY(6deg); }
    100% { opacity: 1; transform: translateY(0) skewY(0); }
  }

  .ph-section {
    position: relative;
    width: 100%;
    min-height: 86vh;
    background: #04080d;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: 'Barlow', sans-serif;
  }

  /* Footballer en fond — moitié droite, screen blend + mask radial */
  .ph-portal-wrap {
    position: absolute;
    top: -5%;
    right: -5%;
    width: 72%;
    height: 110%;
    z-index: 0;
    pointer-events: none;
  }
  .ph-portal-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    mix-blend-mode: screen;
    opacity: 0.88;
    -webkit-mask-image:
      linear-gradient(to right, transparent 0%, transparent 8%, rgba(0,0,0,0.15) 18%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.85) 42%, black 55%, black 85%, rgba(0,0,0,0.4) 95%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 10%, black 20%, black 80%, rgba(0,0,0,0.6) 92%, transparent 100%);
    -webkit-mask-composite: destination-in;
    mask-image:
      linear-gradient(to right, transparent 0%, transparent 8%, rgba(0,0,0,0.15) 18%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.85) 42%, black 55%, black 85%, rgba(0,0,0,0.4) 95%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 10%, black 20%, black 80%, rgba(0,0,0,0.6) 92%, transparent 100%);
    mask-composite: intersect;
  }
  .ph-portal-glow {
    position: absolute;
    top: 10%; left: 8%;
    width: 84%; height: 80%;
    background: radial-gradient(ellipse at 55% 50%,
      rgba(34,211,94,0.10) 0%,
      rgba(80,255,175,0.05) 35%,
      rgba(16,185,129,0.04) 55%,
      transparent 75%);
    filter: blur(80px);
  }

  .ph-noise {
    position: absolute; inset: 0;
    z-index: 1; pointer-events: none;
    opacity: 0.3; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  .ph-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 560px) 1fr;
    align-items: center;
    padding: 5.5rem 5vw 3rem 5vw;
    gap: 0;
  }

  /* LEFT */
  .ph-left { display: flex; flex-direction: column; gap: 1.6rem; }
  .ph-title { margin: 0; line-height: 1; }
  .ph-overflow { overflow: hidden; }
  .ph-tline {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(3.2rem, 5.5vw, 5.5rem);
    color: #fff;
    text-transform: uppercase;
    line-height: 0.96;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 48px rgba(0,0,0,0.9);
  }
  .ph-tline--cycle { display: flex; align-items: baseline; gap: 0.3rem; }
  .ph-tline--cycle > span:first-child { color: #fff; }
  .ph-word {
    display: inline-block;
    color: #10b981;
    animation: word-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .ph-sub {
    font-size: 1.05rem;
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    max-width: 480px;
    margin: 0;
  }
  .ph-green { color: #22d35e; font-weight: 600; }

  .ph-btns { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
  .ph-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    padding: 0.85rem 1.6rem; border-radius: 100px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; font-size: 0.85rem;
    letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .ph-btn--primary {
    background: linear-gradient(135deg, #10b981, #22d35e);
    color: #04080d;
    box-shadow: 0 0 40px -8px rgba(34,211,94,0.5);
  }
  .ph-btn--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 60px -8px rgba(34,211,94,0.7);
  }
  .ph-btn--ghost {
    background: rgba(255,255,255,0.04);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.18);
  }
  .ph-btn--ghost:hover {
    border-color: rgba(34,211,94,0.5);
    background: rgba(34,211,94,0.08);
  }

  .ph-trusted { display: flex; flex-direction: column; gap: 0.75rem; }
  .ph-trusted__label {
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    font-weight: 700;
  }
  .ph-trusted__row { display: flex; gap: -2px; align-items: center; }
  .ph-crest {
    display: inline-grid;
    place-items: center;
    width: 38px; height: 38px;
    border-radius: 100%;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.12);
    margin-left: -8px;
    font-size: 8px;
    font-weight: 900;
    font-family: 'Barlow Condensed', sans-serif;
    color: #fff;
    letter-spacing: 0.05em;
    transition: all 0.3s;
  }
  .ph-crest:first-child { margin-left: 0; }
  .ph-crest:hover {
    background: var(--hover-bg, rgba(34,211,94,0.2));
    border-color: var(--hover-border, rgba(34,211,94,0.6));
    transform: translateY(-2px);
  }

  /* RIGHT (cards flottantes) */
  .ph-right {
    position: relative;
    height: 100%;
    min-height: 480px;
  }
  .ph-fcard {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem 1.1rem;
    width: 220px;
    border-radius: 14px;
    background: rgba(8,14,20,0.65);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    border: 1px solid rgba(16,185,129,0.25);
    text-decoration: none;
    color: #fff;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 0 30px -8px rgba(0,0,0,0.6);
  }
  .ph-fcard:hover {
    transform: translateY(-4px);
    border-color: rgba(16,185,129,0.6);
    box-shadow: 0 0 40px -8px rgba(16,185,129,0.45);
  }
  .fcard--top-left     { top: 6%;  left: -2%; }
  .fcard--bottom-left  { bottom: 8%; left: 4%; }
  .fcard--top-right    { top: 0;   right: 4%; }
  .fcard--bottom-right { bottom: 4%; right: 0; }

  .ph-fcard__top { display: flex; align-items: flex-start; gap: 0.7rem; }
  .ph-fcard__icon {
    flex-shrink: 0;
    display: grid; place-items: center;
    width: 30px; height: 30px;
    border-radius: 8px;
    color: #34d399;
    border: 1px solid rgba(52,211,153,0.4);
    background: rgba(52,211,153,0.08);
  }
  .ph-fcard__copy { flex: 1; min-width: 0; }
  .ph-fcard__title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    color: #34d399;
    margin: 0;
  }
  .ph-fcard__desc {
    margin: 0.15rem 0 0 0;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.3;
  }
  .ph-fcard__arrow {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
    margin-left: auto;
  }
  .ph-fcard__bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 0.5rem;
    display: flex; justify-content: flex-end;
  }
  .ph-fcard__stat {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    color: #34d399;
  }

  /* Responsive : <980px on stack la colonne droite sous le texte */
  @media (max-width: 980px) {
    .ph-content {
      grid-template-columns: 1fr;
      padding: 4rem 6vw 2rem 6vw;
    }
    .ph-right {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
      min-height: auto;
      margin-top: 1.5rem;
    }
    .ph-fcard {
      position: relative;
      top: auto; bottom: auto; left: auto; right: auto;
      width: 100%;
    }
    .ph-portal-wrap {
      opacity: 0.35;
    }
  }
  @media (max-width: 520px) {
    .ph-right { grid-template-columns: 1fr; }
    .ph-tline { font-size: clamp(2.4rem, 11vw, 3.5rem); }
  }
`;
