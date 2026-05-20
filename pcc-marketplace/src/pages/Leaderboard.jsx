import { useState, useEffect, useRef } from 'react';
import '../gaming.css';

/* ─── Dummy leaderboard data per category ─────────────────── */
const DUMMY = {
  global: [
    { id: 1, name: 'Thabo Nkosi', avatar: 'T', wins: 48, pcc: 12840, badge: '🏆', streak: 7, country: '🇿🇦' },
    { id: 2, name: 'Sarah van Wyk', avatar: 'S', wins: 41, pcc: 10250, badge: '🥈', streak: 5, country: '🇿🇦' },
    { id: 3, name: 'Mohammed Ali', avatar: 'M', wins: 38, pcc: 9100, badge: '🥉', streak: 4, country: '🇿🇦' },
    { id: 4, name: 'Priya Patel', avatar: 'P', wins: 35, pcc: 7650, badge: null, streak: 3, country: '🇿🇦' },
    { id: 5, name: 'James Dlamini', avatar: 'J', wins: 32, pcc: 6800, badge: null, streak: 6, country: '🇿🇦' },
    { id: 6, name: 'Lerato Mokoena', avatar: 'L', wins: 29, pcc: 5920, badge: null, streak: 2, country: '🇿🇦' },
    { id: 7, name: 'Dylan Botha', avatar: 'D', wins: 26, pcc: 5100, badge: null, streak: 1, country: '🇿🇦' },
    { id: 8, name: 'Zanele Dube', avatar: 'Z', wins: 23, pcc: 4450, badge: null, streak: 3, country: '🇿🇦' },
    { id: 9, name: 'Ruan Venter', avatar: 'R', wins: 20, pcc: 3780, badge: null, streak: 0, country: '🇿🇦' },
    { id: 10, name: 'Ayesha Khan', avatar: 'A', wins: 18, pcc: 3100, badge: null, streak: 2, country: '🇿🇦' },
  ],
  aviator: [
    { id: 1, name: 'Dylan Botha', avatar: 'D', wins: 22, pcc: 5500, badge: '🏆', streak: 9, country: '🇿🇦' },
    { id: 2, name: 'Thabo Nkosi', avatar: 'T', wins: 18, pcc: 4200, badge: '🥈', streak: 5, country: '🇿🇦' },
    { id: 3, name: 'Zanele Dube', avatar: 'Z', wins: 15, pcc: 3100, badge: '🥉', streak: 3, country: '🇿🇦' },
    { id: 4, name: 'Ruan Venter', avatar: 'R', wins: 12, pcc: 2400, badge: null, streak: 2, country: '🇿🇦' },
    { id: 5, name: 'Lerato Mokoena', avatar: 'L', wins: 10, pcc: 1900, badge: null, streak: 1, country: '🇿🇦' },
    { id: 6, name: 'Priya Patel', avatar: 'P', wins: 8, pcc: 1400, badge: null, streak: 0, country: '🇿🇦' },
    { id: 7, name: 'Sarah van Wyk', avatar: 'S', wins: 6, pcc: 1100, badge: null, streak: 2, country: '🇿🇦' },
  ],
  slots: [
    { id: 1, name: 'Ayesha Khan', avatar: 'A', wins: 30, pcc: 8900, badge: '🏆', streak: 11, country: '🇿🇦' },
    { id: 2, name: 'James Dlamini', avatar: 'J', wins: 25, pcc: 6700, badge: '🥈', streak: 7, country: '🇿🇦' },
    { id: 3, name: 'Mohammed Ali', avatar: 'M', wins: 20, pcc: 4800, badge: '🥉', streak: 4, country: '🇿🇦' },
    { id: 4, name: 'Sarah van Wyk', avatar: 'S', wins: 17, pcc: 3500, badge: null, streak: 3, country: '🇿🇦' },
    { id: 5, name: 'Dylan Botha', avatar: 'D', wins: 13, pcc: 2900, badge: null, streak: 2, country: '🇿🇦' },
    { id: 6, name: 'Thabo Nkosi', avatar: 'T', wins: 11, pcc: 2200, badge: null, streak: 1, country: '🇿🇦' },
  ],
  roulette: [
    { id: 1, name: 'Priya Patel', avatar: 'P', wins: 19, pcc: 7200, badge: '🏆', streak: 6, country: '🇿🇦' },
    { id: 2, name: 'Ruan Venter', avatar: 'R', wins: 15, pcc: 5400, badge: '🥈', streak: 4, country: '🇿🇦' },
    { id: 3, name: 'Mohammed Ali', avatar: 'M', wins: 13, pcc: 4100, badge: '🥉', streak: 3, country: '🇿🇦' },
    { id: 4, name: 'Zanele Dube', avatar: 'Z', wins: 10, pcc: 3000, badge: null, streak: 2, country: '🇿🇦' },
    { id: 5, name: 'Lerato Mokoena', avatar: 'L', wins: 8, pcc: 2100, badge: null, streak: 1, country: '🇿🇦' },
  ],
  cricket: [
    { id: 1, name: 'James Dlamini', avatar: 'J', wins: 34, pcc: 9800, badge: '🏆', streak: 10, country: '🇿🇦' },
    { id: 2, name: 'Thabo Nkosi', avatar: 'T', wins: 28, pcc: 7700, badge: '🥈', streak: 6, country: '🇿🇦' },
    { id: 3, name: 'Ayesha Khan', avatar: 'A', wins: 23, pcc: 5900, badge: '🥉', streak: 4, country: '🇿🇦' },
    { id: 4, name: 'Dylan Botha', avatar: 'D', wins: 19, pcc: 4600, badge: null, streak: 3, country: '🇿🇦' },
    { id: 5, name: 'Sarah van Wyk', avatar: 'S', wins: 15, pcc: 3400, badge: null, streak: 2, country: '🇿🇦' },
    { id: 6, name: 'Priya Patel', avatar: 'P', wins: 12, pcc: 2700, badge: null, streak: 1, country: '🇿🇦' },
    { id: 7, name: 'Ruan Venter', avatar: 'R', wins: 9, pcc: 1900, badge: null, streak: 0, country: '🇿🇦' },
  ],
  braai_poker: [
    { id: 1, name: 'Mohammed Ali', avatar: 'M', wins: 27, pcc: 11200, badge: '🏆', streak: 8, country: '🇿🇦' },
    { id: 2, name: 'Zanele Dube', avatar: 'Z', wins: 21, pcc: 8400, badge: '🥈', streak: 5, country: '🇿🇦' },
    { id: 3, name: 'Lerato Mokoena', avatar: 'L', wins: 17, pcc: 6100, badge: '🥉', streak: 4, country: '🇿🇦' },
    { id: 4, name: 'Thabo Nkosi', avatar: 'T', wins: 13, pcc: 4500, badge: null, streak: 3, country: '🇿🇦' },
    { id: 5, name: 'James Dlamini', avatar: 'J', wins: 10, pcc: 3200, badge: null, streak: 2, country: '🇿🇦' },
  ],
};

