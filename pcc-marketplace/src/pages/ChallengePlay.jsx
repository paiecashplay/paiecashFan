import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallengeSession } from '../context/ChallengeSessionContext';
import { GAMES } from '../data/gamesData';
import { getInitials, getAvatarColor } from '../lib/chatHelpers';

// Game Components
import AviatorGame from './games/AviatorGame';
import SlotsGame from './games/SlotsGame';
import RouletteGame from './games/RouletteGame';
import CricketBash from './games/CricketBash';
import BraaiPoker from './games/BraaiPoker';
import LotoGame from './games/loto/LotoGame';
import LotteryGame from './games/lottery/LotteryGame';

import './challenge-play.css';

export default function ChallengePlay() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { 
    activeSession, joinSession, reportScore, finishSession, 
    myScore, opponentScore, sessionStatus, result, loading 
  } = useChallengeSession();

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    if (sessionId) {
      joinSession(sessionId);
    }
  }, [sessionId, joinSession]);

  // Expose hooks for games to report score and completion
  useEffect(() => {
    window.__reportChallengeScore = (score) => {
      reportScore(sessionId, score);
    };

    window.__reportChallengeComplete = (finalScore) => {
      const isChallenger = currentUser.id === activeSession?.challenger_id;
      const opponentId = isChallenger ? activeSession?.challenged_id : activeSession?.challenger_id;
      // Wait to see opponent's score before deciding winner? 
      // Actually, completeSession backend might want the winner.
      // If we just report our final score, we can let backend decide if we just want to send who we think won.
      // For a simple approach, we'll let whoever finishes first claim win if they have more, 
      // or we just trust the finalScore passed.
      const winnerId = finalScore > opponentScore ? currentUser.id : 
                       (opponentScore > finalScore ? opponentId : null); // null for tie
      finishSession(sessionId, winnerId);
    };

    return () => {
      delete window.__reportChallengeScore;
      delete window.__reportChallengeComplete;
    };
  }, [sessionId, reportScore, finishSession, currentUser.id, activeSession, opponentScore]);

  if (loading || !activeSession) {
    return <div className="challenge-play-wrapper">Loading game...</div>;
  }

  const game = GAMES.find(g => g.id === activeSession.game_id);
  const isChallenger = currentUser.id === activeSession.challenger_id;
  const oppId = isChallenger ? activeSession.challenged_id : activeSession.challenger_id;

  const renderGame = () => {
    switch (activeSession.game_id) {
      case 'aviator': return <AviatorGame game={game} />;
      case 'slots': return <SlotsGame game={game} />;
      case 'roulette': return <RouletteGame game={game} />;
      case 'cricket': return <CricketBash game={game} />;
      case 'braai_poker': return <BraaiPoker game={game} />;
      case 'loto': return <LotoGame game={game} />;
      case 'lottery649': return <LotteryGame game={game} />;
      default: return <div>Game not found</div>;
    }
  };

  // Determine progress bar percentages
  const maxScore = Math.max(myScore, opponentScore, 100); // minimum scale 100
  const myPct = Math.min(100, (myScore / maxScore) * 100);
  const oppPct = Math.min(100, (opponentScore / maxScore) * 100);

  let statusLabel = 'TIED';
  let statusColor = '#f59e0b'; // amber
  if (myScore > opponentScore) {
    statusLabel = "YOU'RE WINNING";
    statusColor = '#00ff88'; // green
  } else if (opponentScore > myScore) {
    statusLabel = 'OPPONENT LEADING';
    statusColor = '#ef4444'; // red
  }

  return (
    <div className="challenge-play-wrapper">
      
      {/* RESULT SCREEN OVERLAY */}
      {sessionStatus === 'completed' && result && (
        <div className="challenge-result-overlay">
          <div className="challenge-result-card">
            <div className="result-icon">
              {result.winnerId === currentUser.id ? '🏆' : (result.winnerId ? '💀' : '🤝')}
            </div>
            <h2>
              {result.winnerId === currentUser.id ? 'YOU WIN!' : 
               (result.winnerId ? 'YOU LOSE' : 'IT\'S A TIE!')}
            </h2>
            
            <div className="result-scores">
              <div className="score-box my-score">
                <div className="score-label">Your Score</div>
                <div className="score-value">{result.myScore}</div>
              </div>
              <div className="score-box opp-score">
                <div className="score-label">Their Score</div>
                <div className="score-value">{result.opponentScore}</div>
              </div>
            </div>

            <div className="result-actions">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/match-discussion', { replace: true })}
              >
                ← Back to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-GAME HUD */}
      {sessionStatus !== 'completed' && (
        <div className="challenge-hud">
          <div className="hud-player me">
            <div className="hud-avatar" style={{ background: getAvatarColor(currentUser.id) }}>
              {getInitials(currentUser.id)}
            </div>
            <div className="hud-info">
              <div className="hud-name">You</div>
              <div className="hud-score">{myScore.toLocaleString()}</div>
            </div>
          </div>

          <div className="hud-center">
            <div className="hud-title">⚔️ {activeSession.game_name}</div>
            <div className="hud-status" style={{ color: statusColor }}>{statusLabel}</div>
            <div className="hud-bars">
              <div className="hud-bar-bg my-bar-bg">
                <div className="hud-bar-fill" style={{ width: `${myPct}%`, background: '#00ff88' }}></div>
              </div>
              <div className="hud-bar-bg opp-bar-bg">
                <div className="hud-bar-fill" style={{ width: `${oppPct}%`, background: '#ef4444' }}></div>
              </div>
            </div>
          </div>

          <div className="hud-player opponent">
            <div className="hud-info" style={{ textAlign: 'right' }}>
              <div className="hud-name">Opponent</div>
              <div className="hud-score">{opponentScore.toLocaleString()}</div>
            </div>
            <div className="hud-avatar" style={{ background: getAvatarColor(oppId) }}>
              {getInitials(oppId)}
            </div>
          </div>
        </div>
      )}

      {/* GAME RENDERER */}
      <div className="challenge-game-container">
        {renderGame()}
      </div>
    </div>
  );
}
