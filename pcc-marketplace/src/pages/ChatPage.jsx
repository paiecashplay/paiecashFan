import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useChatContext } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { useMessages } from '../hooks/useMessages';
import {
  getInitials,
  formatMessageTime,
  formatLastSeen,
  formatDateSeparator,
  truncateMessage,
} from '../lib/chatHelpers';
import { getGeneratedAvatarUrl } from '../hooks/useProfile';
import './ChatPage.css';

/* ─── Avatar color palette ──────────────────────────────────────────────────── */
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

/* ─── Skeleton friend item ───────────────────────────────────────────────────── */
const SkeletonFriendItem = () => (
  <div className="skeleton-container">
    <div className="skeleton skeleton-avatar" />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '55%', marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '38%' }} />
    </div>
  </div>
);

/* ─── Single friend row ───────────────────────────────────────────────────────  */
const FriendItem = React.memo(({ friend, isActive, onClick }) => {
  const ref = useRef(null);
  const av = getAvatarStyle(friend.profile.username);

  const handleMouseEnter = () => {
    if (!isActive) gsap.to(ref.current, { x: 3, duration: 0.18, ease: 'power2.out' });
  };
  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, duration: 0.18, ease: 'power2.out' });
  };
  const handleClick = () => {
    gsap.to(ref.current, {
      scale: 0.97,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: onClick,
    });
  };

  return (
    <div
      ref={ref}
      className={`friend-item gsap-sidebar-item${isActive ? ' active' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="friend-avatar-wrapper">
        <img
          src={friend.profile.profile_picture || getGeneratedAvatarUrl(friend.profile.username)}
          alt={friend.profile.username}
          className="friend-avatar"
          style={{ backgroundColor: av.bg, objectFit: 'cover' }}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.profile.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
        />
        {friend.profile.is_online && <div className="online-dot" />}
      </div>
      <div className="friend-item-content">
        <div className="friend-item-top">
          <span className="friend-username">{friend.profile.username}</span>
          <span className="friend-time">
            {friend.lastMessage
              ? formatMessageTime(friend.lastMessage.created_at)
              : formatLastSeen(friend.profile.created_at)}
          </span>
        </div>
        <div className="friend-item-bottom">
          <span className={`friend-last-message${!friend.lastMessage ? ' italic' : ''}`}>
            {friend.lastMessage ? truncateMessage(friend.lastMessage.content) : 'Say hello!'}
          </span>
          {friend.unreadCount > 0 && (
            <span className="unread-badge">
              {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

/* ─── Sidebar ─────────────────────────────────────────────────────────────────  */
const Sidebar = ({ friends, selectedFriend, onSelectFriend, loading, onFindPeople }) => {
  const [search, setSearch] = useState('');
  const listRef = useRef(null);
  const prevLen = useRef(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter(f => f.profile.username.toLowerCase().includes(q));
  }, [friends, search]);

  useEffect(() => {
    if (filtered.length > 0 && listRef.current && filtered.length !== prevLen.current) {
      prevLen.current = filtered.length;
      const els = listRef.current.querySelectorAll('.gsap-sidebar-item');
      gsap.fromTo(
        els,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.38, stagger: 0.045, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    }
  }, [filtered]);

  return (
    <div className={`chat-sidebar${selectedFriend ? ' chat-sidebar--hidden-mobile' : ''}`}>
      <div className="chat-sidebar-header">
        <h2>
          Messages
          <span className="friend-count">{friends.length}</span>
        </h2>
        <div className="chat-search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-find-people" onClick={onFindPeople}>+ Find People</button>
      </div>

      <div className="chat-sidebar-list" ref={listRef}>
        {loading && friends.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonFriendItem key={i} />)
        ) : friends.length === 0 ? (
          <div className="chat-empty-state-sidebar">
            <div className="empty-icon">👥</div>
            <p style={{ fontSize: 13 }}>No friends yet</p>
            <button className="btn-find-people-small" onClick={onFindPeople}>Find People →</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="chat-empty-state-sidebar">
            <p style={{ fontSize: 12 }}>No matches for "{search}"</p>
          </div>
        ) : (
          filtered.map(f => (
            <FriendItem
              key={f.profile.user_id}
              friend={f}
              isActive={selectedFriend?.profile.user_id === f.profile.user_id}
              onClick={() => onSelectFriend(f)}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Empty state ──────────────────────────────────────────────────────────────  */
const EmptyState = () => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  return (
    <div className="chat-window-empty-content" ref={ref}>
      <div className="empty-chat-icon">💬</div>
      <h2>Your Messages</h2>
      <p>Select a conversation from the sidebar to start chatting.</p>
    </div>
  );
};

/* ─── Chat Window ─────────────────────────────────────────────────────────────  */
const ChatWindow = ({ friend, currentUserId, onBack }) => {
  const { messages, loading, sending, hasMore, isTyping, sendMessage, loadMore, sendTypingStatus, messagesEndRef } =
    useMessages(friend?.profile.user_id);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { showToast } = useToast();
  const headerRef = useRef(null);
  const inputBarRef = useRef(null);
  const msgsAreaRef = useRef(null);
  const sendBtnRef = useRef(null);
  const prevFriend = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  
  const commonEmojis = ['😀','😂','😊','😍','😘','😛','😎','🥺','😭','😡','👍','👎','👏','🔥','❤️','✨','🎉','💯'];

  /* Animate header + input bar when friend changes */
  useEffect(() => {
    if (!friend || friend === prevFriend.current) return;
    prevFriend.current = friend;
    gsap.fromTo(
      [headerRef.current, inputBarRef.current],
      { opacity: 0, y: [-10, 10] },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0, ease: 'power3.out' }
    );
  }, [friend]);

  /* Animate new message bubbles */
  useEffect(() => {
    if (!msgsAreaRef.current) return;
    const fresh = msgsAreaRef.current.querySelectorAll('.gsap-message:not([data-anim])');
    if (!fresh.length) return;
    fresh.forEach(el => el.setAttribute('data-anim', '1'));
    gsap.fromTo(
      fresh,
      { opacity: 0, y: 12, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.04, ease: 'back.out(1.7)', clearProps: 'transform,opacity' }
    );
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || sending) return;
    sendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    sendTypingStatus(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (sendBtnRef.current) {
      gsap.fromTo(sendBtnRef.current, { scale: 0.84 }, { scale: 1, duration: 0.38, ease: 'back.out(3)' });
    }
  }, [inputText, sending, sendMessage, sendTypingStatus]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = e => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    
    // Typing indicator logic
    sendTypingStatus(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1500);
  };
  
  const handleEmojiSelect = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };



  if (!friend) {
    return (
      <div className="chat-window chat-window-empty chat-window--hidden-mobile">
        <EmptyState />
      </div>
    );
  }

  const av = getAvatarStyle(friend.profile.username);

  /* Group by date */
  const grouped = [];
  let curDate = null;
  messages.forEach(msg => {
    const d = new Date(msg.created_at).toDateString();
    if (d !== curDate) {
      grouped.push({ type: 'sep', date: msg.created_at, id: `sep-${msg.id || d}` });
      curDate = d;
    }
    grouped.push({ type: 'msg', data: msg });
  });

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header" ref={headerRef}>
        <button className="chat-back-btn" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="chat-header-info">
          <div className="friend-avatar-wrapper">
            <img
              src={friend.profile.profile_picture || getGeneratedAvatarUrl(friend.profile.username)}
              alt={friend.profile.username}
              className="friend-avatar"
              style={{ backgroundColor: av.bg, objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.profile.username)}&background=059669&color=ffffff&size=200&bold=true&format=png`; }}
            />
            {friend.profile.is_online && <div className="online-dot" />}
          </div>
          <div className="chat-header-text">
            <h3>{friend.profile.username}</h3>
            <span className="chat-header-status">
              {friend.profile.is_online ? (
                <><span className="status-dot-online" />Online</>
              ) : (
                formatLastSeen(friend.profile.last_seen)
              )}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Removed call, video call, and more options as per user request */}
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-messages-area"
        ref={el => { msgsAreaRef.current = el; }}
      >
        {hasMore && (
          <div className="chat-load-more">
            <button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : 'Load older messages'}
            </button>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="chat-loading-skeletons">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`skeleton-bubble ${i % 3 === 0 ? 'sent' : 'received'}`}>
                <div
                  className="skeleton skeleton-text"
                  style={{ width: `${30 + (i * 17) % 40}%`, height: 14 }}
                />
              </div>
            ))}
          </div>
        ) : (
          grouped.map(item => {
            if (item.type === 'sep') {
              return (
                <div key={item.id} className="chat-date-separator">
                  <span>{formatDateSeparator(item.date)}</span>
                </div>
              );
            }
            const msg = item.data;
            const isSent = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`message-bubble-wrapper gsap-message ${isSent ? 'sent' : 'received'}`}
              >
                <div className={`message-bubble${msg.pending ? ' pending' : ''}`}>
                  <p className="message-content">{msg.content}</p>
                  <div className="message-meta">
                    <span>{formatMessageTime(msg.created_at)}</span>
                    {isSent && !msg.pending && (
                      <span className={`message-status${msg.is_read ? ' read' : ''}`}>
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="message-bubble-wrapper received typing-indicator-wrapper">
            <div className="message-bubble typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            <span className="typing-text">{friend.profile.username} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar" ref={inputBarRef}>
        <div className="input-wrapper">
          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              {commonEmojis.map(emoji => (
                <button key={emoji} type="button" onClick={() => handleEmojiSelect(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${friend.profile.username}…`}
            disabled={sending}
            rows={1}
          />

          <button className="input-action-btn" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
        </div>

        <button
          ref={sendBtnRef}
          className="btn-send"
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
          aria-label="Send message"
        >
          {sending ? (
            <div className="spinner-small" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────────── */
const ChatPage = () => {
  const navigate = useNavigate();
  const { friends, loading, initialized } = useChatContext();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    const id = sessionStorage.getItem('chat_target_friend_id');
    if (id && initialized && friends.length > 0) {
      const f = friends.find(x => x.profile.user_id === id);
      if (f) {
        setSelectedFriend(f);
        sessionStorage.removeItem('chat_target_friend_id');
      }
    }
  }, [friends, initialized]);

  const currentUserId = useMemo(() => {
    try {
      const obj = JSON.parse(localStorage.getItem('pcc_user'));
      return obj?.id || obj?._id || obj?.userId;
    } catch { return null; }
  }, []);

  return (
    <div className="chat-page" ref={pageRef}>
      <Sidebar
        friends={friends}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
        loading={loading && !initialized}
        onFindPeople={() => navigate('/users')}
      />
      <ChatWindow
        friend={selectedFriend}
        currentUserId={currentUserId}
        onBack={() => setSelectedFriend(null)}
      />
    </div>
  );
};

export default ChatPage;