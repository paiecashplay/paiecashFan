// ═══════════════════════════════════════════════════════════════
// components/MatchMessageBubble.jsx
// Props: { message, currentUserId, onChallenge, onChallengeResponse }
// Three variants: text | reaction | challenge
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';

// ─── Avatar ────────────────────────────────────────────────────
function Avatar({ username, color }) {
  const initials = (username || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: color || '#00ff88',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 900, color: '#0a0a0a',
    }}>
      {initials}
    </div>
  );
}

// ─── Text Message ───────────────────────────────────────────────
function TextBubble({ message, isOwn, onChallenge }) {
  const [hovering, setHovering] = useState(false);
  const isOptimistic = message._optimistic;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 8, alignItems: 'flex-start', position: 'relative',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isOwn && <Avatar username={message.username} color={message.avatar_color} />}

      <div style={{ maxWidth: '70%' }}>
        {!isOwn && (
          <div style={{ fontSize: 11, fontWeight: 700, color: message.avatar_color || '#00ff88', marginBottom: 3 }}>
            {message.username}
          </div>
        )}
        <div style={{
          background: isOwn ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.06)',
          border: isOwn ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '9px 13px',
          fontSize: 13,
          color: isOptimistic ? 'rgba(255,255,255,0.5)' : '#f0f0f0',
          lineHeight: 1.45,
          wordBreak: 'break-word',
        }}>
          {message.message}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3, textAlign: isOwn ? 'right' : 'left' }}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOptimistic && ' · sending…'}
        </div>
      </div>

      {/* Challenge option on hover (for other users' messages) */}
      {hovering && !isOwn && onChallenge && (
        <button
          onClick={() => onChallenge(message.user_id, message.username)}
          style={{
            position: 'absolute', right: 0, top: 0,
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700,
            color: '#00ff88', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          ⚔️ Challenge
        </button>
      )}
    </div>
  );
}

// ─── Reaction Message - renders like a normal message bubble ────
function ReactionBubble({ message, isOwn }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      gap: 8,
      alignItems: 'flex-start',
    }}>
      {!isOwn && <Avatar username={message.username} color={message.avatar_color} />}
      <div style={{ maxWidth: '70%' }}>
        {!isOwn && (
          <div style={{ fontSize: 11, fontWeight: 700, color: message.avatar_color || '#00ff88', marginBottom: 3 }}>
            {message.username}
          </div>
        )}
        <div style={{
          background: isOwn ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.06)',
          border: isOwn ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '8px 14px',
          fontSize: '1.6rem',
          lineHeight: 1.3,
        }}>
          {message.message}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3, textAlign: isOwn ? 'right' : 'left' }}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ─── Challenge Message Card ──────────────────────────────────────
