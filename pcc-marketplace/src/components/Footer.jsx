import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';

const LINKS = {
  Platform: [
    { label: 'Home',        to: '/' },
    { label: 'Gaming Hub',  to: '/gaming' },
    { label: 'Contests',    to: '/contests' },
    { label: 'Rewards',     to: '/rewards' },
    { label: 'Clubs',       to: '/clubs' },
  ],
  Account: [
    { label: 'Login',       to: '/login' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'My Games',    to: '/my-games' },
    { label: 'History',     to: '/history' },
  ],
  Company: [
    { label: 'Club Onboarding', to: '/clubs/onboarding' },
    { label: 'Merchant Portal',  to: '/merchant/login' },
  ],
};

const SOCIAL = [
  { label: 'Twitter', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 5 9.2 5 9.2a6.3 6.3 0 0 0 3 .8C4 8 5 4 5 4a10.6 10.6 0 0 0 7 3.5C11.5 3.5 17 2.5 19 6.5A8.5 8.5 0 0 0 22 4z"></path></svg> },
  { label: 'Facebook', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.53-4H14V7a1 1 0 0 1 1-1h3z"></path></svg> },
  { label: 'WhatsApp', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> },
  { label: 'Instagram', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
];



function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Footer() {
  const lineRef = useRef(null);

  useEffect(() => {
    if (lineRef.current) {
      gsap.from(lineRef.current, {
        scaleX: 0, duration: 1.4, ease: 'power3.out', transformOrigin: 'left center',
      });
      gsap.to(lineRef.current, {
        backgroundPosition: '200% center',
        duration: 4, repeat: -1, ease: 'none',
      });
    }
  }, []);

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #020704 0%, #010402 100%)',
      borderTop: '1px solid rgba(0,230,118,0.08)',
      position: 'relative',
      overflow: 'visible',
      zIndex: 100,
    }}>
      {/* ── Background Effects ── */}
      {/* Shimmer top line */}
      <div
        ref={lineRef}
        style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,230,118,0.8) 40%, #00e676 50%, rgba(0,230,118,0.8) 60%, transparent 100%)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 12px rgba(0,230,118,0.4)',
        }}
      />

      {/* Radial glow blob */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: 1000, height: 400,
        background: 'radial-gradient(ellipse at top, rgba(0,230,118,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Huge Watermark */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 900, fontSize: '22vw',
        color: 'rgba(255,255,255,0.012)', whiteSpace: 'nowrap', pointerEvents: 'none',
        userSelect: 'none', zIndex: 0, letterSpacing: '-0.02em',
      }}>
        PaieCashFan
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '64px 6vw 32px', position: 'relative', zIndex: 1 }}>

        {/* ── Row 1: Brand + 3 Link columns ── */}
        <FadeUp delay={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>

            {/* Brand column */}
            <div>
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
                <img 
                  src="/images/logo.png" 
                  alt="PaieCashFan Logo" 
                  style={{
                    width: 64, height: 64,
                    objectFit: 'contain',
                    marginRight: 4
                  }}
                />
                <div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', lineHeight: 1 }}>
                    PaieCash<span style={{ color: '#00e676' }}>Fan</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(0,230,118,0.7)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4, fontWeight: 700 }}>
                    Emerald Vault Gaming
                  </div>
                </div>
              </Link>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 320 }}>
                The premier PCC-powered gaming marketplace for South African sports fans. Win tournaments, earn PCC, and shop official club merchandise.
              </p>
              {/* Social */}
              <div style={{ display: 'flex', gap: 10 }}>
                {SOCIAL.map(s => (
                  <a
                    key={s.label} href={s.href} title={s.label}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,230,118,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(0,230,118,0.4)';
                      e.currentTarget.style.color = '#00e676';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,230,118,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >{s.icon}</a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([section, links], si) => (
              <FadeUp key={section} delay={0.1 + si * 0.08}>
                <div>
                  <div style={{
                    fontFamily: "'Rajdhani', sans-serif", fontWeight: 800,
                    fontSize: 13, textTransform: 'uppercase', letterSpacing: '2px',
                    color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 10px #00e676' }} />
                    {section}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {links.map(l => (
                      <Link
                        key={l.to} to={l.to}
                        style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#00e676';
                          e.currentTarget.style.transform = 'translateX(6px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >{l.label}</Link>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </FadeUp>



        {/* ── Row 3: Bottom bar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            © {new Date().getFullYear()} PaieCashFan Market · Built for South African gaming
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy Policy', 'Terms of Service', 'Responsible Gaming'].map(t => (
              <a
                key={t} href="#"
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >{t}</a>
            ))}
          </div>
        </div>

      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 960px) {
          footer [style*="grid-template-columns: 1.8fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer [style*="grid-template-columns: 1.8fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer > div { padding: 40px 16px 24px !important; }
          footer [style*="justify-content: space-between"][style*="flexWrap"],
          footer [style*="justify-content: space-between"][style*="flex-wrap"] {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 12px !important;
          }
          footer [style*="display: flex"][style*="gap: 28px"],
          footer [style*="gap: 28"] {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
