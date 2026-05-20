import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../components/Toast';
import '../gaming.css';

/* ── Reliable Unsplash images (auto=format always works) ── */
const GAME_IMGS = {
  aviator: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=700&auto=format&fit=crop&q=80',
  slots: 'https://images.unsplash.com/photo-1596838132731-3301c3fae4c3?w=700&auto=format&fit=crop&q=80',
  roulette: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&auto=format&fit=crop&q=80',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19212a4b423a?w=700&auto=format&fit=crop&q=80',
  football: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=700&auto=format&fit=crop&q=80',
  'fantasy-cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=700&auto=format&fit=crop&q=80',
  'fantasy-football': 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=700&auto=format&fit=crop&q=80',
  'match-predictor': 'https://images.unsplash.com/photo-1461896836934-bd45ba8fccc7?w=700&auto=format&fit=crop&q=80',
  'player-auction': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=700&auto=format&fit=crop&q=80',
  'trivia-blitz': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=700&auto=format&fit=crop&q=80',
  'penalty-shootout': 'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?w=700&auto=format&fit=crop&q=80',
  'mega-league': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&auto=format&fit=crop&q=80',
  'club-war': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700&auto=format&fit=crop&q=80',
  braai_poker: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=700&auto=format&fit=crop&q=80',
};

/* ── Gradient fallback if image fails ── */
const FALLBACK = {
  aviator: 'linear-gradient(160deg,#0a2a1a 0%,#041008 100%)',
  slots: 'linear-gradient(160deg,#1a0a28 0%,#0a0414 100%)',
  roulette: 'linear-gradient(160deg,#280a0a 0%,#140404 100%)',
  cricket: 'linear-gradient(160deg,#0a2818 0%,#041408 100%)',
  football: 'linear-gradient(160deg,#0a1828 0%,#040c14 100%)',
  default: 'linear-gradient(160deg,#0a1a0f 0%,#060f0a 100%)',
};

/* ── Accent colour per game ── */
const ACCENT = {
  aviator: '#00e676', slots: '#a855f7', roulette: '#ef4444',
  cricket: '#22d3ee', football: '#f59e0b', default: '#00e676',
};

const GAME_ICONS = {
  aviator: '✈️', slots: '🎰', roulette: '🎡',
  cricket: '🏏', football: '⚽', default: '🎮',
};

