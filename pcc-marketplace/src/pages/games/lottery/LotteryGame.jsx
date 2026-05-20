import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../../context/WalletContext';
import api from '../../../api';
import './lottery.css';

const TOTAL_NUMBERS = 49;
const PICKS_REQUIRED = 6;
const ENTRY_FEE = 5;
const PRIZES = { 6: 1000, 5: 200, 4: 50, 3: 10, 2: 0, 1: 0, 0: 0 };

/* ─── Single Number Cell ─── */
function NumberCell({ num, selected, disabled, onToggle }) {
  const isSelected = selected.includes(num);
  return (
    <div
      className={`lottery-num${isSelected ? ' sel' : ''}${disabled ? ' dis' : ''}`}
      onClick={() => !disabled && onToggle(num)}
    >
      <span>{num < 10 ? `0${num}` : num}</span>
    </div>
  );
}

/* ─── Drawn Ball ─── */
function DrawnBall({ num, isMatch }) {
  return (
    <div className={`lottery-ball ball-animate ${isMatch ? 'ball-match' : 'ball-drawn'}`}>
      <span>{num < 10 ? `0${num}` : num}</span>
    </div>
  );
}

/* ─── Ticket Ball ─── */
function TicketBall({ num, isMatch }) {
  return (
    <div className={`lottery-ball ball-ticket${isMatch ? ' ball-match' : ''}`}>
      <span>{num < 10 ? `0${num}` : num}</span>
    </div>
  );
}