function ChallengeBubble({ message, currentUserId, onChallengeResponse }) {
  const meta = message.metadata || {};

  const isChallenged = !!(
    currentUserId &&
    meta.challenged_id &&
    String(currentUserId) === String(meta.challenged_id)
  );

  // Track what the user responded as: null | 'accepted' | 'declined'
  const [respondedAs, setRespondedAs] = useState(null);

  // Effective status: local response takes priority over stored metadata
  const effectiveStatus = respondedAs || meta.status;
  const isPending = effectiveStatus === 'pending';

  const handleResponse = async (status) => {
    // Optimistically update UI immediately
    setRespondedAs(status);

    if (status === 'accepted') {
      try {
        const token = (() => {
          try { return JSON.parse(localStorage.getItem('pcc_user') || '{}').token; } catch { return null; }
        })();
        const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
        const res = await fetch(`${API_BASE}/api/match-rooms/challenges/${meta.challenge_id}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();

        // Also update the message metadata so it persists on refresh
        try {
          const { supabase } = await import('../api');
          await supabase
            .from('match_messages')
            .update({ metadata: { ...meta, status: 'accepted' } })
            .eq('id', message.id);
        } catch (e) { console.warn('Could not update message metadata:', e); }

        if (data.success && data.data?.session?.id) {
          localStorage.setItem('active_challenge_session', data.data.session.id);
          window.location.href = `/challenge-lobby/${data.data.session.id}`;
        } else {
          console.error('[Accept] API returned error:', data);
        }
      } catch (err) {
        console.error('Failed to accept challenge:', err);
        setRespondedAs(null); // revert on failure
      }
    } else {
      // Declined
      try {
        if (onChallengeResponse) {
          await onChallengeResponse(meta.challenge_id, status);
        }
        // Also update the message metadata so it persists on refresh
        try {
          const { supabase } = await import('../api');
          await supabase
            .from('match_messages')
            .update({ metadata: { ...meta, status: 'declined' } })
            .eq('id', message.id);
        } catch (e) { console.warn('Could not update message metadata:', e); }
      } catch (err) {
        console.error('Failed to decline challenge:', err);
        setRespondedAs(null); // revert on failure
      }
    }
  };

  const gameRoute = (() => {
    const routes = {
      aviator: '/gaming/play/aviator',
      roulette: '/gaming/play/roulette',
      slots: '/gaming/play/slots',
      loto: '/games/loto',
      lottery649: '/games/lottery649',
      cricket: '/games/cricket',
      braai_poker: '/games/braai-poker',
    };
    return routes[meta.game_id] || '/gaming';
  })();

  return (
    <div style={{
      margin: '6px auto', maxWidth: 340,
      background: 'rgba(0,255,136,0.04)',
      border: '1px solid rgba(0,255,136,0.2)',
      borderRadius: 16, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>
        ⚔️ <span style={{ color: '#00ff88' }}>{message.username}</span> challenged{' '}
        <span style={{ color: meta.challenged_id === currentUserId ? '#f59e0b' : 'rgba(255,255,255,0.8)' }}>
          {meta.challenged_id === currentUserId ? 'you' : meta.challenged_id}
        </span>{' '}
        to <strong>{meta.game_name}</strong>
      </div>

      {/* Pending + I am the challenged user */}
      {isChallenged && isPending && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => handleResponse('accepted')}
            style={{
              flex: 1, padding: '7px 0', background: 'rgba(0,255,136,0.12)',
              border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8,
              color: '#00ff88', fontWeight: 800, fontSize: 12, cursor: 'pointer',
            }}
          >
            ✅ Accept
          </button>
          <button
            onClick={() => handleResponse('declined')}
            style={{
              flex: 1, padding: '7px 0', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
              color: '#ef4444', fontWeight: 800, fontSize: 12, cursor: 'pointer',
            }}
          >
            ✖ Decline
          </button>
        </div>
      )}

      {/* Accepted */}
      {effectiveStatus === 'accepted' && (
        <a
          href={gameRoute}
          style={{
            display: 'block', marginTop: 8, textAlign: 'center',
            padding: '7px 0', background: 'rgba(0,255,136,0.12)',
            border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8,
            color: '#00ff88', fontWeight: 800, fontSize: 12, textDecoration: 'none',
          }}
        >
          ✅ Challenge Accepted → Play {meta.game_name}
        </a>
      )}

      {/* Declined */}
      {effectiveStatus === 'declined' && (
        <div style={{ marginTop: 8, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 700 }}>
          Challenge Declined
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────
export default function MatchMessageBubble({ message, currentUserId, onChallenge, onChallengeResponse }) {
  const isOwn = message.user_id === currentUserId;
  if (message.message_type === 'reaction') {
    return <ReactionBubble message={message} isOwn={isOwn} />;
  }
  if (message.message_type === 'challenge') {
    return (
      <ChallengeBubble
        message={message}
        currentUserId={currentUserId}
        onChallengeResponse={onChallengeResponse}
      />
    );
  }
  return (
    <TextBubble
      message={message}
      isOwn={message.user_id === currentUserId}
      onChallenge={onChallenge}
    />
  );
}