const STATUS_META = {
  live: { dot: '#ff3232', label: 'LIVE', color: '#ff5252', bg: 'rgba(255,50,50,0.15)', border: 'rgba(255,50,50,0.4)' },
  upcoming: { dot: '#ffd60a', label: 'UPCOMING', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)', border: 'rgba(255,214,10,0.4)' },
  completed: { dot: '#6b7280', label: 'ENDED', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

const TABS = ['live', 'upcoming', 'completed', 'all'];

/* ══════════════════════════════════════════════════════════
   ContestCard - cinema-style image banner + dark info panel
══════════════════════════════════════════════════════════ */
function ContestCard({ contest, isEntered, cantAfford, entering, onEnter }) {
  const [imgErr, setImgErr] = useState(false);

  const isEnded = contest.status === 'completed';
  const status = STATUS_META[contest.status] || STATUS_META.completed;
  const accent = ACCENT[contest.game_id] || ACCENT.default;
  const imgSrc = GAME_IMGS[contest.game_id];
  const fallback = FALLBACK[contest.game_id] || FALLBACK.default;
  const fillPct = contest.max_entries
    ? Math.min(100, Math.round((contest.current_entries / contest.max_entries) * 100)) : 0;

  const btnLabel = () => {
    if (entering === contest.id) return null; // spinner shown separately
    if (isEntered) return '✓  ENTERED';
    if (isEnded) return 'CONTEST ENDED';
    if (cantAfford) return '⚠  INSUFFICIENT PCC';
    return contest.entry_fee_pcc > 0 ? `ENTER - ${contest.entry_fee_pcc} PCC` : 'ENTER FREE';
  };

  const btnBg = isEntered ? 'transparent'
    : isEnded ? 'rgba(255,255,255,0.05)'
      : cantAfford ? 'rgba(255,50,50,0.1)'
        : accent;

  const btnColor = isEntered ? accent
    : isEnded ? 'rgba(255,255,255,0.3)'
      : cantAfford ? '#ff5252'
        : '#060f0a';

  return (
    <div className="cv-card" style={{ '--accent': accent }}>

      {/* ── IMAGE BANNER (top 55% of card) ── */}
      <div className="cv-card-img-wrap">
        {imgSrc && !imgErr ? (
          <img
            className="cv-card-img"
            src={imgSrc}
            alt={contest.title}
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: fallback }} />
        )}
        {/* deep scrim so text is always readable */}
        <div className="cv-card-scrim" />

        {/* Status pill - floats on image */}
        <div className="cv-status-pill" style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}>
          <span className="cv-status-dot" style={{ background: status.dot }} />
          {status.label}
        </div>

        {/* Prize - floats top-right */}
        <div className="cv-prize-badge">
          <div className="cv-prize-label">Prize Pool</div>
          <div className="cv-prize-value" style={{ color: accent }}>
            {contest.prize_pool_pcc?.toLocaleString()} <span style={{ fontSize: '13px', opacity: .7 }}>PCC</span>
          </div>
        </div>
      </div>

      {/* Icon - centred on image boundary */}
      <div className="cv-center-icon" style={{ border: `1px solid ${accent}60` }}>
        <div className="cv-center-icon-inner" style={{ background: `${accent}22` }}>
          <span style={{ fontSize: '26px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{GAME_ICONS[contest.game_id] || GAME_ICONS.default}</span>
        </div>
      </div>

      {/* ── INFO PANEL (bottom) ── */}
      <div className="cv-card-body">

        <h3 className="cv-title">{contest.title}</h3>
        <p className="cv-desc">{contest.description}</p>

        {/* Stats row */}
        <div className="cv-stats">
          <div className="cv-stat">
            <div className="cv-stat-label">Entry Fee</div>
            <div className="cv-stat-value">{contest.entry_fee_pcc > 0 ? `${contest.entry_fee_pcc} PCC` : 'FREE'}</div>
          </div>
          <div className="cv-stat-divider" />
          <div className="cv-stat">
            <div className="cv-stat-label">Players</div>
            <div className="cv-stat-value">
              {contest.current_entries}
              <span style={{ opacity: .35, fontWeight: 400, fontSize: '13px' }}>/{contest.max_entries || '∞'}</span>
            </div>
          </div>
          {contest.max_entries > 0 && (
            <>
              <div className="cv-stat-divider" />
              <div className="cv-stat">
                <div className="cv-stat-label">Filled</div>
                <div className="cv-stat-value" style={{ color: fillPct > 80 ? '#ff5252' : accent }}>{fillPct}%</div>
              </div>
            </>
          )}
        </div>

        {/* Fill bar */}
        {contest.max_entries > 0 && (
          <div className="cv-fill-track">
            <div className="cv-fill-bar" style={{ width: `${fillPct}%`, background: fillPct > 80 ? '#ff5252' : accent }} />
          </div>
        )}

        {/* CTA */}
        <button
          className="cv-cta"
          onClick={e => { e.stopPropagation(); onEnter(contest); }}
          disabled={entering === contest.id || isEnded || isEntered || cantAfford}
          style={{
            background: btnBg,
            color: btnColor,
            border: (isEntered || cantAfford) ? `1px solid ${isEntered ? accent : '#ff5252'}44` : 'none',
            boxShadow: (!isEntered && !isEnded && !cantAfford) ? `0 4px 20px ${accent}44` : 'none',
            cursor: (isEntered || isEnded || cantAfford) ? 'not-allowed' : 'pointer',
          }}
        >
          {entering === contest.id ? (
            <><span className="cv-spinner" /> Entering...</>
          ) : btnLabel()}
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonCard() {
  return <div className="cv-skeleton" />;
}

/* ══════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════ */
export default function Contests() {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('live');
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(null);
  const [myEntries, setMyEntries] = useState([]);

  const indicatorRef = useRef(null);
  const tabsRef = useRef([]);

  const toast = useToast();
  const { balance, refreshBalance } = useWallet();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  /* slide indicator */
  useEffect(() => {
    const idx = TABS.indexOf(filter);
    const tab = tabsRef.current[idx];
    if (tab && indicatorRef.current) {
      indicatorRef.current.style.width = `${tab.offsetWidth}px`;
      indicatorRef.current.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
    }
  }, [filter, contests]);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getContests(filter);
      setContests(data.contests || data || []);
      if (user?.id) {
        const ue = await api.getUserContests(user.id);
        setMyEntries(ue.entries || []);
      }
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleEnter = async (contest) => {
    if (!user?.id) { navigate('/login'); return; }
    if (contest.entry_fee_pcc > 0 && balance !== null && balance < contest.entry_fee_pcc) {
      toast.error(`Need ${contest.entry_fee_pcc} PCC to enter.`); return;
    }
    setEntering(contest.id);
    try {
      await api.enterContest(contest.id, user.id);
      await refreshBalance();
      toast.success(`Entered "${contest.title}"!`);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setEntering(null); }
  };

  const totalPrize = contests.reduce((s, c) => s + (c.prize_pool_pcc || 0), 0);

  return (
    <div className="cv-page">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="cv-hero">
        <div className="cv-hero-glow" />
        <div className="cv-hero-inner">
          <div className="hero-eyebrow" style={{ margin: '0 auto 24px', width: 'fit-content' }}>
            🏆 THE ARENA
          </div>

          <h1 className="cv-hero-title">
            CONTEST&nbsp;<span className="cv-green">VAULT</span>
          </h1>
          <p className="cv-hero-sub">
            Enter high-stakes tournaments · Beat the field · Claim your PCC
          </p>

          {!loading && contests.length > 0 && (
            <div className="cv-stats-strip">
              <div className="cv-strip-pill">
                <span className="cv-strip-label">Active</span>
                <span className="cv-strip-val">{contests.length}</span>
              </div>
              <div className="cv-strip-sep" />
              <div className="cv-strip-pill">
                <span className="cv-strip-label">Total Prize</span>
                <span className="cv-strip-val">{totalPrize.toLocaleString()} PCC</span>
              </div>
              <div className="cv-strip-sep" />
              <div className="cv-strip-pill">
                <span className="cv-strip-label">Filter</span>
                <span className="cv-strip-val">{filter.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ TABS ══════════════════════════════════════════════ */}
      <div className="cv-tabs-wrap">
        <div className="cv-tabs">
          <div className="cv-tab-indicator" ref={indicatorRef} />
          {TABS.map((s, i) => (
            <button
              key={s}
              ref={el => tabsRef.current[i] = el}
              className={`cv-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ══ GRID ══════════════════════════════════════════════ */}
      <div className="cv-grid-wrap">
        {loading ? (
          <div className="cv-grid">
            {[1, 2, 3, 4, 5, 6].map(k => <SkeletonCard key={k} />)}
          </div>
        ) : contests.length === 0 ? (
          <div className="cv-empty">
            <div style={{ fontSize: '60px', opacity: .2, marginBottom: '20px' }}>🏟️</div>
            <h3 className="cv-empty-title">No {filter} contests</h3>
            <p className="cv-empty-sub">Check back soon or try a different filter.</p>
          </div>
        ) : (
          <div className="cv-grid">
            {contests.map(c => (
              <ContestCard
                key={c.id}
                contest={c}
                isEntered={myEntries.some(e => e.contest_id === c.id)}
                cantAfford={balance !== null && c.entry_fee_pcc > balance}
                entering={entering}
                onEnter={handleEnter}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ ALL STYLES ════════════════════════════════════════ */}
      <style>{`
        /* Page */
        .cv-page{min-height:100vh;background:#060f0a;padding-bottom:100px;color:#fff}

        /* Hero */
        .cv-hero{padding:110px 48px 56px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid rgba(0,230,118,0.08)}
        .cv-hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 800px 500px at 50% -10%,rgba(0,230,118,0.09),transparent);pointer-events:none}
        .cv-hero-inner{max-width:820px;margin:0 auto;position:relative}
        .cv-hero-title{font-family:'Rajdhani',sans-serif;font-weight:800;font-size:clamp(3rem,7vw,5.5rem);text-transform:uppercase;letter-spacing:-2px;line-height:1;margin:0 0 20px}
        .cv-green{color:#00e676}
        .cv-hero-sub{color:rgba(255,255,255,0.5);font-size:18px;line-height:1.7;margin:0 0 32px}
        
        /* Stats strip */
        .cv-stats-strip{display:inline-flex;align-items:center;gap:0;background:rgba(0,230,118,0.05);border:1px solid rgba(0,230,118,0.15);border-radius:999px;padding:6px 24px;backdrop-filter:blur(12px)}
        .cv-strip-pill{display:flex;align-items:center;gap:8px;padding:4px 8px}
        .cv-strip-label{font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px}
        .cv-strip-val{font-size:14px;font-weight:800;color:#00e676}
        .cv-strip-sep{width:1px;height:20px;background:rgba(0,230,118,0.2);margin:0 4px}

        /* Tabs */
        .cv-tabs-wrap{display:flex;justify-content:center;margin:36px 0 32px}
        .cv-tabs{position:relative;display:inline-flex;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:6px}
        .cv-tab-indicator{position:absolute;top:6px;height:calc(100% - 12px);background:#00e676;border-radius:999px;transition:transform .3s cubic-bezier(.4,0,.2,1),width .3s cubic-bezier(.4,0,.2,1);pointer-events:none;z-index:0}
        .cv-tab{position:relative;z-index:1;padding:9px 26px;border:none;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1.2px;border-radius:999px;transition:color .2s;white-space:nowrap}
        .cv-tab.active{color:#060f0a}
        .cv-tab:not(.active):hover{color:rgba(255,255,255,.85)}

        /* Grid */
        .cv-grid-wrap{max-width:1440px;margin:0 auto;padding:0 40px}
        .cv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:24px}

        /* Card shell */
        .cv-card{
          border-radius:20px;overflow:hidden;background:#0a1a0f;
          border:1px solid rgba(0,230,118,0.12);
          display:flex;flex-direction:column;
          position:relative;
          transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s,border-color .3s;
          will-change:transform;
        }
        .cv-card:hover{
          transform:translateY(-8px);
          box-shadow:0 24px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(0,230,118,0.25),inset 0 1px 0 rgba(255,255,255,0.05);
          border-color:rgba(0,230,118,0.3);
        }

        /* Image area */
        .cv-card-img-wrap{position:relative;height:200px;overflow:hidden;background:#071a0f;flex-shrink:0}
        .cv-card-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.4,0,.2,1);filter:brightness(0.75) saturate(1.1)}
        .cv-card:hover .cv-card-img{transform:scale(1.07)}
        .cv-card-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(6,15,10,0.55) 60%,#0a1a0f 100%);z-index:1}

        /* Floating badges on image */
        .cv-status-pill{position:absolute;top:14px;left:14px;z-index:2;display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;backdrop-filter:blur(8px)}
        .cv-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;animation:livePulse 1.4s ease-in-out infinite}
        .cv-prize-badge{position:absolute;top:14px;right:14px;z-index:2;text-align:right;background:rgba(6,15,10,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 14px;backdrop-filter:blur(12px)}
        .cv-prize-label{font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
        .cv-prize-value{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:800;line-height:1}

        /* Centre icon on image boundary */
        .cv-center-icon{position:absolute;top:200px;left:50%;transform:translate(-50%,-50%);z-index:10;width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:#060f0a;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,0.6)}
        .cv-center-icon-inner{width:100%;height:100%;border-radius:14px;display:flex;align-items:center;justify-content:center}

        /* Info panel */
        .cv-card-body{padding:36px 22px 22px;display:flex;flex-direction:column;gap:14px;flex:1}
        .cv-title{font-family:'Rajdhani',sans-serif;font-size:21px;font-weight:800;text-transform:uppercase;line-height:1.15;margin:0;text-align:center}
        .cv-desc{font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin:0;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

        /* Stats */
        .cv-stats{display:flex;align-items:center;justify-content:center;gap:0;background:rgba(0,0,0,0.3);border-radius:12px;border:1px solid rgba(255,255,255,0.04);overflow:hidden}
        .cv-stat{flex:1;padding:12px 8px;text-align:center}
        .cv-stat-label{font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .cv-stat-value{font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:800;color:#fff}
        .cv-stat-divider{width:1px;height:36px;background:rgba(255,255,255,0.06);flex-shrink:0}

        /* Progress */
        .cv-fill-track{height:3px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden}
        .cv-fill-bar{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1)}

        /* CTA */
        .cv-cta{width:100%;height:52px;border-radius:14px;font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px}
        .cv-cta:not(:disabled):hover{filter:brightness(1.1);transform:scale(1.02)}

        /* Spinner */
        .cv-spinner{width:16px;height:16px;border:2.5px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}

        /* Skeleton */
        .cv-skeleton{height:460px;border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);animation:skeletonPulse 1.8s ease-in-out infinite}

        /* Empty */
        .cv-empty{text-align:center;padding:120px 0;background:rgba(255,255,255,0.01);border-radius:24px;border:1px dashed rgba(255,255,255,0.05)}
        .cv-empty-title{font-family:'Rajdhani',sans-serif;font-size:34px;font-weight:800;text-transform:uppercase;margin:0 0 12px;color:#fff}
        .cv-empty-sub{color:rgba(255,255,255,0.35);font-size:16px;margin:0}

        /* Keyframes */
        @keyframes spin          { 100%{transform:rotate(360deg)} }
        @keyframes skeletonPulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
      `}</style>
    </div>
  );
}
