import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { useChatContext } from '../context/ChatContext';
import { useProfile } from '../hooks/useProfile';
import GoogleTranslateWidget from './GoogleTranslateWidget';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/clubs', label: 'Clubs' },
  { to: '/feed', label: 'Feed' },
  { to: '/gaming', label: 'Gaming' },
  { to: '/rewards', label: 'Rewards' },
];

export default function Navbar({
  user, liveBalance, cartCount, onCartOpen,
  onLogout, buyPccUrl, profileOpen, setProfileOpen,
}) {
  const { totalUnread } = useChatContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profileImage } = useProfile(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen, setProfileOpen]);

  const LiveBalance = () =>
    liveBalance === null ? null : (
      <span className="notranslate">{liveBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
    );

  return (
    <>
      <motion.header
        className="pcc-mobile-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          display: 'flex', justifyContent: 'center',
          // Smoothly animate padding to squeeze the inner nav from full width down to 820px
          padding: scrolled ? '10px max(16px, calc(50vw - 410px))' : '16px 24px',
          transition: 'padding 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ── Capsule: 100% width at top, squeezed on scroll ── */}
        <nav style={{
          width: '100%',
          height: scrolled ? 50 : 64,
          background: scrolled
            ? 'rgba(6,15,10,0.95)'
            : 'rgba(6,15,10,0.6)',
          border: scrolled
            ? '1px solid rgba(0,230,118,0.3)'
            : '1px solid rgba(255,255,255,0.09)',
          borderRadius: 999,
          backdropFilter: 'blur(24px) saturate(180%)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px 0 14px',
          gap: 0,
          transition: 'height 0.45s cubic-bezier(0.22,1,0.36,1), background 0.4s, border-color 0.4s, box-shadow 0.4s',
          boxShadow: scrolled
            ? '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,230,118,0.07)'
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}>

          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: 0, flexShrink: 0, marginRight: 8,
            }}
          >
            <img
              src="/images/logo.png"
              alt="PaieCashFan Logo"
              style={{
                width: scrolled ? 36 : 42,
                height: scrolled ? 36 : 42,
                objectFit: 'contain',
                marginRight: 4,
                filter: 'drop-shadow(0 0 10px rgba(0,230,118,0.2))'
              }}
            />
            <span className="notranslate pcc-brand-text" style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 800,
              fontSize: scrolled ? 18 : 22,
              color: '#fff',
              letterSpacing: '-0.3px', whiteSpace: 'nowrap',
              transition: 'font-size 0.4s',
            }}>
              PaieCash<span style={{ color: '#00e676' }}>Fan</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-links" style={{
            display: 'flex', alignItems: 'center',
            gap: 1, flex: 1, justifyContent: 'center',
          }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={({ isActive }) => ({
                  padding: scrolled ? '4px 9px' : '5px 10px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: scrolled ? 11 : 12,
                  textTransform: 'uppercase', letterSpacing: '0.7px',
                  color: isActive ? '#00e676' : 'rgba(255,255,255,0.55)',
                  background: isActive ? 'rgba(0,230,118,0.12)' : 'transparent',
                  border: isActive
                    ? '1px solid rgba(0,230,118,0.25)'
                    : '1px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                })}
              >
                {link.live && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 6,
                    borderRadius: '50%', background: '#ef4444',
                    animation: 'navLivePulse 1.5s infinite', flexShrink: 0,
                  }} />
                )}
                {link.label}
              </NavLink>
            ))}
            <style>{`
              @keyframes navLivePulse {
                0%   { transform: scale(1); opacity: 1; }
                50%  { transform: scale(1.6); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>

          {/* Right Actions — hidden on mobile via CSS */}
          <div className="nav-actions-right" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <GoogleTranslateWidget scrolled={scrolled} dropDirection="down" />

            {user && (
              <>
                <NotificationBell />
                <Link to="/users" className="nav-link" style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: scrolled ? 34 : 38, height: scrolled ? 34 : 38, transition: 'all 0.4s', flexShrink: 0,
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,230,118,0.5)'; e.currentTarget.style.color = '#00e676'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </Link>

                {/* Cart */}
                <button
                  onClick={onCartOpen}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%', color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: scrolled ? 34 : 38,
                    height: scrolled ? 34 : 38,
                    transition: 'all 0.4s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,230,118,0.5)';
                    e.currentTarget.style.color = '#00e676';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{
                          position: 'absolute', top: -3, right: -3,
                          background: '#00e676', color: '#060f0a',
                          fontSize: 9, fontWeight: 900,
                          width: 16, height: 16, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >{cartCount}</motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </>
            )}


            {/* User pill / Login */}
            {user ? (
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfileOpen(p => !p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(0,230,118,0.08)',
                    border: '1px solid rgba(0,230,118,0.22)',
                    borderRadius: 999,
                    padding: scrolled ? '4px 12px 4px 5px' : '5px 14px 5px 6px',
                    cursor: 'pointer', color: 'white',
                    transition: 'all 0.2s',
                  }}
                  className="pcc-user-pill"
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,230,118,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(0,230,118,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,230,118,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0,230,118,0.22)';
                  }}
                >
                  <div style={{
                    width: scrolled ? 24 : 28,
                    height: scrolled ? 24 : 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00e676, #00b248)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: scrolled ? 11 : 13, fontWeight: 900, color: '#060f0a', flexShrink: 0,
                    transition: 'all 0.4s', overflow: 'hidden',
                  }}>
                    <img
                      src={profileImage}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentNode.textContent = user?.name?.[0]?.toUpperCase() || 'U';
                      }}
                    />
                  </div>
                  <span className="notranslate" style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: scrolled ? 13 : 15,
                    fontWeight: 800, color: '#00e676', whiteSpace: 'nowrap',
                    transition: 'font-size 0.4s',
                  }}>
                    <LiveBalance /> PCC
                  </span>
                  <motion.svg
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    width="10" height="10" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.35)"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          background: 'rgba(8,20,12,0.97)',
                          border: '1px solid rgba(0,230,118,0.18)',
                          borderRadius: 20,
                          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                          minWidth: 220, zIndex: 999, overflow: 'hidden',
                        }}
                        className="pcc-profile-dropdown"
                      >
                        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(0,230,118,0.1)' }}>
                          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>
                            {user?.name || 'Player'}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                            {user?.email}
                          </div>
                          <div style={{
                            marginTop: 10, padding: '8px 10px',
                            background: 'rgba(0,230,118,0.07)',
                            border: '1px solid rgba(0,230,118,0.18)',
                            borderRadius: 12,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span className="notranslate" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: '#00e676', fontWeight: 800 }}>
                              <LiveBalance /> PCC
                            </span>
                            <button
                              onClick={() => { window.open(buyPccUrl, '_blank'); setProfileOpen(false); }}
                              style={{
                                fontSize: 11, color: '#060f0a', background: '#00e676',
                                border: 'none', borderRadius: 999, padding: '3px 10px',
                                cursor: 'pointer', fontWeight: 900,
                              }}
                            >Buy PCC</button>
                          </div>
                        </div>

                        <div style={{ padding: 6 }}>
                          {[
                            { to: '/profile', label: '👤 My Profile' },
                            { to: '/history', label: '📜 History' },
                            { to: '/leaderboard', label: '🏆 Leaderboard' },
                            { to: '/my-games', label: '🎮 My Games' },
                          ].map(item => (
                            <Link
                              key={item.to} to={item.to}
                              onClick={() => setProfileOpen(false)}
                              style={{
                                display: 'block', padding: '9px 10px',
                                color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                                fontSize: 13, fontWeight: 600, borderRadius: 12,
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,230,118,0.07)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(0,230,118,0.1)', padding: 6 }}>
                          <button
                            onClick={() => { onLogout(); setProfileOpen(false); }}
                            style={{
                              width: '100%', padding: '9px 10px',
                              background: 'none', border: 'none', color: '#ff5252',
                              cursor: 'pointer', fontSize: 13, fontWeight: 700,
                              borderRadius: 12, textAlign: 'left', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,50,50,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  padding: '7px 20px', borderRadius: 999,
                  border: '1px solid rgba(0,230,118,0.35)',
                  color: '#00e676', textDecoration: 'none',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700, fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,230,118,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Login</Link>
            )}

          </div>

          {/* Hamburger — outside nav-actions-right so it stays visible on mobile */}
          <button
            onClick={() => setMobileOpen(p => !p)}
            className="nav-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999, padding: '8px 10px',
              cursor: 'pointer', color: '#fff',
              flexDirection: 'column', gap: 4,
              alignItems: 'center',
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={
                  mobileOpen
                    ? i === 0 ? { rotate: 45, y: 6 }
                      : i === 1 ? { opacity: 0 }
                        : { rotate: -45, y: -6 }
                    : { rotate: 0, y: 0, opacity: 1 }
                }
                style={{
                  display: 'block', width: 18, height: 1.5,
                  background: 'white', borderRadius: 2,
                }}
              />
            ))}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu — full slide panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: scrolled ? 66 : 86,
                left: 12, right: 12, zIndex: 999,
                background: 'rgba(6,15,10,0.98)',
                border: '1px solid rgba(0,230,118,0.15)',
                borderRadius: 20,
                backdropFilter: 'blur(28px)',
                padding: '8px 0',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
              }}
            >
              {/* User card at top */}
              {user && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#00e676,#00b248)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#060f0a', flexShrink: 0, overflow: 'hidden' }}>
                    <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display='none'; e.target.parentNode.textContent=user?.name?.[0]?.toUpperCase()||'U'; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>{user?.name || 'Player'}</div>
                    <div className="notranslate" style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 800, color: '#00e676' }}><LiveBalance /> PCC</div>
                  </div>
                  <button onClick={() => { window.open(buyPccUrl, '_blank'); setMobileOpen(false); }} style={{ fontSize: 11, color: '#060f0a', background: '#00e676', border: 'none', borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontWeight: 900, flexShrink: 0 }}>Buy PCC</button>
                </div>
              )}
              {/* Nav links */}
              <div style={{ padding: '4px 8px' }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <NavLink to={link.to} end={link.end} onClick={() => setMobileOpen(false)}
                      style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, color: isActive ? '#00e676' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '1px', background: isActive ? 'rgba(0,230,118,0.08)' : 'none', marginBottom: 1, transition: 'all 0.15s' })}
                    >{link.label}</NavLink>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              {user && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <button onClick={() => { onCartOpen(); setMobileOpen(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', position: 'relative', fontSize: 11, fontWeight: 600 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Cart{cartCount > 0 && <span style={{ position: 'absolute', top: 4, right: '30%', background: '#00e676', color: '#060f0a', fontSize: 9, fontWeight: 900, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                  </button>
                  <Link to="/users" onClick={() => setMobileOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Friends
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile
                  </Link>
                </div>
              )}
              {/* Bottom Actions Row: Login/Logout + Translation */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{ flex: 0.7 }}>
                  <GoogleTranslateWidget scrolled={scrolled} dropDirection="up" variant="full" />
                </div>
                <div style={{ flex: 0.3 }}>
                  {user ? (
                    <button
                      onClick={() => { onLogout(); setMobileOpen(false); }}
                      style={{
                        width: '100%',
                        height: 44,
                        fontSize: 13,
                        color: '#ff5252',
                        background: 'rgba(255,50,50,0.08)',
                        border: '1px solid rgba(255,50,50,0.15)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: "'Rajdhani', sans-serif",
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(0,230,118,0.1)',
                        border: '1px solid rgba(0,230,118,0.25)',
                        color: '#00e676',
                        textDecoration: 'none',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontWeight: 800,
                        fontSize: 15,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-actions-right { display: none !important; }
        }
        @media (max-width: 600px) {
          .pcc-mobile-header { padding: 10px 10px !important; }
        }
      `}</style>
    </>
  );
}