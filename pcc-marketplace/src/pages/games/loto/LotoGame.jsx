import { useState, useEffect, useCallback, useRef } from 'react';
import './loto.css';
import LotoCard from './LotoCard';
import LotoBoard from './LotoBoard';
import LotoLobby from './LotoLobby';
import LotoResults from './LotoResults';
import LotoLeaderboard from './LotoLeaderboard';
import { generateCard, checkWin, getPatternLabel, getColumnLetter } from './lotoUtils';
import { useWallet } from '../../../context/WalletContext';
import api from '../../../api';

// ═══════════════════════════════════════════════════════════
// Solo Game Engine - runs entirely client-side, no backend
// ═══════════════════════════════════════════════════════════
function useSoloGame(onGameEnd) {
  const [screen, setScreen] = useState('lobby');
  const [myCard, setMyCard] = useState(null);
  const [botCards, setBotCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState(new Set([0]));
  const [botMarked, setBotMarked] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [drawPool, setDrawPool] = useState([]);
  const [drawCount, setDrawCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winResult, setWinResult] = useState(null);
  const [canCallLoto, setCanCallLoto] = useState(false);
  const [config, setConfig] = useState({ winPattern: 'line', drawIntervalSeconds: 5, botCount: 3 });
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const drawTimerRef = useRef(null);
  const gameActiveRef = useRef(false);

  const makePool = () => {
    const pool = [];
    for (let i = 1; i <= 75; i++) pool.push(i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };

  const startSoloGame = useCallback((cfg) => {
    const c = { ...config, ...cfg };
    setConfig(c);
    const card = generateCard();
    setMyCard(card);
    const bots = [];
    const botM = [];
    for (let i = 0; i < c.botCount; i++) {
      bots.push(generateCard());
      botM.push(new Set([0]));
    }
    setBotCards(bots);
    setBotMarked(botM);
    const pool = makePool();
    setDrawPool(pool);
    setDrawnNumbers([]);
    setLastDrawn(null);
    setDrawCount(0);
    setMarkedNumbers(new Set([0]));
    setWinner(null);
    setWinResult(null);
    setCanCallLoto(false);
    setIsPaused(false);
    setError(null);
    gameActiveRef.current = true;
    setScreen('playing');
  }, [config]);

  useEffect(() => {
    if (screen !== 'playing' || isPaused || !gameActiveRef.current) return;
    drawTimerRef.current = setInterval(() => {
      setDrawPool(prev => {
        if (prev.length === 0 || !gameActiveRef.current) {
          clearInterval(drawTimerRef.current);
          return prev;
        }
        const [num, ...rest] = prev;
        const letter = getColumnLetter(num);
        setDrawnNumbers(d => [...d, num]);
        setLastDrawn({ number: num, letter });
        setDrawCount(c => c + 1);
        setBotCards(cards => {
          setBotMarked(prevBotMarked => {
            return prevBotMarked.map((marked, bi) => {
              const card = cards[bi];
              if (!card) return marked;
              const onCard = card.some(row => row.includes(num));
              if (onCard && Math.random() < 0.92) {
                const newSet = new Set(marked);
                newSet.add(num);
                return newSet;
              }
              return marked;
            });
          });
          return cards;
        });
        return rest;
      });
    }, config.drawIntervalSeconds * 1000);
    return () => clearInterval(drawTimerRef.current);
  }, [screen, isPaused, config.drawIntervalSeconds]);

  useEffect(() => {
    if (screen !== 'playing' || winner) return;
    botCards.forEach((card, i) => {
      const marked = botMarked[i];
      if (!marked) return;
      const result = checkWin(card, [...marked], config.winPattern);
      if (result.won) {
        setTimeout(() => {
          if (!gameActiveRef.current) return;
          gameActiveRef.current = false;
          clearInterval(drawTimerRef.current);
          setWinner({ username: `Bot ${i + 1}`, isBot: true });
          setWinResult({ pattern: result.pattern, winningCells: result.winningCells, card, drawCount, score: 0 });
          if (onGameEnd) onGameEnd(false, 0);
          setScreen('results');
        }, Math.random() * 2000 + 500);
      }
    });
  }, [botMarked, drawnNumbers]);

  useEffect(() => {
    if (!myCard || screen !== 'playing') return;
    const result = checkWin(myCard, [...markedNumbers], config.winPattern);
    setCanCallLoto(result.won);
  }, [markedNumbers, myCard, config.winPattern, screen]);

  const markNumber = useCallback((num) => {
    if (!drawnNumbers.includes(num)) return;
    setMarkedNumbers(prev => {
      const n = new Set(prev);
      n.add(num);
      return n;
    });
  }, [drawnNumbers]);

  const callLoto = useCallback(() => {
    if (!canCallLoto || !myCard) return;
    const result = checkWin(myCard, [...markedNumbers], config.winPattern);
    if (result.won) {
      gameActiveRef.current = false;
      clearInterval(drawTimerRef.current);
      const score = Math.max(1000 - drawCount * 10, 100);
      setWinner({ username: 'You', isBot: false });
      setWinResult({ pattern: result.pattern, winningCells: result.winningCells, card: myCard, drawCount, score });
      if (onGameEnd) onGameEnd(true, score);
      setScreen('results');
    } else {
      setError('Invalid BINGO call!');
      setTimeout(() => setError(null), 2000);
    }
  }, [canCallLoto, myCard, markedNumbers, config.winPattern, drawCount, onGameEnd]);

  const resetGame = useCallback(() => {
    gameActiveRef.current = false;
    clearInterval(drawTimerRef.current);
    if (onGameEnd && screen === 'playing') {
      onGameEnd(false, 0); // treat exit as loss
    }
    setScreen('lobby');
    setMyCard(null);
    setWinner(null);
    setWinResult(null);
  }, [onGameEnd, screen]);

  return {
    screen, setScreen, myCard, markedNumbers: [...markedNumbers],
    drawnNumbers, lastDrawn, drawCount, winner, winResult,
    canCallLoto, config, isPaused, error, setError,
    startSoloGame, markNumber, callLoto, resetGame,
    setIsPaused, botCards, botMarked
  };
}

// ── SVG Bot Avatars ──────────────────────────────────────
const BotAvatar1 = ({ color }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="18" rx="4" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
    <circle cx="12" cy="17" r="2.5" fill={color} /><circle cx="20" cy="17" r="2.5" fill={color} />
    <path d="M12 22h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 4v4M10 6l2 2M22 6l-2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="16" cy="3" r="1.5" fill={color} />
  </svg>
);
const BotAvatar2 = ({ color }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4c-3 0-6 2-7 5s-1 7 1 9c1 1 2 3 2 5h8c0-2 1-4 2-5 2-2 2-6 1-9s-4-5-7-5z" stroke={color} strokeWidth="1.5" fill={`${color}12`} />
    <path d="M12 28h8M13 26h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 12c2-1 3 1 4 0s2-2 4 0" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);
const BotAvatar3 = ({ color }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="16" height="16" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
    <rect x="12" y="12" width="8" height="8" rx="1" stroke={color} strokeWidth="1" fill={`${color}20`} />
    <path d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const BotAvatar4 = ({ color }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16s5-8 14-8 14 8 14 8-5 8-14 8S2 16 2 16z" stroke={color} strokeWidth="1.5" fill={`${color}08`} />
    <circle cx="16" cy="16" r="5" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
    <circle cx="16" cy="16" r="2" fill={color} />
  </svg>
);
const BotAvatar5 = ({ color }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3L5 8v8c0 7 5 12 11 14 6-2 11-7 11-14V8L16 3z" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
    <path d="M12 16l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const BOT_AVATARS = [BotAvatar1, BotAvatar2, BotAvatar3, BotAvatar4, BotAvatar5];
const BOT_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#22d3ee'];

// ═══════════════════════════════════════════════════════════
// Main Game Component
// ═══════════════════════════════════════════════════════════
export default function LotoGame() {
  const { balance, refreshBalance } = useWallet();
  const ENTRY_FEE = 5;

  const handleGameEnd = useCallback(async (won, score) => {
    if (!won) return; // Loss already deducted at start

    const user = (() => {
      try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
      catch { return {}; }
    })();
    const userId = user.id || user.user?.id;
    if (!userId) return;

    try {
      await api.recordGameSession({
        userId: userId,
        gameId: 'bingo',
        betAmount: '0', // bypass truthiness check
        result: 'win',
        payout: score,
        gameData: { outcome: 'win', score }
      });
      await refreshBalance();
    } catch (err) {
      console.error('Session failed:', err.message);
    }
  }, [refreshBalance]);

  const game = useSoloGame(handleGameEnd);
  const [view, setView] = useState('game');

  const handleStartGame = async (cfg) => {
    if (balance !== null && balance < ENTRY_FEE) {
      game.setError(`Insufficient balance. Requires ${ENTRY_FEE} PCC.`);
      return;
    }

    const user = (() => {
      try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
      catch { return {}; }
    })();
    const userId = user.id || user.user?.id;

    if (userId) {
      try {
        await api.recordGameSession({
          userId: userId,
          gameId: 'bingo',
          betAmount: ENTRY_FEE,
          result: 'loss',
          payout: 0,
          gameData: { outcome: 'entry_fee' }
        });
        await refreshBalance();
      } catch (err) {
        console.error("Entry fee deduction failed:", err);
        game.setError('Failed to deduct entry fee: ' + err.message);
        return;
      }
    } else {
      game.setError('Please log in to play.');
      return;
    }

    game.startSoloGame(cfg);
  };

  if (view === 'leaderboard') {
    return <div className="loto-page"><LotoLeaderboard leaderboard={[]} onBack={() => setView('game')} /></div>;
  }

  if (game.screen === 'lobby') {
    return (
      <div className="loto-page">
        <div className="loto-bg-orbs"><div className="loto-orb loto-orb-1" /><div className="loto-orb loto-orb-2" /><div className="loto-orb loto-orb-3" /></div>
        <LotoLobby onCreateRoom={handleStartGame} onJoinRoom={() => game.setError('Multiplayer coming soon!')} onViewLeaderboard={() => setView('leaderboard')} loading={false} error={game.error} />
      </div>
    );
  }

  if (game.screen === 'results') {
    return (
      <div className="loto-page">
        <div className="loto-bg-orbs"><div className="loto-orb loto-orb-1" /><div className="loto-orb loto-orb-2" /></div>
        <LotoResults winner={game.winner} winResult={game.winResult} myCard={game.myCard} markedNumbers={game.markedNumbers} onPlayAgain={() => handleStartGame(game.config)} onBackToLobby={game.resetGame} onViewLeaderboard={() => setView('leaderboard')} />
      </div>
    );
  }

  // ─── PLAYING ────────────────────────────────────────────
  const markedCount = game.markedNumbers.length - 1;

  return (
    <div className="loto-page">
      <div className="loto-bg-orbs">
        <div className="loto-orb loto-orb-1" /><div className="loto-orb loto-orb-2" /><div className="loto-orb loto-orb-3" />
      </div>

      {game.isPaused && (
        <div className="loto-pause-overlay">
          <div className="loto-pause-modal">
            <div style={{ fontSize: 48 }}>⏸</div>
            <h2>Game Paused</h2>
            <button className="loto-btn loto-btn-primary" onClick={() => game.setIsPaused(false)}>▶ Resume</button>
            <button className="loto-btn loto-btn-danger" style={{ marginTop: 8 }} onClick={game.resetGame}>← Exit Game</button>
          </div>
        </div>
      )}

      {/* ═══ 3-Column Game Layout ═══ */}
      <div className="loto-game-layout">

        {/* ── LEFT PANEL ── */}
        <div className="loto-board-panel">
          <div className="lg-panel-controls">
            <button className="lg-exit-btn" onClick={game.resetGame}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Exit
            </button>
            <div className="lg-game-meta">
              <span className="lg-meta-tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                {getPatternLabel(game.config.winPattern)}
              </span>
              <span className="lg-meta-tag lg-meta-dim">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /><circle cx="15" cy="14" r="1.5" fill="currentColor" /><path d="M12 4v4" /></svg>
                vs {game.botCards.length}
              </span>
            </div>
          </div>
          <LotoBoard drawnNumbers={game.drawnNumbers} lastDrawn={game.lastDrawn} />
        </div>

        {/* ── CENTER PANEL ── */}
        <div className="loto-card-panel">
          <div className="loto-card-title-bar">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-2px', marginRight: 5 }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
              YOUR CARD
            </span>
            <span className="loto-marked-count">{markedCount}/25 marked</span>
          </div>
          <LotoCard
            card={game.myCard}
            markedNumbers={game.markedNumbers}
            drawnNumbers={game.drawnNumbers}
            winningCells={game.winResult?.winningCells || []}
            onCellClick={(num) => {
              if (game.drawnNumbers.includes(num) && !game.markedNumbers.includes(num)) game.markNumber(num);
            }}
          />
          <button
            className={`loto-call-btn ${game.canCallLoto ? 'ready' : 'disabled'}`}
            onClick={() => game.canCallLoto && game.callLoto()}
            disabled={!game.canCallLoto}
          >
            {game.canCallLoto ? 'CALL BINGO!' : 'BINGO'}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="loto-players-panel">
          <div className="lg-right-controls">
            <button className="lg-pause-btn" onClick={() => game.setIsPaused(p => !p)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                {game.isPaused
                  ? <path d="M8 5v14l11-7z" />
                  : <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>
                }
              </svg>
              {game.isPaused ? 'Resume' : 'Pause'}
            </button>
            <div className="lg-draw-badge">
              <span className="lg-draw-num">{game.drawCount}</span>
              <span className="lg-draw-label">draws</span>
            </div>
          </div>

          <h4>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-1px', marginRight: 4 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Opponents
          </h4>

          {game.botCards.map((card, i) => {
            const bm = game.botMarked[i];
            const markedCnt = bm ? bm.size - 1 : 0;
            const progress = Math.min(100, (markedCnt / 24) * 100);
            const color = BOT_COLORS[i % BOT_COLORS.length];
            const AvatarComp = BOT_AVATARS[i % BOT_AVATARS.length];
            return (
              <div key={i} className="loto-bot-card" style={{ '--bot-color': color }}>
                <div className="loto-bot-avatar">
                  <AvatarComp color={color} />
                </div>
                <div className="loto-bot-info">
                  <div className="loto-bot-name">Bot {i + 1}</div>
                  <div className="loto-bot-progress-bar">
                    <div className="loto-bot-progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                  </div>
                  <div className="loto-bot-stats">{markedCnt}/24 marked</div>
                </div>
              </div>
            );
          })}

          <div className="loto-tip-box">
            <svg className="loto-tip-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><circle cx="12" cy="8" r="0.5" fill="#fbbf24" /></svg>
            <div className="loto-tip-text">
              Click numbers on your card as they are drawn. Complete the <strong>{game.config.winPattern}</strong> pattern and hit BINGO!
            </div>
          </div>
        </div>
      </div>

      {game.error && <div className="loto-error">{game.error}</div>}
    </div>
  );
}
