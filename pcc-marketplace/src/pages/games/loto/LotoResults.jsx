import { useEffect, useRef } from 'react';
import LotoCard from './LotoCard';

export default function LotoResults({ winner, winResult, myCard, markedNumbers, onPlayAgain, onBackToLobby, onViewLeaderboard }) {
  const isMyWin = winner && !winner.isBot;
  const headerRef = useRef(null);

  // Canvas confetti on player win
  useEffect(() => {
    if (!isMyWin) return;
    import('canvas-confetti').then(mod => {
      const confetti = mod.default;
      const end = Date.now() + 3500;
      const colors = ['#ffc832', '#ef4444', '#22c55e', '#6366f1', '#f472b6'];
      const fire = () => {
        confetti({
          particleCount: 25,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 25,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(fire);
      };
      fire();
    }).catch(() => { });
  }, [isMyWin]);

  const drawCount = winResult?.drawCount ?? 0;
  const pattern = winResult?.pattern ?? '-';
  const score = isMyWin ? (winResult?.score ?? 0) : 0;

  return (
    <div className="lr-page">
      {/* Ambient glow behind result */}
      <div className={`lr-ambient ${isMyWin ? 'lr-ambient-win' : 'lr-ambient-lose'}`} />

      {/* ── Header ── */}
      <div className="lr-header fly-in" ref={headerRef}>
        <div className="lr-trophy">{isMyWin ? '🏆' : '💀'}</div>
        <h2 className={`lr-title ${isMyWin ? 'lr-title-win' : 'lr-title-lose'}`}>
          {isMyWin ? 'BINGO!' : 'Game Over'}
        </h2>
        <p className="lr-subtitle">
          {isMyWin
            ? `You completed the ${pattern} pattern`
            : `${winner?.username ?? 'Opponent'} called BINGO with ${pattern}`}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="lr-stats fly-in">
        <div className="lr-stat">
          <div className="lr-stat-value">{drawCount}</div>
          <div className="lr-stat-label">Numbers Drawn</div>
        </div>
        <div className="lr-stat lr-stat-accent">
          <div className="lr-stat-value">{isMyWin ? score.toLocaleString() : '-'}</div>
          <div className="lr-stat-label">Your Score</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-value">{pattern}</div>
          <div className="lr-stat-label">Pattern</div>
        </div>
      </div>

      {/* ── Card replay ── */}
      {myCard && (
        <div className="lr-card-wrap fly-in">
          <div className="lr-card-label">Your Card</div>
          <LotoCard
            card={myCard}
            markedNumbers={markedNumbers}
            drawnNumbers={markedNumbers}
            winningCells={winResult?.winningCells || []}
            onCellClick={null}
          />
        </div>
      )}

      {/* ── Actions ── */}
      <div className="lr-actions fly-in">
        <button className="lr-btn-primary" onClick={onPlayAgain}>
          🎲 Play Again - 5 PCC
        </button>
        <button className="lr-btn-secondary" onClick={onBackToLobby}>
          ← Lobby
        </button>
        {onViewLeaderboard && (
          <button className="lr-btn-ghost" onClick={onViewLeaderboard}>
            🏆 Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}