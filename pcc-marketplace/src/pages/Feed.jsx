import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import api from '../api';
import { useProfile } from '../hooks/useProfile';
import PostCard from '../components/posts/PostCard';
import CreatePostModal from '../components/posts/CreatePostModal';
import MessagingOverlay from '../components/MessagingOverlay';
import './feed.css';

/* ─── Skeleton ───────────────────────────────────────────────── */
const SkeletonPost = () => (
  <div className="skeleton-post">
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <div className="skeleton skeleton-circle" />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" style={{ width: '20%', height: 10 }} />
      </div>
    </div>
    <div className="skeleton skeleton-line long" />
    <div className="skeleton skeleton-line medium" />
    <div className="skeleton skeleton-image" />
  </div>
);

/* ─── Left Sidebar: Profile Card ─────────────────────────────── */
function ProfileSidebar({ user }) {
  const { profileImage, fallbackImage } = useProfile(user);
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <aside className="feed-sidebar feed-sidebar--left">
      {/* Profile Card */}
      <div className="sidebar-card profile-card">
        <div className="profile-card-banner" />
        <div className="profile-card-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={profileImage}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
          />
        </div>
        <div className="profile-card-body">
          <h3 className="profile-card-name">{displayName}</h3>
          <p className="profile-card-email">{user?.email}</p>
        </div>
        <div className="profile-card-links">
          <a href="/clubs" className="profile-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Clubs
          </a>
          <a href="/gaming" className="profile-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="17" cy="10" r="1" /><circle cx="15" cy="13" r="1" /></svg>
            Gaming
          </a>
          <a href="/chat" className="profile-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Messages
          </a>
          <a href="/contests" className="profile-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            Contests
          </a>
        </div>
      </div>
    </aside>
  );
}

/* ─── Right Sidebar: Trending / Info ─────────────────────────── */
function TrendingSidebar() {
  const trendingItems = [
    { tag: 'Paiecash Launch', posts: '1.2K members' },
    { tag: 'PCC Marketplace', posts: 'New clubs joining' },
    { tag: 'Crypto Gaming', posts: 'Trending now' },
    { tag: 'Fan Tokens', posts: 'Sports & clubs' },
    { tag: 'DeFi Community', posts: 'Growing fast' },
  ];

  return (
    <aside className="feed-sidebar feed-sidebar--right">
      {/* Trending Card */}
      <div className="sidebar-card trending-card">
        <h3 className="sidebar-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          Trending
        </h3>
        <div className="trending-list">
          {trendingItems.map((item, i) => (
            <div key={i} className="trending-item">
              <span className="trending-tag">{item.tag}</span>
              <span className="trending-meta">{item.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          About Paiecash
        </h3>
        <p className="sidebar-about-text">Fan token payment ecosystem on Polygon. Buy, trade, and use PCC across clubs, gaming, and marketplace.</p>
        <div className="sidebar-footer-links">
          <span>Terms</span><span>·</span>
          <span>Privacy</span><span>·</span>
          <span>Help</span>
        </div>
        <div className="sidebar-copyright">Paiecash © 2026</div>
      </div>
    </aside>
  );
}

/* ─── Main Feed Page ─────────────────────────────────────────── */
export default function Feed() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = useMemo(() => {
    try {
      const obj = JSON.parse(localStorage.getItem('pcc_user'));
      return obj?.id || obj?._id || obj?.userId;
    } catch { return null; }
  }, []);

  const loadFeed = useCallback(async (offset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      const data = await api.getFeed(20, offset);
      if (append) setPosts(prev => [...prev, ...data.posts]);
      else setPosts(data.posts);
      setHasMore(data.hasMore);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [showToast]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleCreatePost = async (formData, editId) => {
    setSubmitting(true);
    try {
      if (editId) {
        const updated = await api.updatePost(editId, formData);
        setPosts(prev => prev.map(p => p.id === editId ? { ...p, ...updated, user: p.user } : p));
        showToast('Post updated!', 'success');
      } else {
        await api.createPost(formData);
        showToast('Post created!', 'success');
        loadFeed();
      }
      setModalOpen(false);
      setEditingPost(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Post deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await api.toggleLike(postId);
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return { ...p, is_liked: result.liked, likes_count: result.liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1) };
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (post) => { setEditingPost(post); setModalOpen(true); };
  const { profileImage, fallbackImage } = useProfile(user);
  const displayName = user?.name || user?.email?.split('@')[0] || 'U';

  return (
    <div className="feed-layout">
      {/* LEFT SIDEBAR */}
      <ProfileSidebar user={user} />

      {/* CENTER FEED */}
      <main className="feed-center">
        {/* Create Post Box - LinkedIn style */}
        <div className="create-post-card">
          <div className="create-post-top">
            <div className="create-post-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={profileImage}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
              />
            </div>
            <button className="create-post-placeholder" onClick={() => { setEditingPost(null); setModalOpen(true); }}>
              Start a post
            </button>
          </div>
          <div className="create-post-actions-row">
            <button className="create-action-btn" onClick={() => { setEditingPost(null); setModalOpen(true); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              <span>Photo</span>
            </button>
            <button className="create-action-btn" onClick={() => { setEditingPost(null); setModalOpen(true); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
              <span>Video</span>
            </button>
          </div>
        </div>



        {/* Posts */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onDelete={handleDelete}
                onEdit={handleEdit}
                compact
              />
            ))}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <button className="feed-load-more-btn" onClick={() => loadFeed(posts.length, true)} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <TrendingSidebar />

      {/* Create/Edit Modal */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingPost(null); }}
        onSubmit={handleCreatePost}
        editingPost={editingPost}
        submitting={submitting}
      />

      <MessagingOverlay />
    </div>
  );
}
