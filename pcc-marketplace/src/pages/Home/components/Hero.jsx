import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURE_CARDS = [
  {
    id: 'contests',
    title: 'CONTESTS',
    desc: 'WIN BIG PRIZES',
    stat: '950+ Entries',
    link: '/contests',
    accentColor: '#05966A',
    glowColor: 'rgba(5,150,106,0.3)',
    borderColor: 'rgba(5,150,106,0.4)',
    position: 'top-right',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4M7 4h10M6 4v5a6 6 0 0 0 12 0V4M4 4h2v5H4zM18 4h2v5h-2z"/>
      </svg>
    ),
    crests: [
      'https://crests.football-data.org/86.png',
      'https://crests.football-data.org/81.png',
    ],
  },
  {
    id: 'betting',
    title: 'BETTING',
    desc: 'ON-CHAIN PREDICTIONS',
    stat: '1.2K+ Bettors',
    link: '/betting',
    accentColor: '#05966A',
    glowColor: 'rgba(5,150,106,0.3)',
    borderColor: 'rgba(5,150,106,0.4)',
    position: 'bottom-right',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    crests: [
      'https://crests.football-data.org/86.png',
      'https://crests.football-data.org/81.png',
    ],
  },
];

const TRUSTED_CLUBS = [
  { name: 'FC Barcelona',  crest: 'https://crests.football-data.org/81.png', color: 'rgba(165,0,68,0.3)', border: 'rgba(165,0,68,0.6)' },
  { name: 'Real Madrid',   crest: 'https://crests.football-data.org/86.png', color: 'rgba(0,82,159,0.3)', border: 'rgba(0,82,159,0.6)' },
  { name: 'Man United',    crest: 'https://crests.football-data.org/66.png', color: 'rgba(218,41,28,0.3)', border: 'rgba(218,41,28,0.6)' },
  { name: 'Bayern Munich', crest: 'https://crests.football-data.org/5.png',  color: 'rgba(220,5,45,0.3)', border: 'rgba(220,5,45,0.6)' },
  { name: 'Liverpool',     crest: 'https://crests.football-data.org/64.png', color: 'rgba(200,16,46,0.3)', border: 'rgba(200,16,46,0.6)' },
];

const CYCLE_WORDS = ['Football', 'Web3', 'On-Chain', 'Gaming'];

