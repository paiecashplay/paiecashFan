import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { useAuth } from '../App';
import { useWallet } from '../context/WalletContext';
import { GAMES, CATEGORIES } from '../data/gamesData';
import { LEADERBOARD_DATA, LIVE_ACTIVITIES, TICKER_ITEMS } from '../data/leaderboardMock';
import '../gaming.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80';
const FALLBACK_IMG = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
const GAME_IMGS = {
  'fantasy-cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=75',
  'fantasy-football': 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=75',
  'match-predictor': 'https://images.unsplash.com/photo-1461896836934-bd45ba8fccc7?w=400&q=75',
  'player-auction': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=75',
  'trivia-blitz': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=75',
  'club-war': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=75',
  'cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=75',
  'braai_poker': 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&q=75',
  'slots': '/images/games/slots.png',
  'roulette': '/images/games/roulette.png',
  // ── Generated images ──────────────────────────────
  'lottery649': '/images/games/lottery649.png',
  'penalty-shootout': '/images/games/penalty-shootout.png',
  'mega-league': '/images/games/mega-league.png',
  'loto': '/images/games/bingo.png',
  'aviator': '/images/games/aviator.png',
};

function BrushDivider({ fill = '#0a1a0f', flip }) {
  return (
    <div className="brush-divider" style={flip ? { transform: 'scaleY(-1)' } : undefined}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,20 C120,45 240,8 360,28 C480,48 540,5 720,22 C900,40 1020,10 1140,30 C1260,50 1380,15 1440,25 L1440,60 L0,60 Z" fill={fill} />
      </svg>
    </div>
  );
}

function SectionHeader({ title, count, viewAll, children }) {
  return (
    <div className="section-header">
      <div className="section-accent-bar" />
      <span className="section-title">{title}</span>
      {count != null && <span className="section-count">{count} games</span>}
      <div className="section-line" />
      {viewAll && <span className="section-viewall" onClick={viewAll}>View All →</span>}
      {children}
    </div>
  );
}