const TABS = [
  { id: 'global', label: '🌍 Global', color: '#00e676' },
  { id: 'aviator', label: '✈️ Aviator', color: '#38bdf8' },
  { id: 'slots', label: '🎰 Slots', color: '#a855f7' },
  { id: 'roulette', label: '🎡 Roulette', color: '#ef4444' },
  { id: 'cricket', label: '🏏 Cricket', color: '#22d3ee' },
  { id: 'braai_poker', label: '🃏 Braai Poker', color: '#f59e0b' },
];

const AVATAR_COLORS = ['#00e676', '#38bdf8', '#a855f7', '#ef4444', '#f59e0b', '#ec4899', '#10b981', '#6366f1'];
const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const RANK_CONFIG = [
  { glow: 'rgba(255,214,10,0.35)', border: 'rgba(255,214,10,0.5)', bg: 'rgba(255,214,10,0.08)', rankColor: '#ffd60a', size: '72px', font: '28px', medal: '🥇' },
  { glow: 'rgba(200,220,230,0.25)', border: 'rgba(192,220,232,0.4)', bg: 'rgba(200,220,230,0.05)', rankColor: '#c8dce8', size: '60px', font: '24px', medal: '🥈' },
  { glow: 'rgba(205,127,50,0.25)', border: 'rgba(205,127,50,0.35)', bg: 'rgba(205,127,50,0.06)', rankColor: '#cd7f32', size: '52px', font: '20px', medal: '🥉' },
];

