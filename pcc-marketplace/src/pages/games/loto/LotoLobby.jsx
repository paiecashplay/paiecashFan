import { useState } from 'react';

const PATTERNS = [
  { value: 'line', label: 'Horizontal Line', icon: '↔', desc: 'Complete any row' },
  { value: 'column', label: 'Vertical Column', icon: '↕', desc: 'Complete any column' },
  { value: 'diagonal', label: 'Diagonal', icon: '↗', desc: 'Corner to corner' },
  { value: 'blackout', label: 'Full Blackout', icon: '⬛', desc: 'Cover the entire card' },
];

const SPEEDS = [
  { value: 2, label: 'Blitz', sub: '2s / draw', tag: 'FASTEST' },
  { value: 3, label: 'Fast', sub: '3s / draw', tag: '' },
  { value: 5, label: 'Normal', sub: '5s / draw', tag: 'DEFAULT' },
  { value: 8, label: 'Relaxed', sub: '8s / draw', tag: '' },
  { value: 12, label: 'Chill', sub: '12s / draw', tag: '' },
];

const BOT_COUNTS = [
  { value: 1, label: '1 Bot', sub: 'Easy' },
  { value: 2, label: '2 Bots', sub: 'Normal' },
  { value: 3, label: '3 Bots', sub: 'Standard' },
  { value: 5, label: '5 Bots', sub: 'Hard' },
  { value: 7, label: '7 Bots', sub: 'Brutal' },
];

export default function LotoLobby({ onCreateRoom, onJoinRoom, onViewLeaderboard, loading, error }) {
  const [mode, setMode] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [config, setConfig] = useState({
    winPattern: 'line',
    drawIntervalSeconds: 5,
    botCount: 3,
  });

  return (
    <div className="loto-lobby">

      {/* ── Decorative grid overlay ── */}
      <div className="ll-grid-overlay" aria-hidden="true" />

      {/* ── Header ── */}
      <div className="loto-lobby-header">
        <h1>BINGO GAME</h1>
        <p>Match the pattern · Beat the bots · Call it first</p>
      </div>

      {error && (
        <div className="loto-error" style={{ position: 'relative', top: 0, transform: 'none', left: 0, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* ── MAIN MENU ── */}
      {!mode && (
        <div className="ll-menu fly-in">
          {/* Solo card */}
          <div className="ll-mode-card ll-mode-solo" onClick={() => setMode('create')}>
            <div className="ll-mode-card-bg" />
            <div className="ll-mode-badge">AVAILABLE</div>
            <div className="ll-mode-icon">🎲</div>
            <h3>Solo Mode</h3>
            <p>Play against AI bots. Entry: 5 PCC | Prize: up to 50 PCC</p>
            <div className="ll-mode-cta">Play Now →</div>
          </div>

          {/* Multiplayer card (disabled) */}
          <div className="ll-mode-card ll-mode-multi ll-mode-disabled">
            <div className="ll-mode-card-bg" />
            <div className="ll-mode-badge ll-badge-soon">SOON</div>
            <div className="ll-mode-icon">👥</div>
            <h3>Multiplayer</h3>
            <p>Challenge friends in real-time rooms.</p>
            <div className="ll-mode-cta ll-cta-muted">Coming Soon</div>
          </div>

          <button className="ll-lb-btn" onClick={onViewLeaderboard}>
            <span>🏆</span> Leaderboard
          </button>
        </div>
      )}

      {/* ── CREATE ROOM / GAME SETUP ── */}
      {mode === 'create' && (
        <div className="ll-setup fly-in">
          <div className="ll-setup-header">
            <button className="ll-back-btn" onClick={() => setMode(null)}>← Back</button>
            <span className="ll-setup-title">Game Setup</span>
          </div>

          {/* Win Pattern */}
          <div className="ll-section">
            <div className="ll-section-label">Win Pattern</div>
            <div className="ll-pattern-grid">
              {PATTERNS.map(p => (
                <button
                  key={p.value}
                  className={`ll-pattern-btn ${config.winPattern === p.value ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, winPattern: p.value })}
                >
                  <span className="ll-pattern-icon">{p.icon}</span>
                  <span className="ll-pattern-label">{p.label}</span>
                  <span className="ll-pattern-desc">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Draw Speed */}
          <div className="ll-section">
            <div className="ll-section-label">Draw Speed</div>
            <div className="ll-speed-row">
              {SPEEDS.map(s => (
                <button
                  key={s.value}
                  className={`ll-speed-btn ${config.drawIntervalSeconds === s.value ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, drawIntervalSeconds: s.value })}
                >
                  {s.label}
                  {s.tag && <span className="ll-speed-tag">{s.tag}</span>}
                  <span className="ll-speed-sub">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bot Count */}
          <div className="ll-section">
            <div className="ll-section-label">Opponents</div>
            <div className="ll-bots-row">
              {BOT_COUNTS.map(b => (
                <button
                  key={b.value}
                  className={`ll-bot-btn ${config.botCount === b.value ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, botCount: b.value })}
                >
                  <span className="ll-bot-num">{b.value}</span>
                  <span className="ll-bot-sub">{b.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            className="ll-start-btn"
            disabled={loading}
            onClick={() => onCreateRoom(config)}
          >
            {loading ? 'Starting…' : '🎲 Start Game - 5 PCC'}
          </button>
        </div>
      )}

      {/* ── JOIN ROOM ── */}
      {mode === 'join' && (
        <div className="ll-setup fly-in">
          <div className="ll-setup-header">
            <button className="ll-back-btn" onClick={() => setMode(null)}>← Back</button>
            <span className="ll-setup-title">Join Room</span>
          </div>
          <div className="ll-join-wrap">
            <div className="ll-section-label">Enter Room Code</div>
            <input
              className="loto-join-input"
              maxLength={6}
              placeholder="XXXXXX"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <button
              className="ll-start-btn"
              disabled={joinCode.length < 4 || loading}
              onClick={() => onJoinRoom(joinCode)}
            >
              Join Room →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}