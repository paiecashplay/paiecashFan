import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api';
import PostCard from '../components/posts/PostCard';
import CommentSection from '../components/posts/CommentSection';
import CreatePostModal from '../components/posts/CreatePostModal';
import './feed.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = useMemo(() => {
    try {
      const obj = JSON.parse(localStorage.getItem('pcc_user'));
      return obj?.id || obj?._id || obj?.userId;
    } catch { return null; }
  }, []);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPost(postId);
      setPost(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  }, [postId, showToast]);

  const loadComments = useCallback(async (offset = 0, append = false) => {
    try {
      setCommentsLoading(true);
      const data = await api.getComments(postId, 50, offset);
      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      setCommentsHasMore(data.hasMore);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setCommentsLoading(false);
  }, [postId, showToast]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  const handleLike = async (id) => {
    try {
      const result = await api.toggleLike(id);
      setPost(prev => ({
        ...prev,
        is_liked: result.liked,
        likes_count: result.liked ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1),
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(id);
      showToast('Post deleted', 'success');
      navigate('/feed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditSubmit = async (formData, editId) => {
    setSubmitting(true);
    try {
      const updated = await api.updatePost(editId, formData);
      setPost(prev => ({ ...prev, ...updated, user: prev.user }));
      showToast('Post updated!', 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setSubmitting(false);
  };

  const handleAddComment = async (content) => {
    const data = await api.addComment(postId, content);
    setComments(prev => [...prev, data]);
    setPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPost(prev => ({ ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) }));
      showToast('Comment deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const updated = await api.updateComment(commentId, content);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updated } : c));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
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
          <div className="skeleton skeleton-line full" />
          <div className="skeleton skeleton-image" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="feed-empty">
          <div className="feed-empty-icon">🔍</div>
          <h3>Post not found</h3>
          <p>This post may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <button className="post-detail-back" onClick={() => navigate('/feed')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Feed
      </button>

      <PostCard
        post={post}
        currentUserId={currentUserId}
        onLike={handleLike}
        onDelete={handleDelete}
        onEdit={() => setModalOpen(true)}
      />

      <div className="post-card" style={{ marginTop: -8, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <CommentSection
          comments={comments}
          hasMore={commentsHasMore}
          loading={commentsLoading}
          currentUserId={currentUserId}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
          onLoadMore={() => loadComments(comments.length, true)}
        />
      </div>

      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEditSubmit}
        editingPost={post}
        submitting={submitting}
      />
    </div>
  );
}