function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, lastShoot = 0, shootingStar = null;
    const particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = document.documentElement.scrollHeight; }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 70; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1 + 0.3, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3, opacity: Math.random() * 0.1 + 0.05 });
    }
    function animate(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`; ctx.fill();
      });
      if (!shootingStar && now - lastShoot > 7000) {
        shootingStar = { x: -20, y: Math.random() * canvas.height * 0.4, speed: 10, length: 80, opacity: 0.7 };
        lastShoot = now;
      }
      if (shootingStar) {
        shootingStar.x += shootingStar.speed; shootingStar.y += shootingStar.speed * 0.25; shootingStar.opacity -= 0.006;
        const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, shootingStar.x - shootingStar.length, shootingStar.y - shootingStar.length * 0.25);
        grad.addColorStop(0, `rgba(0,230,118,${shootingStar.opacity})`); grad.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.length, shootingStar.y - shootingStar.length * 0.25);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
        if (shootingStar.x > canvas.width + 100 || shootingStar.opacity <= 0) shootingStar = null;
      }
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [canvasRef]);
}

export default function Gaming() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRef, setCopied] = useState(false);
  const { user, wallet } = useAuth();
  const { balance: liveBalance } = useWallet();
  const navigate = useNavigate();
  const balance = liveBalance ?? wallet?.balance ?? 0;

  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const filterBarRef = useRef(null);
  const tabRefs = useRef({});
  const gridRef = useRef(null);
  const hiwRef = useRef(null);
  const countdownRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ x: 0, w: 0 });

  const totalPlayers = GAMES.reduce((s, g) => s + g.players, 0);
  const liveCount = GAMES.filter(g => g.status === 'live').length;
  const totalPrize = GAMES.reduce((s, g) => s + g.prizePool, 0);
  const featuredGames = [...GAMES].filter(g => g.status === 'live').sort((a, b) => b.prizePool - a.prizePool).slice(0, 3);
  const filtered = (selectedCategory === 'all' ? GAMES : GAMES.filter(g => g.category === selectedCategory))
    .filter(g => !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useParticles(canvasRef);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current && h > 0) progressRef.current.style.width = `${(window.scrollY / h) * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const updateIndicator = useCallback(() => {
    const tab = tabRefs.current[selectedCategory];
    const bar = filterBarRef.current;
    if (tab && bar) {
      const barRect = bar.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setIndicatorStyle({ x: tabRect.left - barRect.left, w: tabRect.width });
    }
  }, [selectedCategory]);

  useEffect(() => { updateIndicator(); window.addEventListener('resize', updateIndicator); return () => window.removeEventListener('resize', updateIndicator); }, [updateIndicator]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = Array.from(grid.children).indexOf(e.target);
        e.target.style.transitionDelay = `${idx * 60}ms`;
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }), { threshold: 0.15 });
    Array.from(grid.children).forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, [filtered]);

  useEffect(() => {
    const section = hiwRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        section.querySelectorAll('.hiw-step, .hiw-connector').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 150));
        observer.unobserve(e.target);
      }
    }), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const endTime = Date.now() + 6 * 3600000 + 22 * 60000;
    const tick = setInterval(() => {
      const r = Math.max(0, endTime - Date.now());
      const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
      const str = `${h}h ${String(m).padStart(2, '0')}m`;
      Object.values(countdownRefs.current).forEach(el => { if (el) el.textContent = `Ends in ${str}`; });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleCopy = () => { navigator.clipboard.writeText('PCC-INVITE-A3K9X'); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleCardClick = (game) => {
    const isSA = game.tags?.includes('SA Exclusive');
    if (isSA || game.id === 'lottery649' || game.id === 'loto') {
      if (game.id === 'braai_poker') navigate('/games/braai-poker');
      else if (game.id === 'loto') navigate('/games/loto');
      else if (game.id === 'lottery649') navigate('/games/lottery649');
      else navigate('/games/cricket');
    } else {
      navigate(`/gaming/lobby/${game.id}`);
    }
  };

  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const activitiesDouble = [...LIVE_ACTIVITIES, ...LIVE_ACTIVITIES];

  return (
    <div className="gaming-page">
      <div className="gaming-bg-mesh" />
      <canvas ref={canvasRef} className="gaming-particles" />
      <div ref={progressRef} className="scroll-progress" />

      <div className="gaming-content">

        {/* ═══ HERO ═══════════════════════════════════════ */}
        <div className="hero-wrap">
          <div className="hero-image-container">
            <div className="hero-image-overlay" />
            <img className="hero-image" src={HERO_IMG} alt="Sports action" loading="eager" onError={e => { e.target.src = FALLBACK_IMG; }} />
          </div>
          <section className="hero-banner">
            <div className="hero-left">
              <div className="hero-eyebrow">LIVE TOURNAMENTS</div>
              <h1 className="hero-headline">
                <span>Compete. Predict.</span>
                <span>Win Real Prizes.</span>
              </h1>
              <p className="hero-subheading">
                Join {totalPlayers.toLocaleString()} players competing across {liveCount} live games. New contests every hour.
              </p>
              <div className="hero-stats">
                <span className="hero-stat-pill">🏆 {totalPrize.toLocaleString()} PCC In Prizes</span>
                <span className="hero-stat-pill">🎮 {GAMES.length} Games</span>
                <span className="hero-stat-pill">👥 {(totalPlayers / 1000).toFixed(1)}K Players</span>
              </div>
              <div className="hero-ctas">
                <button className="hero-btn-primary" onClick={() => document.querySelector('.gaming-grid')?.scrollIntoView({ behavior: 'smooth' })}>Start Playing</button>
                <button className="hero-btn-secondary" onClick={() => document.querySelector('.hiw-section')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</button>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-ticker">
                <div className="hero-ticker-track">
                  {activitiesDouble.map((a, i) => (
                    <div key={i} className="hero-ticker-item">
                      <span>{a.emoji}</span>
                      <span><strong>{a.user}</strong> {a.action} in {a.game}</span>
                      <span className="ticker-time">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <BrushDivider fill="#0a1a0f" />

        {/* ═══ LIVE TICKER ════════════════════════════════ */}
        <div className="live-ticker-bar">
          <div className="live-ticker-label">LIVE UPDATES</div>
          <div className="live-ticker-scroll-wrap">
            <div className="live-ticker-scroll">
              {tickerDouble.map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>
        </div>

        {/* ═══ CONTESTS ═══════════════════════════════════ */}
        <div className="contests-section">
          <SectionHeader title="Active Contests" viewAll={() => navigate('/contests')} />
          <div className="contest-grid">
            {featuredGames.map(game => {
              const isSA = game.tags?.includes('SA Exclusive');
              return (
                <div key={game.id} className={`contest-card${isSA ? ' gold' : ''}`} onClick={() => handleCardClick(game)}>
                  <img className="contest-card-img" src={GAME_IMGS[game.id] || HERO_IMG} alt={game.title} loading="lazy" onError={e => { e.target.src = FALLBACK_IMG; }} />
                  <div className="contest-card-overlay" />
                  <div className="contest-card-body">
                    <span className="contest-timer" ref={el => { countdownRefs.current[game.id] = el; }}>Ends in 6h 22m</span>
                    <span className="contest-prize">{game.prizePool.toLocaleString()} PCC</span>
                    <div className="contest-info">
                      <div className="contest-title">{game.title}</div>
                      <div className="contest-desc">{game.description}</div>
                      <div className="contest-progress">
                        <div className="contest-progress-fill" style={{ width: `${Math.min(100, (game.players / (game.maxPlayers || 1)) * 100)}%` }} />
                      </div>
                      <div className="contest-spots">{game.players.toLocaleString()} / {game.maxPlayers.toLocaleString()} spots filled</div>
                      <button className="contest-join">Join Contest</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BrushDivider fill="#060f0a" flip />

        {/* ═══ FILTER BAR ═════════════════════════════════ */}
        <div className="games-section">
          <div className="filter-bar">
            <div className="filter-tabs-wrap" ref={filterBarRef}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} ref={el => { tabRefs.current[cat.id] = el; }}
                  className={`filter-tab${selectedCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >{cat.label}</button>
              ))}
              <span className="filter-indicator" style={{ transform: `translateX(${indicatorStyle.x}px)`, width: indicatorStyle.w }} />
            </div>
            <input className="filter-search" placeholder="Search games..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          {/* ═══ ALL GAMES ══════════════════════════════════ */}
          <SectionHeader title="All Games" count={filtered.length} />
          {filtered.length === 0 ? (
            <div className="no-results">
              <Gamepad2 size={48} style={{ opacity: 0.4 }} />
              <h3>No games found</h3>
              <p>Try a different filter or search term.</p>
            </div>
          ) : (
            <div className="gaming-grid" ref={gridRef}>
              {filtered.map(game => (
                <div key={game.id} className="game-card" onClick={() => handleCardClick(game)}>
                  <div className="game-card-banner" style={{ background: game.gradient }}>
                    <img src={GAME_IMGS[game.id] || FALLBACK_IMG} alt="" loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }} />
                    {game.status === 'live' && <span className="card-live-badge">LIVE</span>}
                    {game.prizePool > 0 && <span className="card-prize-badge">{game.prizePool.toLocaleString()} PCC</span>}
                  </div>
                  <div className="game-card-body">
                    <div className="game-card-title">{game.title}</div>
                    <div className="game-card-desc">{game.description}</div>
                    <div className="game-card-tags">
                      {game.tags.map(tag => <span key={tag} className="game-card-tag">{tag}</span>)}
                    </div>
                    <div className="game-card-stats">
                      <div className="game-card-stat">
                        <div className="game-card-stat-label">Entry</div>
                        <div className="game-card-stat-value">{game.entryFee} PCC</div>
                      </div>
                      <div className="game-card-stat">
                        <div className="game-card-stat-label">Prize Pool</div>
                        <div className="game-card-stat-value">{game.prizePool.toLocaleString()}</div>
                      </div>
                      <div className="game-card-stat">
                        <div className="game-card-stat-label">Players</div>
                        <div className="game-card-stat-value">{game.players.toLocaleString()}</div>
                      </div>
                    </div>
                    <button className="game-card-cta">{game.status === 'live' ? 'Play Now' : 'View Details'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ LEADERBOARD ═════════════════════════════════ */}
        <SectionHeader title="Today's Top Winners" />
        <div className="lb-section">
          <div className="lb-card">
            <div className="lb-header">🏆 Leaderboard</div>
            <table className="lb-table"><tbody>
              {LEADERBOARD_DATA.map(row => (
                <tr key={row.rank} className={`lb-row-${row.rank}`}>
                  <td className="lb-rank">{row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : `#${row.rank}`}</td>
                  <td><div className="lb-user"><div className="lb-avatar">{row.avatar}</div><div><div className="lb-username">{row.username}</div><div className="lb-game">{row.game}</div></div></div></td>
                  <td className="lb-prize">{row.prize.toLocaleString()} PCC</td>
                </tr>
              ))}
            </tbody></table>
            <span className="lb-cta" onClick={() => navigate('/leaderboard')}>See Full Leaderboard →</span>
          </div>
          <div className="promo-stack">
            <div className="promo-card">
              <h3>🎁 Invite Friends, Earn 50 PCC</h3>
              <p>Share your code - when they play their first game, you both earn PCC.</p>
              <div className="referral-code">
                <input readOnly value="PCC-INVITE-A3K9X" />
                <button onClick={handleCopy}>{copiedRef ? '✓ Copied!' : 'Copy'}</button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ HOW IT WORKS ════════════════════════════════ */}
        <section className="hiw-section" ref={hiwRef}>
          <SectionHeader title="How It Works" />
          <div className="hiw-steps">
            <div className="hiw-step"><div className="hiw-step-num">1</div><div className="hiw-step-icon">🎮</div><div className="hiw-step-title">Pick a Game</div><div className="hiw-step-desc">Choose from fantasy sports, predictions, casual games or tournaments.</div></div>
            <div className="hiw-connector" />
            <div className="hiw-step"><div className="hiw-step-num">2</div><div className="hiw-step-icon">⚡</div><div className="hiw-step-title">Enter & Play</div><div className="hiw-step-desc">Pay the entry fee in PCC and compete against other players in real-time.</div></div>
            <div className="hiw-connector" />
            <div className="hiw-step"><div className="hiw-step-num">3</div><div className="hiw-step-icon">🏆</div><div className="hiw-step-title">Win Prizes</div><div className="hiw-step-desc">Top performers win PCC from the prize pool - withdraw or play again!</div></div>
          </div>
        </section>


      </div>
    </div>
  );
}