/* ─── Confirm Exit Overlay ─── */
function ExitModal({ onConfirm, onCancel }) {
  return (
    <div className="lottery-exit-overlay">
      <div className="lottery-exit-modal">
        <div style={{ fontSize: 40 }}>🚪</div>
        <h2>Exit Game?</h2>
        <p>Your entry fee has already been deducted. Exiting now means you forfeit this round.</p>
        <div className="lottery-exit-modal-btns">
          <button className="lottery-btn lottery-btn-secondary" onClick={onCancel}>Keep Playing</button>
          <button className="lottery-btn lottery-btn-danger" onClick={onConfirm}>Exit</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LotteryGame() {
  const navigate = useNavigate();
  const { balance, refreshBalance } = useWallet();

  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [gameState, setGameState] = useState('picking'); // picking | drawing | finished
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(0);
  const [prize, setPrize] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // true once fee is paid

  const toggleNumber = useCallback((num) => {
    if (gameState !== 'picking') return;
    setSelectedNumbers(prev => {
      if (prev.includes(num)) return prev.filter(n => n !== num);
      if (prev.length < PICKS_REQUIRED) return [...prev, num].sort((a, b) => a - b);
      return prev;
    });
  }, [gameState]);

  const autoPick = () => {
    if (gameState !== 'picking') return;
    const picks = new Set();
    while (picks.size < PICKS_REQUIRED) picks.add(Math.floor(Math.random() * TOTAL_NUMBERS) + 1);
    setSelectedNumbers([...picks].sort((a, b) => a - b));
  };

  const clearPicks = () => {
    if (gameState !== 'picking') return;
    setSelectedNumbers([]);
  };

  const handleExit = () => {
    // If fee not paid yet, just go back
    if (!gameStarted) {
      navigate('/gaming');
      return;
    }
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    navigate('/gaming');
  };

  const startDraw = async () => {
    if (selectedNumbers.length !== PICKS_REQUIRED) {
      setError(`Please pick exactly ${PICKS_REQUIRED} numbers.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (balance !== null && balance < ENTRY_FEE) {
      setError(`Insufficient balance. Need ${ENTRY_FEE} PCC, you have ${balance} PCC.`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    const user = (() => {
      try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
      catch { return {}; }
    })();
    const userId = user.id || user.user?.id;
    if (!userId) {
      setError('Please log in to play.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);

      // Deduct entry fee
      await api.recordGameSession({
        userId, gameId: 'lottery649', betAmount: ENTRY_FEE,
        result: 'loss', payout: 0, gameData: { outcome: 'entry_fee' },
      });
      await refreshBalance();
      setGameStarted(true);

      // Generate winning numbers
      const winningSet = new Set();
      while (winningSet.size < PICKS_REQUIRED)
        winningSet.add(Math.floor(Math.random() * TOTAL_NUMBERS) + 1);
      const winningNumbers = [...winningSet].sort((a, b) => a - b);

      setGameState('drawing');
      setDrawnNumbers([]);

      // Reveal balls one by one
      for (let i = 0; i < PICKS_REQUIRED; i++) {
        await new Promise(r => setTimeout(r, 800));
        setDrawnNumbers(prev => [...prev, winningNumbers[i]]);
      }

      await new Promise(r => setTimeout(r, 500));

      // Calculate result
      const matchCount = selectedNumbers.filter(n => winningNumbers.includes(n)).length;
      const wonAmount = PRIZES[matchCount] || 0;
      setMatches(matchCount);
      setPrize(wonAmount);

      if (wonAmount > 0) {
        await api.recordGameSession({
          userId, gameId: 'lottery649', betAmount: '0',
          result: 'win', payout: wonAmount,
          gameData: { outcome: 'win', matches: matchCount, prize: wonAmount },
        });
        await refreshBalance();
      }

      setGameState('finished');
    } catch (err) {
      console.error(err);
      setError('Failed to process: ' + err.message);
      setGameState('picking');
      setGameStarted(false);
    }
  };

  const playAgain = () => {
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setGameState('picking');
    setMatches(0);
    setPrize(0);
    setError(null);
    setGameStarted(false);
  };

  const readyToBuy = selectedNumbers.length === PICKS_REQUIRED;

  return (
    <div className="lottery-page">
      {/* Background */}
      <div className="lottery-bg-orbs">
        <div className="lottery-orb lottery-orb-1" />
        <div className="lottery-orb lottery-orb-2" />
        <div className="lottery-orb lottery-orb-3" />
      </div>
      <div className="lottery-grid-overlay" />

      {/* Exit button - always visible */}
      <button className="lottery-exit-btn" onClick={handleExit}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Exit
      </button>

      {/* Exit confirm modal */}
      {showExitModal && (
        <ExitModal onConfirm={confirmExit} onCancel={() => setShowExitModal(false)} />
      )}

      {/* Error toast */}
      {error && <div className="lottery-error">{error}</div>}

      {/* Main content */}
      <div className="lottery-wrap">

        {/* ── Header ── */}
        <div className="lottery-header">
          <div className="lottery-eyebrow">PCC Official · Instant Draw</div>
          <h1>LOTO</h1>
          <p className="lottery-tagline">
            Pick 6 numbers · Match all 6 · Win the <strong>1,000 PCC Jackpot</strong>
          </p>
        </div>

        {/* ── Prize strip ── */}
        <div className="lottery-prizes">
          {[6, 5, 4, 3].map(m => (
            <div key={m} className={`lottery-prize${m === 6 ? ' jackpot' : ''}`}>
              <span className="lottery-prize-label">Match {m}</span>
              <div className="lottery-prize-amount">
                {PRIZES[m].toLocaleString()}
                <span>PCC</span>
              </div>
              {m === 6 && <span className="lottery-prize-crown">★</span>}
            </div>
          ))}
        </div>

        {/* ══ PICK PANEL ══ */}
        {gameState === 'picking' && (
          <div className="lottery-grid-panel">
            <div className="lottery-grid-top">
              <span className="lottery-grid-label">Choose your numbers</span>
              <div className="lottery-progress">
                <div className="lottery-progress-track">
                  <div
                    className="lottery-progress-fill"
                    style={{ width: `${(selectedNumbers.length / PICKS_REQUIRED) * 100}%` }}
                  />
                </div>
                <span className="lottery-progress-text">
                  {selectedNumbers.length}<em>/{PICKS_REQUIRED}</em>
                </span>
              </div>
            </div>

            <div className="lottery-number-grid">
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => (
                <NumberCell
                  key={num}
                  num={num}
                  selected={selectedNumbers}
                  disabled={!selectedNumbers.includes(num) && selectedNumbers.length >= PICKS_REQUIRED}
                  onToggle={toggleNumber}
                />
              ))}
            </div>

            {selectedNumbers.length > 0 && (
              <div className="lottery-ticket-preview">
                <span className="lottery-tp-label">Your ticket</span>
                <div className="lottery-tp-nums">
                  {selectedNumbers.map(n => (
                    <span key={n} className="lottery-tp-num">{n < 10 ? `0${n}` : n}</span>
                  ))}
                  {Array.from({ length: PICKS_REQUIRED - selectedNumbers.length }).map((_, i) => (
                    <span key={`e-${i}`} className="lottery-tp-num empty">__</span>
                  ))}
                </div>
              </div>
            )}

            <div className="lottery-controls">
              <div className="lottery-controls-row">
                <button className="lottery-btn-ghost" onClick={autoPick}>⚡ Auto Pick</button>
                <button className="lottery-btn-ghost" onClick={clearPicks}>✕ Clear</button>
              </div>
              <button
                className={`lottery-cta${readyToBuy ? ' active' : ''}`}
                onClick={startDraw}
                disabled={!readyToBuy}
              >
                <span>Buy Ticket</span>
                <span className="lottery-cta-price">{ENTRY_FEE} PCC</span>
              </button>
            </div>
          </div>
        )}

        {/* ══ DRAW PANEL ══ */}
        {(gameState === 'drawing' || gameState === 'finished') && (
          <div className="lottery-draw-panel">

            <div className="lottery-draw-section">
              <div className="lottery-draw-section-label">
                {gameState === 'drawing'
                  ? <><span className="lottery-drawing-dot" /> Drawing numbers…</>
                  : 'Winning Numbers'}
              </div>
              <div className="lottery-balls-row">
                {drawnNumbers.map((n, i) => (
                  <DrawnBall key={i} num={n} isMatch={selectedNumbers.includes(n)} />
                ))}
                {Array.from({ length: PICKS_REQUIRED - drawnNumbers.length }).map((_, i) => (
                  <div key={`ph-${i}`} className="lottery-ball ball-placeholder">
                    <span>?</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lottery-divider"><span>Your Ticket</span></div>

            <div className="lottery-draw-section">
              <div className="lottery-balls-row">
                {selectedNumbers.map(n => (
                  <TicketBall key={n} num={n} isMatch={drawnNumbers.includes(n)} />
                ))}
              </div>
            </div>

            {gameState === 'finished' && (
              <div className={`lottery-result ${prize > 0 ? 'win' : 'loss'}`}>
                <div className="lottery-result-icon">{prize > 0 ? '🏆' : '◎'}</div>
                <h2 className="lottery-result-heading">
                  {prize > 0 ? 'You Won!' : matches > 0 ? `${matches} Match${matches > 1 ? 'es' : ''}` : 'No Match'}
                </h2>
                <p className="lottery-result-sub">
                  {prize > 0
                    ? <>You matched {matches} numbers - <strong>{prize.toLocaleString()} PCC</strong></>
                    : 'Better luck next time!'}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="lottery-btn lottery-btn-primary" onClick={playAgain}>
                    Play Again
                  </button>
                  <button className="lottery-btn lottery-btn-secondary" onClick={() => navigate('/gaming')}>
                    ← Back to Games
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}