import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallengeSession } from '../context/ChallengeSessionContext';
import { getInitials, getAvatarColor } from '../lib/chatHelpers';
import './challenge-lobby.css';

function Avatar({ username }) {
  const color = getAvatarColor(username);
  const initials = getInitials(username);
  return (
    <div className="lobby-avatar" style={{ background: color }}>
      {initials}
    </div>
  );
}

export default function ChallengeLobby() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { activeSession, joinSession, markReady, sessionStatus, loading } = useChallengeSession();
  
  const [countdown, setCountdown] = useState(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    if (sessionId) {
      joinSession(sessionId);
      
      // Auto-mark ready after 2 seconds
      const timer = setTimeout(() => {
        markReady(sessionId);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, joinSession, markReady]);

  // Handle countdown when both are ready
  useEffect(() => {
    if (activeSession?.challenger_ready && activeSession?.challenged_ready && sessionStatus === 'in_progress') {
      setCountdown(3);
    }
  }, [activeSession?.challenger_ready, activeSession?.challenged_ready, sessionStatus]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate(`/challenge-play/${sessionId}`, { replace: true });
    }
  }, [countdown, navigate, sessionId]);

  if (loading || !activeSession) {
    return (
      <div className="lobby-container">
        <div className="lobby-loading">Loading challenge...</div>
      </div>
    );
  }

  // Figure out who is who
  const isChallenger = currentUser.id === activeSession.challenger_id;
  const myReady = isChallenger ? activeSession.challenger_ready : activeSession.challenged_ready;
  const oppReady = isChallenger ? activeSession.challenged_ready : activeSession.challenger_ready;
  
  // Since we don't store full usernames in session currently, we'll use placeholder or ID
  // Wait, we don't have usernames in challenge_sessions. Let's just use "You" and "Opponent"
  const myName = 'You';
  const oppName = 'Opponent';

  const handleCancel = async () => {
    // In a real app we'd call an API to cancel. For now just navigate back.
    navigate('/match-discussion', { replace: true });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <h2>⚔️ CHALLENGE MATCH ⚔️</h2>
          <div className="lobby-game-name">Playing: <span>{activeSession.game_name}</span></div>
        </div>

        <div className="lobby-players">
          <div className="lobby-player">
            <Avatar username={currentUser.id} />
            <div className="lobby-player-name">{myName}</div>
            <div className={`lobby-status ${myReady ? 'ready' : 'waiting'}`}>
              <div className="status-dot"></div>
              {myReady ? 'Ready' : 'Waiting...'}
            </div>
          </div>

          <div className="lobby-vs">VS</div>

          <div className="lobby-player">
            <Avatar username={isChallenger ? activeSession.challenged_id : activeSession.challenger_id} />
            <div className="lobby-player-name">{oppName}</div>
            <div className={`lobby-status ${oppReady ? 'ready' : 'waiting'}`}>
              <div className="status-dot"></div>
              {oppReady ? 'Ready' : 'Waiting...'}
            </div>
          </div>
        </div>

        <div className="lobby-footer">
          {countdown !== null ? (
            <div className="lobby-countdown-box">
              <div>Both players ready!</div>
              <div className="countdown-number">{countdown > 0 ? countdown : 'GO!'}</div>
            </div>
          ) : (
            <button className="lobby-cancel-btn" onClick={handleCancel}>Cancel Challenge</button>
          )}
        </div>
      </div>
    </div>
  );
}
