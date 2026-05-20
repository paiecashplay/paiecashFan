import React, { useState, useRef, useCallback } from 'react';

const AVATAR_COLORS = [
  { bg: '#1a2e20', fg: '#00ff87' },
  { bg: '#1e1a30', fg: '#a78bfa' },
  { bg: '#1e1a20', fg: '#fb923c' },
  { bg: '#1a1e30', fg: '#38bdf8' },
  { bg: '#2a1a20', fg: '#f472b6' },
  { bg: '#1a2020', fg: '#2dd4bf' },
];

function getAvatarStyle(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(/[\s_]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function CommentSection({
  comments = [],
  hasMore = false,
  loading = false,
  currentUserId,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onLoadMore,
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef(null);

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onAddComment(text.trim());
      setText('');
    } catch (e) { /* handled by parent */ }
    setSending(false);
  }, [text, sending, onAddComment]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return;
    await onEditComment(commentId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="comments-section">
      {/* Comments list */}
      {comments.length > 0 && (
        <div className="comments-list">
          {comments.map((comment) => {
            const av = getAvatarStyle(comment.user?.name || comment.user?.email);
            const name = comment.user?.name || comment.user?.email?.split('@')[0] || 'Unknown';
            const isOwner = comment.user_id === currentUserId;

            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar" style={{ backgroundColor: av.bg, color: av.fg, overflow: 'hidden' }}>
                  <img 
                    src={comment.user?.avatar || `https://i.pravatar.cc/150?u=${comment.user_id}`} 
                    alt={name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={e => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.textContent = getInitials(name);
                    }}
                  />
                </div>
                <div className="comment-body">
                  {editingId === comment.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="comment-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(comment.id); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus
                        maxLength={1000}
                        style={{ flex: 1 }}
                      />
                      <button className="comment-send-btn" onClick={() => handleEditSave(comment.id)} disabled={!editText.trim()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="comment-bubble">
                        <div className="comment-user-name">{name}</div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                      <div className="comment-meta">
                        <span className="comment-time">{timeAgo(comment.created_at)}</span>
                        {isOwner && (
                          <>
                            <button className="comment-action-btn" onClick={() => { setEditingId(comment.id); setEditText(comment.content); }}>Edit</button>
                            <button className="comment-action-btn delete" onClick={() => onDeleteComment(comment.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="comments-load-more">
              <button onClick={onLoadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more comments'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comment input */}
      <div className="comment-input-bar">
        <input
          ref={inputRef}
          className="comment-input"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          disabled={sending}
        />
        <button className="comment-send-btn" onClick={handleSend} disabled={!text.trim() || sending}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
