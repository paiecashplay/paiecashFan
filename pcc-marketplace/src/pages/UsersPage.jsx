import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getInitials, getAvatarColor } from '../lib/chatHelpers';
import { getGeneratedAvatarUrl } from '../hooks/useProfile';
import { useChatContext } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../App';
import './UsersPage.css';

/* ─── Avatar color palette (premium) ─────────────────────────────── */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
];

function getGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

/* ─── Skeleton ────────────────────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="suggest-card suggest-card--skeleton">
    <div className="skeleton skeleton-circle" />
    <div className="skeleton skeleton-line" style={{ width: '60%' }} />
    <div className="skeleton skeleton-line-sm" style={{ width: '40%' }} />
    <div className="skeleton skeleton-btn-s" />
  </div>
);

/* ─── User Profile Modal ─────────────────────────────────────────── */
const UserProfileModal = ({ user, onClose, onAddFriend, onAccept, onMessage, actionLoading }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!user) return null;

  const gradient = getGradient(user.username);
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="user-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="user-modal" ref={modalRef}>
        <button className="user-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Banner */}
        <div className="user-modal-banner" style={{ background: gradient }} />

        {/* Avatar */}
        <div className="user-modal-avatar-ring">
          <img
            src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
            alt={user.username}
            className="user-modal-avatar"
            style={{ background: gradient, objectFit: 'cover' }}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
          />
        </div>

        {/* Info */}
        <div className="user-modal-body">
          <h2>{user.username}</h2>
          {user.email && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 10, marginTop: -4 }}>
              {user.email}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            <span className="user-modal-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Joined {joinDate}
            </span>

            <span className="user-modal-badge" style={{
              borderColor: user.is_online ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)',
              background: user.is_online ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
              color: user.is_online ? '#34d399' : 'rgba(255,255,255,0.5)'
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: user.is_online ? '#34d399' : 'rgba(255,255,255,0.3)',
                boxShadow: user.is_online ? '0 0 8px #34d399' : 'none'
              }} />
              {user.is_online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* User Bio Card */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#02c767', letterSpacing: '1px', marginBottom: '6px', fontWeight: 'bold' }}>Bio</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
              {user.bio || 'Crypto enthusiast & active member of the PaieCashFan community. Ready to trade, play, and connect!'}
            </p>
          </div>

          <div className="user-modal-stats">
            <div className="user-modal-stat">
              <span className="stat-value">{user.friendship_status === 'accepted' ? '✓' : '-'}</span>
              <span className="stat-label">Friend</span>
            </div>
            <div className="user-modal-stat-divider" />
            <div className="user-modal-stat">
              <span className="stat-value">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="stat-label">Chat</span>
            </div>
            <div className="user-modal-stat-divider" />
            <div className="user-modal-stat">
              <span className="stat-value" style={{ fontSize: 13, letterSpacing: '0.5px' }}>
                {user.wallet_address ? `${user.wallet_address.substring(0, 4)}...${user.wallet_address.substring(user.wallet_address.length - 4)}` : 'N/A'}
              </span>
              <span className="stat-label">Wallet</span>
            </div>
          </div>

          {/* Actions */}
          <div className="user-modal-actions">
            {user.friendship_status === 'none' && (
              <button
                className="modal-btn modal-btn--primary"
                onClick={() => onAddFriend(user.user_id)}
                disabled={actionLoading[user.user_id]}
              >
                {actionLoading[user.user_id] ? (
                  <span className="modal-spinner" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Add Friend
                  </>
                )}
              </button>
            )}
            {user.friendship_status === 'pending_sent' && (
              <button className="modal-btn modal-btn--muted" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Request Sent
              </button>
            )}
            {user.friendship_status === 'pending_received' && (
              <button
                className="modal-btn modal-btn--accept"
                onClick={() => onAccept(user.user_id)}
                disabled={actionLoading[user.user_id]}
              >
                {actionLoading[user.user_id] ? (
                  <span className="modal-spinner" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Accept Request
                  </>
                )}
              </button>
            )}
            {user.friendship_status === 'accepted' && (
              <button
                className="modal-btn modal-btn--message"
                onClick={() => onMessage(user.user_id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────── */
const UsersPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [sportUsers, setSportUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const searchTimeoutRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollRefTeam = useRef(null);
  const scrollRefSport = useRef(null);
  const navigate = useNavigate();
  const { sendFriendRequest, acceptRequest, friends } = useChatContext();
  const { showToast } = useToast();
  const { user } = useAuth();

  let userSport = '';
  let userTeam = '';
  if (user?.country && user.country !== 'GLOBAL') {
    try {
      const p = JSON.parse(user.country);
      userSport = p.sport || '';
      userTeam = p.team || '';
    } catch (e) { }
  }

  const performSearch = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    setSearchPerformed(searchQuery.length >= 2);
    try {
      const url = searchQuery && searchQuery.length >= 2
        ? `/api/chat/users?q=${encodeURIComponent(searchQuery)}&limit=24`
        : `/api/chat/users?limit=20`;
      const { data } = await apiFetch(url);
      setUsers(data || []);

      // If this is not a search query, also fetch same sport/team suggestions
      if (!searchQuery || searchQuery.length < 2) {
        if (userTeam) {
          const { data: teamData } = await apiFetch(`/api/chat/users?q=${encodeURIComponent(userTeam)}&limit=15`);
          setTeamUsers(teamData?.filter(u => u.team?.toLowerCase() === userTeam.toLowerCase()) || []);
        }
        if (userSport) {
          const { data: sportData } = await apiFetch(`/api/chat/users?q=${encodeURIComponent(userSport)}&limit=15`);
          setSportUsers(sportData?.filter(u => u.sport?.toLowerCase() === userSport.toLowerCase()) || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { performSearch(''); }, [userSport, userTeam]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => performSearch(query), 350);
    } else if (query.length === 0) {
      searchTimeoutRef.current = setTimeout(() => performSearch(''), 350);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [query]);

  const handleAddFriend = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, friendship_status: 'pending_sent' } : u));
    if (selectedUser?.user_id === userId) setSelectedUser(prev => ({ ...prev, friendship_status: 'pending_sent' }));
    try {
      await sendFriendRequest(userId);
    } catch (err) {
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, friendship_status: 'none' } : u));
      if (selectedUser?.user_id === userId) setSelectedUser(prev => ({ ...prev, friendship_status: 'none' }));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAcceptRequest = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const { data: requests } = await apiFetch('/api/chat/requests/pending');
      const req = requests.find(r => r.sender.user_id === userId);
      if (req) {
        await acceptRequest(req.requestId);
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, friendship_status: 'accepted' } : u));
        if (selectedUser?.user_id === userId) setSelectedUser(prev => ({ ...prev, friendship_status: 'accepted' }));
      } else {
        throw new Error('Request not found');
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleMessage = (userId) => {
    sessionStorage.setItem('chat_target_friend_id', userId);
    navigate('/chat');
  };

  /* Scroll buttons */
  const scroll = (dir, ref = scrollRef) => {
    if (ref && ref.current) {
      ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  const renderActionBtn = (user, compact = false) => {
    const uid = user.user_id;
    if (user.friendship_status === 'none') {
      return (
        <button className="card-action-btn card-action-btn--add" onClick={(e) => { e.stopPropagation(); handleAddFriend(uid); }} disabled={actionLoading[uid]}>
          {actionLoading[uid] ? '...' : compact ? '+ Add' : 'Add Friend'}
        </button>
      );
    }
    if (user.friendship_status === 'pending_sent') {
      return <button className="card-action-btn card-action-btn--pending" disabled>Pending</button>;
    }
    if (user.friendship_status === 'pending_received') {
      return (
        <button className="card-action-btn card-action-btn--accept" onClick={(e) => { e.stopPropagation(); handleAcceptRequest(uid); }} disabled={actionLoading[uid]}>
          {actionLoading[uid] ? '...' : 'Accept'}
        </button>
      );
    }
    if (user.friendship_status === 'accepted') {
      return (
        <button className="card-action-btn card-action-btn--message" onClick={(e) => { e.stopPropagation(); handleMessage(uid); }}>
          Message
        </button>
      );
    }
    return null;
  };

  return (
    <div className="users-page">
      {/* Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAddFriend={handleAddFriend}
          onAccept={handleAcceptRequest}
          onMessage={handleMessage}
          actionLoading={actionLoading}
        />
      )}

      {/* Header */}
      <div className="users-header">
        <h1>
          <span className="header-accent">Find</span> People
        </h1>
        <p>Discover and connect with others in the PaieCashFan community</p>
      </div>

      {/* Search */}
      <div className="users-search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button className="users-search-clear" onClick={() => setQuery('')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="users-content">
        {loading ? (
          <div className="users-horizontal-scroll">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="users-empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => performSearch(query)}>Try Again</button>
          </div>
        ) : searchPerformed && users.length === 0 ? (
          <div className="users-empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No users found</h3>
            <p>We couldn't find anyone matching "{query}"</p>
          </div>
        ) : users.length > 0 ? (
          <>
            {!searchPerformed && friends && friends.length > 0 && (
              <div className="users-suggested-section">
                <div className="users-suggested-header">
                  <h2>Your Friends</h2>
                </div>
                <div className="users-horizontal-scroll">
                  {friends.map(f => {
                    const user = { ...f.profile, friendship_status: 'accepted' };
                    return (
                      <div
                        className="suggest-card"
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="suggest-card-banner" style={{ background: getGradient(user.username) }} />
                        <img
                          src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
                          alt={user.username}
                          className="suggest-card-avatar"
                          style={{ background: getGradient(user.username), objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
                        />
                        <h3 className="suggest-card-name">{user.username}</h3>
                        <span className="suggest-card-sub">Friend</span>
                        <div className="suggest-card-action">
                          {renderActionBtn(user, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!searchPerformed && (
              <div className="users-suggested-section" style={{ marginTop: friends && friends.length > 0 ? '32px' : 0 }}>
                <div className="users-suggested-header">
                  <h2>People You Might Know</h2>
                  <div className="scroll-arrows">
                    <button className="scroll-arrow" onClick={() => scroll(-1, scrollRef)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button className="scroll-arrow" onClick={() => scroll(1, scrollRef)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="users-horizontal-scroll" ref={scrollRef}>
                  {users.map(user => (
                    <div
                      className="suggest-card"
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="suggest-card-banner" style={{ background: getGradient(user.username) }} />
                      <img
                        src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
                        alt={user.username}
                        className="suggest-card-avatar"
                        style={{ background: getGradient(user.username), objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
                      />
                      <h3 className="suggest-card-name">{user.username}</h3>
                      {user.sport && user.team ? (
                        <span className="suggest-card-sub">⚽ {user.sport} • {user.team}</span>
                      ) : (
                        <span className="suggest-card-sub">PaieCashFan member</span>
                      )}
                      <div className="suggest-card-action">
                        {renderActionBtn(user, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchPerformed && teamUsers.length > 0 && (
              <div className="users-suggested-section" style={{ marginTop: '32px' }}>
                <div className="users-suggested-header">
                  <h2>Fans of {userTeam}</h2>
                  <div className="scroll-arrows">
                    <button className="scroll-arrow" onClick={() => scroll(-1, scrollRefTeam)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button className="scroll-arrow" onClick={() => scroll(1, scrollRefTeam)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="users-horizontal-scroll" ref={scrollRefTeam}>
                  {teamUsers.map(user => (
                    <div
                      className="suggest-card"
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="suggest-card-banner" style={{ background: getGradient(user.username) }} />
                      <img
                        src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
                        alt={user.username}
                        className="suggest-card-avatar"
                        style={{ background: getGradient(user.username), objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
                      />
                      <h3 className="suggest-card-name">{user.username}</h3>
                      <span className="suggest-card-sub">⚽ {user.sport} • {user.team}</span>
                      <div className="suggest-card-action">
                        {renderActionBtn(user, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchPerformed && sportUsers.length > 0 && (
              <div className="users-suggested-section" style={{ marginTop: '32px' }}>
                <div className="users-suggested-header">
                  <h2>People who play {userSport}</h2>
                  <div className="scroll-arrows">
                    <button className="scroll-arrow" onClick={() => scroll(-1, scrollRefSport)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button className="scroll-arrow" onClick={() => scroll(1, scrollRefSport)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="users-horizontal-scroll" ref={scrollRefSport}>
                  {sportUsers.map(user => (
                    <div
                      className="suggest-card"
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="suggest-card-banner" style={{ background: getGradient(user.username) }} />
                      <img
                        src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
                        alt={user.username}
                        className="suggest-card-avatar"
                        style={{ background: getGradient(user.username), objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
                      />
                      <h3 className="suggest-card-name">{user.username}</h3>
                      <span className="suggest-card-sub">⚽ {user.sport} • {user.team}</span>
                      <div className="suggest-card-action">
                        {renderActionBtn(user, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchPerformed && (
              <div className="users-grid">
                {users.map(user => (
                  <div
                    className="suggest-card suggest-card--grid"
                    key={user.user_id}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="suggest-card-banner" style={{ background: getGradient(user.username) }} />
                    <img
                      src={user.avatar_url || getGeneratedAvatarUrl(user.username)}
                      alt={user.username}
                      className="suggest-card-avatar"
                      style={{ background: getGradient(user.username), objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
                    />
                    <h3 className="suggest-card-name">{user.username}</h3>
                    {user.sport && user.team ? (
                      <span className="suggest-card-sub">⚽ {user.sport} • {user.team}</span>
                    ) : (
                      <span className="suggest-card-sub">Paiecash member</span>
                    )}
                    <div className="suggest-card-action">
                      {renderActionBtn(user)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="users-empty-state users-initial-state">
            <div className="empty-state-icon">👋</div>
            <h3>Welcome to PaieCashFan Chat</h3>
            <p>Type a username in the search bar above to connect with others.</p>
          </div>
        )}
      </div>

      <button
        className="floating-chat-btn"
        onClick={() => navigate('/chat')}
        title="Open Chat"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
};

export default UsersPage;
