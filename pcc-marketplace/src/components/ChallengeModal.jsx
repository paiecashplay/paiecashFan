// ═══════════════════════════════════════════════════════════════
// components/ChallengeModal.jsx
// Shown when user clicks "⚔️ Challenge" on another user's message
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { GAMES } from '../data/gamesData';
import { useMatchDiscussion } from '../context/MatchDiscussionContext';

const CHALLENGEABLE_GAMES = GAMES.filter(g => g.playable);

export default function ChallengeModal({ targetUserId, targetUsername, onClose }) {
  const { sendChallenge } = useMatchDiscussion();
  const [selectedGame, setSelectedGame] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleConfirm = async () => {
    if (!selectedGame) return;
    setSending(true);
    try {
      await sendChallenge(targetUserId, selectedGame.id, selectedGame.title);
      setSent(true);
      setTimeout(onClose, 1500);
    } catch {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1101, width: 380, maxWidth: 'calc(100vw - 32px)',
        background: '#111', border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
      }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
            <div style={{ fontWeight: 800, color: '#00ff88', fontSize: 16 }}>Challenge Sent!</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 4 }}>CHALLENGE</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>
                Challenge <span style={{ color: '#00ff88' }}>{targetUsername}</span> to a game
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
              {CHALLENGEABLE_GAMES.map(game => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                    background: selectedGame?.id === game.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                    border: selectedGame?.id === game.id ? '1px solid rgba(0,255,136,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{game.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{game.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Entry: {game.entryFee} PCC</div>
                  </div>
                  {selectedGame?.id === game.id && (
                    <span style={{ marginLeft: 'auto', color: '#00ff88', fontWeight: 900 }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedGame || sending}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 12,
                  background: selectedGame ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)',
                  border: selectedGame ? '1px solid rgba(0,255,136,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: selectedGame ? '#00ff88' : 'rgba(255,255,255,0.2)',
                  fontWeight: 800, fontSize: 13, cursor: selectedGame ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {sending ? 'Sending…' : '⚔️ Send Challenge'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