export const Hero = ({ done }) => {
  const sectionRef = useRef(null);
  const [wordIdx, setWordIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % CYCLE_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  useLayoutEffect(() => {
    if (!done) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo('.hero-line',              { opacity: 0, y: 80, skewY: 4 },           { opacity: 1, y: 0, skewY: 0, stagger: 0.12, duration: 1.2 }, 0.1);
      tl.fromTo('.hero-sub',               { opacity: 0, y: 24 },                      { opacity: 1, y: 0, duration: 0.9 }, 0.6);
      tl.fromTo('.hero-btn',               { opacity: 0, y: 18 },                      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, 0.8);
      tl.fromTo('.hero-trusted',           { opacity: 0, y: 16 },                      { opacity: 1, y: 0, duration: 0.8 }, 1.0);
      tl.fromTo('.ph-portal-wrap',         { opacity: 0, scale: 1.04 },                { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0.05);
      tl.fromTo('.ph-fcard--top-left',     { opacity: 0, x: -50, y: -20, scale: 0.85 },{ opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.55);
      tl.fromTo('.ph-fcard--bottom-left',  { opacity: 0, x: -50, y:  20, scale: 0.85 },{ opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.7);
      tl.fromTo('.ph-fcard--top-right',    { opacity: 0, x:  50, y: -20, scale: 0.85 },{ opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.6);
      tl.fromTo('.ph-fcard--bottom-right', { opacity: 0, x:  50, y:  20, scale: 0.85 },{ opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.75);
    }, sectionRef);
    return () => ctx.revert();
  }, [done]);

  useLayoutEffect(() => {
    if (!done || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.ph-portal-wrap', {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.4 },
      });
      gsap.to('.hero-title', {
        y: -40, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: '30% top', end: 'bottom top', scrub: 0.3 },
      });
      document.querySelectorAll('.ph-fcard').forEach((card, i) => {
        gsap.to(card, { y: (i % 2 === 0 ? -14 : 14), duration: 3 + i * 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [done]);

  return (
    <>
      <style>{HERO_CSS}</style>
      <section ref={sectionRef} className="ph-section">

        {/* Full-bleed portal — z-index 0, bleeds into bg via mix-blend-mode */}
        <div className="ph-portal-wrap">
          <img src="/images/hero-portal.png" alt="" className="ph-portal-img" />
          <div className="ph-portal-glow" />
        </div>

        <div className="ph-noise" />

        {/* Main content */}
        <div className="ph-content">
          <div className="ph-left">
            <h1 className="hero-title ph-title">
              <div className="ph-overflow"><div className="hero-line ph-tline">THE FUTURE OF</div></div>
              <div className="ph-overflow">
                <div className="hero-line ph-tline ph-tline--cycle">
                  <span key={wordIdx} className="ph-word">{CYCLE_WORDS[wordIdx]}</span>
                </div>
              </div>
              <div className="ph-overflow"><div className="hero-line ph-tline">FANDOM.</div></div>
            </h1>

            <p className="hero-sub ph-sub">
              Shop premium club merch, play skill-based games, and earn PCC rewards — all{' '}
              <span className="ph-green">on-chain</span>.
            </p>

            <div className="ph-btns">
              <a href="/gaming" className="hero-btn ph-btn ph-btn--primary">
                <span>Play Now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
              <a href="/clubs" className="hero-btn ph-btn ph-btn--ghost">Explore Clubs</a>
            </div>

            <div className="hero-trusted ph-trusted">
              <span className="ph-trusted__label">TRUSTED BY 50,000+ FANS WORLDWIDE</span>
              <div className="ph-trusted__row">
                {TRUSTED_CLUBS.map(c => (
                  <div key={c.name} className="ph-crest" style={{ '--hover-bg': c.color, '--hover-border': c.border }}>
                    <img src={c.crest} alt={c.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: floating cards positioned over the portal image */}
          <div className="ph-right">
            {FEATURE_CARDS.map(f => (
              <a
                key={f.id}
                href={f.link}
                className={`hero-fcard ph-fcard ph-fcard--${f.position}`}
                style={{ '--fc-accent': f.accentColor, '--fc-glow': f.glowColor, '--fc-border': f.borderColor }}
              >
                <div className="ph-fcard__top">
                  <div className="ph-fcard__icon" style={{ color: f.accentColor, borderColor: f.borderColor }}>
                    {f.icon}
                  </div>
                  <div className="ph-fcard__copy">
                    <h4 className="ph-fcard__title" style={{ color: f.accentColor }}>{f.title}</h4>
                    <p className="ph-fcard__desc">{f.desc}</p>
                  </div>
                  <span className="ph-fcard__arrow">↗</span>
                </div>
                <div className="ph-fcard__bottom">
                  {f.crests && (
                    <div className="ph-mini-crests">
                      {f.crests.map((c, i) => (
                        <div key={i} className="ph-mini-crest"><img src={c} alt="" /></div>
                      ))}
                    </div>
                  )}
                  <span className="ph-fcard__stat" style={{ color: f.accentColor }}>{f.stat}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </section>
    </>
  );
};

const HERO_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500&display=swap');

  @keyframes word-in {
    from { opacity:0; transform:translateY(28px) skewY(3deg); filter:blur(6px); }
    to   { opacity:1; transform:none; filter:blur(0); }
  }
  @keyframes dot-pulse {
    0%,100% { opacity:1; box-shadow:0 0 8px #22d35e,0 0 20px rgba(34,211,94,.4); }
    50%      { opacity:.3; box-shadow:none; }
  }

  .ph-section {
    position: relative;
    width: 100%;
    min-height: 70vh;
    background: #04080d;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: 'Barlow', sans-serif;
  }

  /* ── Footballer: absolute, right half, blended via screen + radial mask ── */
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
    /* Screen blend removes the pitch-black background pixels */
    mix-blend-mode: screen;
    opacity: 0.85;
    /* Composite mask: radial vignette + aggressive left-edge fade */
    -webkit-mask-image:
      linear-gradient(
        to right,
        transparent 0%,
        transparent 8%,
        rgba(0,0,0,0.15) 18%,
        rgba(0,0,0,0.5) 30%,
        rgba(0,0,0,0.85) 42%,
        black 55%,
        black 85%,
        rgba(0,0,0,0.4) 95%,
        transparent 100%
      ),
      linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0,0,0,0.6) 10%,
        black 20%,
        black 80%,
        rgba(0,0,0,0.6) 92%,
        transparent 100%
      );
    -webkit-mask-composite: destination-in;
    mask-image:
      linear-gradient(
        to right,
        transparent 0%,
        transparent 8%,
        rgba(0,0,0,0.15) 18%,
        rgba(0,0,0,0.5) 30%,
        rgba(0,0,0,0.85) 42%,
        black 55%,
        black 85%,
        rgba(0,0,0,0.4) 95%,
        transparent 100%
      ),
      linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0,0,0,0.6) 10%,
        black 20%,
        black 80%,
        rgba(0,0,0,0.6) 92%,
        transparent 100%
      );
    mask-composite: intersect;
  }
  /* Soft emerald ambient glow behind the footballer */
  .ph-portal-glow {
    position: absolute;
    top: 10%; left: 8%;
    width: 84%; height: 80%;
    background:
      radial-gradient(ellipse at 55% 50%,
        rgba(34,211,94,0.07) 0%,
        rgba(80,255,175,0.04) 35%,
        rgba(168,85,247,0.03) 55%,
        transparent 75%
      );
    filter: blur(80px);
  }

  .ph-noise {
    position: absolute; inset: 0;
    z-index: 1; pointer-events: none;
    opacity: .3; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  .ph-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: grid;
    grid-template-columns: 550px 1fr;
    align-items: center;
    padding: 6rem 5vw 1.5rem 5vw;
    gap: 0;
  }

  /* ── LEFT ── */
  .ph-left { display:flex; flex-direction:column; gap:1.8rem; }
  .ph-title { margin:0; line-height:1; }
  .ph-overflow { overflow:hidden; }
  .ph-tline {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(3.5rem, 6vw, 6rem);
    color: #fff;
    text-transform: uppercase;
    line-height: .96;
    letter-spacing: -.01em;
    text-shadow: 0 2px 48px rgba(0,0,0,.9);
  }
  .ph-tline--cycle { display:flex; }
  .ph-word {
    display: inline-block;
    color: #05966A;
    animation: word-in .45s cubic-bezier(.22,1,.36,1) both;
  }
  .ph-sub {
    font-size: 1.15rem;
    color: rgba(255,255,255,.58);
    line-height: 1.6;
    max-width: 500px;
    margin: 0;
  }
  .ph-green { color:#22d35e; }

  .ph-btns { display:flex; gap:.75rem; align-items:center; }
  .ph-btn {
    display: inline-flex; align-items: center; gap:.45rem;
    padding: .75rem 1.6rem; border-radius: 100px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; font-size:.8rem;
    letter-spacing:.1em; text-transform:uppercase;
    text-decoration:none; cursor:pointer;
    transition: transform .2s, box-shadow .2s;
    white-space: nowrap;
  }
  .ph-btn--primary {
    background:#22d35e; color:#03120a;
    border:2px solid #22d35e;
    box-shadow:0 0 28px rgba(34,211,94,.45);
  }
  .ph-btn--primary:hover { transform:translateY(-3px); box-shadow:0 0 48px rgba(34,211,94,.65); }
  .ph-btn--ghost {
    background:transparent; color:#fff;
    border:1.5px solid rgba(255,255,255,.32);
    text-decoration:underline; text-underline-offset:3px;
  }
  .ph-btn--ghost:hover { background:rgba(255,255,255,.06); transform:translateY(-2px); }

  .ph-trusted { display:flex; flex-direction:column; gap:.7rem; margin-top: 0.5rem; }
  .ph-trusted__label {
    font-family:'Barlow Condensed',sans-serif; font-weight:700;
    font-size:.8rem; letter-spacing:.1em; color:rgba(255,255,255,.45);
  }
  .ph-trusted__row {
    display:flex; gap:.4rem;
    padding:.5rem .75rem;
    background:rgba(255,255,255,.035);
    border:1px solid rgba(255,255,255,.08);
    border-radius:100px; width:fit-content;
  }
  .ph-crest {
    width:42px; height:42px; border-radius:50%;
    border:1.5px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.04);
    display:flex; align-items:center; justify-content:center; overflow:hidden;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  .ph-crest:hover {
    transform: translateY(-4px) scale(1.15);
    background: var(--hover-bg, rgba(255,255,255,0.08));
    border-color: var(--hover-border, rgba(255,255,255,0.4));
    box-shadow: 0 8px 24px var(--hover-bg, rgba(0,0,0,0.6));
    z-index: 2;
  }
  .ph-crest img { width:28px; height:28px; object-fit:contain; transition: transform 0.2s ease; }
  .ph-crest:hover img { transform: scale(1.1); }

  /* ── RIGHT — card positions ── */
  .ph-right { position:relative; height:520px; }

  .ph-fcard {
    position: absolute;
    width: 180px;
    background: rgba(5, 10, 18, 0.7);
    border: 1px solid var(--fc-border, rgba(255,255,255,0.12));
    border-radius: 16px;
    backdrop-filter: blur(28px) saturate(1.5);
    -webkit-backdrop-filter: blur(28px) saturate(1.5);
    padding: 12px 14px 10px;
    text-decoration: none;
    cursor: pointer;
    display: flex; flex-direction: column; gap: 10px;
    transition: transform .22s ease, box-shadow .22s ease;
    box-shadow: 0 8px 36px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.07);
  }
  .ph-fcard:hover {
    transform: translateY(-6px) scale(1.025) !important;
    box-shadow: 0 20px 60px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1), 0 0 36px var(--fc-glow);
  }

  /* Mirror exact positions from the target screenshot */
  .ph-fcard--top-left    { top:4%;    left:-1%;  }
  .ph-fcard--bottom-left { bottom:6%; left:-1%;  }
  .ph-fcard--top-right   { top:4%;    right:-1%; }
  .ph-fcard--bottom-right{ bottom:6%; right:-1%; }

  .ph-fcard__top { display:flex; align-items:flex-start; gap:8px; }
  .ph-fcard__icon {
    flex-shrink:0; width:32px; height:32px;
    border-radius:10px; border:1.5px solid;
    display:flex; align-items:center; justify-content:center;
    opacity:.88; background:rgba(255,255,255,.04);
  }
  .ph-fcard__icon svg { width:16px; height:16px; }
  .ph-fcard__copy { flex:1; min-width:0; }
  .ph-fcard__title {
    font-family:'Barlow Condensed',sans-serif; font-weight:800;
    font-size:.85rem; letter-spacing:.05em; margin:0 0 2px; line-height:1;
  }
  .ph-fcard__desc {
    font-family:'Barlow Condensed',sans-serif; font-weight:600;
    font-size:.6rem; letter-spacing:.08em;
    color:rgba(255,255,255,.42); margin:0; line-height:1.3;
  }
  .ph-fcard__arrow { font-size:.7rem; color:rgba(255,255,255,.2); flex-shrink:0; margin-top:-2px; }
  .ph-fcard__bottom { display:flex; align-items:center; justify-content:space-between; gap:6px; }
  .ph-mini-crests { display:flex; }
  .ph-mini-crest {
    width:24px; height:24px; border-radius:50%;
    border:1.5px solid rgba(255,255,255,.15);
    background:rgba(255,255,255,.04);
    margin-right:-7px; overflow:hidden;
    display:flex; align-items:center; justify-content:center;
  }
  .ph-mini-crest img { width:15px; height:15px; object-fit:contain; }
  .ph-fcard__stat {
    font-family:'Barlow Condensed',sans-serif; font-weight:800;
    font-size:.78rem; letter-spacing:.04em; margin-left:auto; padding-left:10px;
  }

  @media (max-width:1024px) {
    .ph-content { grid-template-columns:360px 1fr; padding-top:6rem; }
  }
  @media (max-width:820px) {
    .ph-content { grid-template-columns:1fr; padding-top:5rem; }
    .ph-portal-wrap { width:100%; right:0; top:25%; height:75%; }
    .ph-right { height:480px; margin-top:2rem; }
    .ph-fcard { width:185px; }
    .ph-fcard--top-left    { top:0;    left:0;  }
    .ph-fcard--bottom-left { bottom:0; left:0;  }
    .ph-fcard--top-right   { top:0;    right:0; }
    .ph-fcard--bottom-right{ bottom:0; right:0; }
  }
  @media (max-width:480px) {
    .ph-section { min-height: auto; }
    .ph-content { padding: 5rem 4vw 2rem; }
    .ph-tline { font-size: clamp(2.4rem, 10vw, 3.5rem); }
    .ph-sub { font-size: clamp(0.85rem, 3vw, 1.05rem); max-width: 100%; }
    .ph-btns { flex-direction: column; gap: .6rem; width: 100%; }
    .ph-btn { width: 100%; justify-content: center; padding: .8rem 1.2rem; font-size: .75rem; }
    .ph-right { height: 320px; margin-top: 1rem; }
    .ph-fcard { width: 140px; padding: 10px 11px 8px; border-radius: 12px; }
    .ph-fcard__title { font-size: .72rem; }
    .ph-fcard__desc { font-size: .55rem; }
    .ph-fcard__icon { width: 26px; height: 26px; }
    .ph-fcard__icon svg { width: 13px; height: 13px; }
    .ph-fcard__stat { font-size: .68rem; }
    .ph-mini-crest { width: 20px; height: 20px; }
    .ph-mini-crest img { width: 12px; height: 12px; }
    .ph-trusted__label { font-size: .65rem; letter-spacing: .06em; }
    .ph-crest { width: 34px; height: 34px; }
    .ph-crest img { width: 22px; height: 22px; }
    .ph-portal-wrap { width: 100%; right: 0; top: 30%; height: 70%; opacity: 0.6; }
  }
  @media (max-width:360px) {
    .ph-content { padding: 4.5rem 3vw 1.5rem; }
    .ph-tline { font-size: 2.2rem; }
    .ph-right { height: 260px; }
    .ph-fcard { width: 120px; padding: 8px 9px 6px; }
    .ph-fcard__stat { display: none; }
    .ph-mini-crests { display: none; }
    .ph-fcard__bottom { display: none; }
  }
`;