/* ── Podium: top 3 ── */
function Podium({ entries, accent }) {
  if (entries.length < 3) return null;
  const [second, first, third] = [entries[1], entries[0], entries[2]];

  const Pod = ({ entry, rank, height, glow }) => {
    const rc = RANK_CONFIG[rank - 1];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: rc.size, height: rc.size, borderRadius: '50%',
            background: getAvatarColor(entry.name),
            border: `3px solid ${rc.border}`,
            boxShadow: `0 0 24px ${rc.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: rc.font, fontWeight: 900, color: '#fff',
          }}>
            {entry.avatar}
          </div>
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            fontSize: '20px', lineHeight: 1
          }}>{rc.medal}</div>
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: rank === 1 ? '18px' : '15px', color: '#fff', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.name.split(' ')[0]}
          </div>
          <div style={{ color: rc.rankColor, fontWeight: 800, fontSize: '15px', fontFamily: "'Rajdhani',sans-serif" }}>
            {entry.pcc.toLocaleString()} PCC
          </div>
        </div>

        {/* Podium column */}
        <div style={{
          width: rank === 1 ? '130px' : '100px',
          height: `${height}px`,
          background: `linear-gradient(180deg, ${rc.bg.replace('0.08', '0.2').replace('0.05', '0.12').replace('0.06', '0.1')}, ${rc.bg})`,
          border: `1px solid ${rc.border}`,
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: 900, color: rc.rankColor,
        }}>
          #{rank}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0',
      marginBottom: '40px', padding: '0 20px',
    }}>
      <Pod entry={second} rank={2} height={100} />
      <Pod entry={first} rank={1} height={140} />
      <Pod entry={third} rank={3} height={80} />
    </div>
  );
}

/* ── Row card ── */
function LeaderRow({ entry, rank, accent, isMe, delay }) {
  const isTop3 = rank <= 3;
  const rc = isTop3 ? RANK_CONFIG[rank - 1] : null;

  return (
    <div className="lb-row" style={{
      '--delay': `${delay}ms`,
      background: isMe ? `${accent}0d` : isTop3 ? rc.bg : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isMe ? accent + '44' : isTop3 ? rc.border : 'rgba(255,255,255,0.05)'}`,
    }}>
      {/* Rank */}
      <div style={{
        width: '44px', textAlign: 'center', flexShrink: 0,
        fontFamily: "'Rajdhani',sans-serif", fontWeight: 900,
        fontSize: isTop3 ? '22px' : '18px',
        color: isTop3 ? rc.rankColor : 'rgba(255,255,255,0.35)',
      }}>
        {isTop3 ? rc.medal : `${rank}`}
      </div>

      {/* Avatar */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
        background: getAvatarColor(entry.name),
        border: isTop3 ? `2px solid ${rc.border}` : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isTop3 ? `0 0 12px ${rc.glow}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '18px', color: '#fff',
      }}>
        {entry.avatar}
      </div>

      {/* Name & meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: '17px',
            color: isMe ? accent : '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entry.name}
          </span>
          {isMe && <span style={{ fontSize: '11px', background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, borderRadius: '999px', padding: '2px 8px', fontWeight: 700, flexShrink: 0 }}>YOU</span>}
          {entry.streak >= 3 && (
            <span style={{ fontSize: '11px', color: '#ff9800', flexShrink: 0 }}>🔥 {entry.streak}</span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {entry.wins} wins · {entry.country}
        </div>
      </div>

      {/* PCC earned */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: '19px',
          color: isTop3 ? rc.rankColor : accent,
        }}>
          +{entry.pcc.toLocaleString()}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PCC earned</div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Leaderboard() {
  const [tab, setTab] = useState('global');
  const [animating, setAnimating] = useState(false);
  const indicatorRef = useRef(null);
  const tabsRef = useRef([]);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  const activeTab = TABS.find(t => t.id === tab) || TABS[0];
  const accent = activeTab.color;
  const data = DUMMY[tab] || [];

  const switchTab = (id) => {
    setAnimating(true);
    setTimeout(() => { setTab(id); setAnimating(false); }, 200);
  };

  /* slide indicator */
  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === tab);
    const el = tabsRef.current[idx];
    if (el && indicatorRef.current) {
      indicatorRef.current.style.left = `${el.offsetLeft}px`;
      indicatorRef.current.style.width = `${el.offsetWidth}px`;
    }
  }, [tab]);

  return (
    <div style={{ minHeight: '100vh', background: '#060f0a', paddingBottom: '100px', color: '#fff' }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div style={{
        padding: '110px 48px 56px',
        background: `linear-gradient(180deg, ${accent}0d 0%, transparent 100%)`,
        borderBottom: `1px solid ${accent}18`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        transition: 'background 0.5s'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 700px 400px at 50% -10%, ${accent}10, transparent)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative' }}>
          <div className="hero-eyebrow" style={{ margin: '0 auto 20px', width: 'fit-content', background: `${accent}18`, borderColor: `${accent}55`, color: accent }}>
            🏅 HALL OF FAME
          </div>
          <h1 style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 800,
            fontSize: 'clamp(3rem, 7vw, 5rem)', textTransform: 'uppercase',
            letterSpacing: '-2px', lineHeight: 1, margin: '0 0 16px'
          }}>
            PCC <span style={{ color: accent }}>LEADERBOARD</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', margin: '0 0 32px', lineHeight: 1.6 }}>
            Top earners across all PaieCashFan gaming tournaments
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
            {[
              { label: 'Top Earner', val: data[0]?.name.split(' ')[0] || '-' },
              { label: 'Total Pool', val: `${data.reduce((s, d) => s + d.pcc, 0).toLocaleString()} PCC` },
              { label: 'Active Players', val: `${data.length}` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '12px 28px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: '22px', color: accent }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ GAME TABS ══════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 20px 0', overflowX: 'auto' }}>
        <div style={{ position: 'relative', display: 'inline-flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '6px', gap: '2px' }}>
          {/* Sliding indicator */}
          <div ref={indicatorRef} style={{
            position: 'absolute', top: '6px', height: 'calc(100% - 12px)',
            background: accent, borderRadius: '12px', opacity: 0.15,
            transition: 'left .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1)',
            pointerEvents: 'none', zIndex: 0,
          }} />
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={el => tabsRef.current[i] = el}
              onClick={() => switchTab(t.id)}
              style={{
                position: 'relative', zIndex: 1,
                padding: '10px 20px', border: 'none', borderRadius: '12px',
                background: tab === t.id ? `${t.color}22` : 'transparent',
                color: tab === t.id ? t.color : 'rgba(255,255,255,0.45)',
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', whiteSpace: 'nowrap',
                outline: tab === t.id ? `1px solid ${t.color}44` : 'none',
                transition: 'all .2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ════════════════════════════════════════════ */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 0' }}>

        {/* ── Podium ── */}
        <Podium entries={data} accent={accent} />

        {/* ── All rows ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: animating ? 0 : 1, transition: 'opacity .2s' }}>
          {data.map((entry, i) => (
            <LeaderRow
              key={entry.id}
              entry={entry}
              rank={i + 1}
              accent={accent}
              isMe={entry.name === user?.full_name || entry.name === user?.name}
              delay={i * 40}
            />
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '40px', textAlign: 'center', fontSize: '12px',
          color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px'
        }}>
          🏆 Leaderboard updates every 24 hours. Template data shown - live data coming soon.
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&display=swap');

        .lb-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: rowSlideIn 0.4s calc(var(--delay)) both ease-out;
        }
        .lb-row:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }

        @keyframes rowSlideIn {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  );
}
