import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function PostCard({ post, currentUserId, onLike, onDelete, onEdit, compact = false }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const menuRef = useRef(null);

  const isOwner = post.user_id === currentUserId;
  const av = getAvatarStyle(post.user?.name || post.user?.email);
  const displayName = post.user?.name || post.user?.email?.split('@')[0] || 'Unknown';

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike?.(post.id);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/feed/${post.id}`);
  };

  const truncatedContent = compact && post.content?.length > 280
    ? post.content.substring(0, 280)
    : post.content;

  return (
    <>
      <div className="post-card">
        {/* Header */}
        <div className="post-card-header">
          <div className="post-avatar" style={{ backgroundColor: av.bg, color: av.fg, overflow: 'hidden' }}>
            <img 
              src={post.user?.avatar || `https://i.pravatar.cc/150?u=${post.user_id}`} 
              alt={displayName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={e => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.textContent = getInitials(displayName);
              }}
            />
          </div>
          <div className="post-user-info">
            <div className="post-user-name">{displayName}</div>
            <div className="post-timestamp">{timeAgo(post.created_at)}</div>
          </div>
          {isOwner && (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="post-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(p => !p); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div className="post-menu-dropdown">
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(post); }}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(post.id); }}>
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="post-content" onClick={() => navigate(`/feed/${post.id}`)} style={{ cursor: 'pointer' }}>
          {truncatedContent}
          {compact && post.content?.length > 280 && (
            <span className="post-read-more">Read more</span>
          )}
        </div>

        {/* Media (Image or Video) */}
        {post.image_url && (
          /\.(mp4|webm|mov|avi)(\?|$)/i.test(post.image_url) ? (
            <div className="post-image-container" onClick={(e) => e.stopPropagation()}>
              <video src={post.image_url} className="post-image" controls preload="metadata" style={{ objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="post-image-container" onClick={(e) => { e.stopPropagation(); setLightbox(true); }}>
              <img src={post.image_url} alt="Post" className="post-image" loading="lazy" />
            </div>
          )
        )}

        {/* Actions */}
        <div className="post-actions">
          <button className={`post-action-btn${post.is_liked ? ' liked' : ''}${likeAnim ? ' like-animate' : ''}`} onClick={handleLike}>
            <svg viewBox="0 0 24 24" fill={post.is_liked ? '#ff4081' : 'none'} stroke={post.is_liked ? '#ff4081' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes_count > 0 && <span>{post.likes_count}</span>}
          </button>

          <button className="post-action-btn" onClick={handleCommentClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post.comments_count > 0 && <span>{post.comments_count}</span>}
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightbox && post.image_url && (
        <div className="image-lightbox" onClick={() => setLightbox(false)}>
          <img src={post.image_url} alt="Post full" />
        </div>
      )}
    </>
  );
}
