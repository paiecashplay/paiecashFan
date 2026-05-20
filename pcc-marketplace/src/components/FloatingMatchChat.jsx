import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMatchDiscussion } from '../context/MatchDiscussionContext';
import MatchMessageBubble from './MatchMessageBubble';
import ChallengeModal from './ChallengeModal';
import { X, Minus, Maximize2, MessageSquare } from 'lucide-react';
import '../match-discussion.css';

const QUICK_REACTIONS = ['🔥', '⚽', '😱', '👏', '💀'];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('pcc_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function FloatingMatchChat({ roomId, index }) {
  const { 
    activeRooms, 
    messages: allMessages, 
    onlineCount: allCounts, 
    loading: allLoadings, 
    sendMessage, 
    respondChallenge, 
    toggleRoom 
  } = useMatchDiscussion();

  const activeRoom = activeRooms.find(r => r.id === roomId);
  const messages = allMessages[roomId] || [];
  const onlineCount = allCounts[roomId] || 0;
  const loading = allLoadings[roomId] || false;

  const [input, setInput] = useState('');
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const messagesContainerRef = useRef(null);
  const currentUser = getCurrentUser();

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e) => {
    // Only start drag if not clicking buttons or if minimized
    if (e.target.closest('button') || minimized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (!minimized) {
      const el = messagesContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, minimized]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(roomId, trimmed, 'text');
    setInput('');
  }, [input, sendMessage, roomId]);

  const handleReaction = useCallback((emoji) => {
    sendMessage(roomId, emoji, 'reaction');
  }, [sendMessage, roomId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeRoom) return null;

  const isLive = activeRoom.status === 'live';
  const baseLeft = 300 + (index * 360);

  return (
    <div style={{
      position: 'fixed',
      bottom: minimized ? 0 : 20,
      left: baseLeft,
      transform: minimized ? 'translate(0, 0)' : `translate(${pos.x}px, ${pos.y}px)`,
      width: 340,
      height: minimized ? 60 : 500,
      background: 'rgba(10, 15, 20, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 230, 118, 0.2)',
      borderRadius: minimized ? '16px 16px 0 0' : '16px 16px 0 0',
      boxShadow: isDragging ? '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,230,118,0.1)' : '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,230,118,0.05)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999 + index,
      transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), bottom 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      overflow: 'hidden'
    }}>
      {/* Header (Always Visible) */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => setMinimized(!minimized)}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(0,230,118,0.15), rgba(0,230,118,0.05))',
          borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: minimized ? 'pointer' : (isDragging ? 'grabbing' : 'grab'),
          touchAction: 'none' // prevent scrolling while dragging
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <MessageSquare size={18} color="#00e676" />
            {isLive && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #0a0f14' }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
              {activeRoom.team_a} vs {activeRoom.team_b}
            </span>
            {onlineCount > 0 && !minimized && (
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                👥 {onlineCount} Fans Online
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {minimized ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Maximize2 size={16} color="rgba(255,255,255,0.6)" />
            </button>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Minus size={16} color="rgba(255,255,255,0.6)" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleRoom(roomId); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} color="rgba(255,255,255,0.6)" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat Body (Hidden when minimized) */}
      {!minimized && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Messages */}
          <div className="md-messages" ref={messagesContainerRef} style={{ padding: '16px 12px' }}>
            {loading && (
              <div className="md-loading">
                <div className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="md-no-messages">
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: '0.8rem' }}>Be the first to start the discussion!</div>
              </div>
            )}

            {messages.map((msg) => (
              <MatchMessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUser?.id}
                onChallenge={(userId, username) => setChallengeTarget({ userId, username })}
                onChallengeResponse={respondChallenge}
              />
            ))}
          </div>

          {/* Quick reactions */}
          <div className="md-reactions" style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="md-reaction-btn"
                title={`React with ${emoji}`}
                style={{ padding: '4px 8px', fontSize: '1.2rem' }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="md-input-bar" style={{ padding: 12, background: 'rgba(0,0,0,0.3)' }}>
            <input
              type="text"
              className="md-input"
              placeholder={isLive ? "What's happening? ⚽" : "Share your thoughts..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              maxLength={500}
              style={{ fontSize: '0.85rem', padding: '10px 12px' }}
            />
            <button
              className="md-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              style={{ padding: '0 12px', fontSize: '0.85rem' }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {challengeTarget && (
        <ChallengeModal
          targetUserId={challengeTarget.userId}
          targetUsername={challengeTarget.username}
          onClose={() => setChallengeTarget(null)}
        />
      )}
    </div>
  );
}
