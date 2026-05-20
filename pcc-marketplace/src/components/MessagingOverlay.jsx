import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../App';
import { useProfile, getGeneratedAvatarUrl } from '../hooks/useProfile';
import { formatMessageTime, formatLastSeen, truncateMessage } from '../lib/chatHelpers';
import './MessagingOverlay.css';

/* ── Mini Chat Window Component ────────────────────────────── */
const MiniChat = ({ friend, onClose }) => {
  const { 
    messages, 
    sendMessage, 
    loading, 
    messagesEndRef 
  } = useMessages(friend.profile.user_id);
  
  const [text, setText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`mini-chat-window ${isMinimized ? 'minimized' : ''}`}>
      <div className="mini-chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="mini-chat-user">
          <img 
            src={friend.profile.profile_picture || getGeneratedAvatarUrl(friend.profile.username)} 
            alt="" 
            className="mini-chat-avatar"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.profile.username)}&background=059669&color=ffffff&size=100&bold=true`; }}
          />
          <span className="mini-chat-name">{friend.profile.username}</span>
        </div>
        <div className="mini-chat-actions" onClick={e => e.stopPropagation()}>
          <button className="messaging-action-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Expand" : "Minimize"}>
            {isMinimized ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            )}
          </button>
          <button className="messaging-action-btn" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="mini-chat-messages">
            {loading && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading...</div>}
            {messages.map(msg => (
              <div key={msg.id} className={`mini-msg ${msg.sender_id === friend.profile.user_id ? 'received' : 'sent'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mini-chat-input-area">
            <div className="mini-chat-input-wrapper">
              <textarea 
                className="mini-chat-input"
                placeholder="Write a message..."
                rows="1"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className={`mini-chat-send-btn ${text.trim() ? 'active' : ''}`}
                onClick={handleSend}
                disabled={!text.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Main Messaging Overlay ────────────────────────────────── */
export default function MessagingOverlay() {
  const { user } = useAuth();
  const { friends, totalUnread } = useChatContext();
  const { profileImage, fallbackImage } = useProfile(user);
  
  const [expanded, setExpanded] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('focused');

  const filteredFriends = friends.filter(f => 
    f.profile.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleChat = (friend) => {
    if (activeChats.find(c => c.profile.user_id === friend.profile.user_id)) {
      // If already open, just focus it (could implement focus logic)
      return;
    }
    // Limit to 2 mini-chats for space
    setActiveChats(prev => [friend, ...prev].slice(0, 2));
  };

  const closeChat = (userId) => {
    setActiveChats(prev => prev.filter(c => c.profile.user_id !== userId));
  };

  if (!user) return null;

  return (
    <div className="messaging-overlay">
      {/* Mini Chat Windows */}
      {activeChats.map(friend => (
        <MiniChat 
          key={friend.profile.user_id} 
          friend={friend} 
          onClose={() => closeChat(friend.profile.user_id)} 
        />
      ))}

      {/* Main Messaging Panel */}
      <div className={`messaging-panel ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="messaging-header" onClick={() => setExpanded(!expanded)}>
          <div className="messaging-header-left">
            <img 
              src={profileImage} 
              alt="Me" 
              className="messaging-header-avatar"
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
            />
            <span className="messaging-header-title">Messaging</span>
            {totalUnread > 0 && !expanded && (
              <span style={{ 
                background: '#ff5252', color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '1px 5px', borderRadius: 10, marginLeft: 4 
              }}>
                {totalUnread}
              </span>
            )}
          </div>
          <div className="messaging-header-actions">
            <button className="messaging-action-btn" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="messaging-body">
            <div className="messaging-search">
              <div className="messaging-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search messages" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="conversations-scroll">
              {filteredFriends.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No messages yet.
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <div 
                    key={friend.profile.user_id} 
                    className={`conversation-item ${friend.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => toggleChat(friend)}
                  >
                    <div className="conversation-avatar-wrapper">
                      <img 
                        src={friend.profile.profile_picture || getGeneratedAvatarUrl(friend.profile.username)} 
                        alt="" 
                        className="conversation-avatar"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.profile.username)}&background=059669&color=ffffff&size=100&bold=true`; }}
                      />
                      {friend.profile.is_online && <div className="conversation-online-dot" />}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-top">
                        <span className="conversation-name">{friend.profile.username}</span>
                        <span className="conversation-date">
                          {friend.lastMessage ? formatMessageTime(friend.lastMessage.created_at) : ''}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        {friend.lastMessage ? truncateMessage(friend.lastMessage.content) : 'Say hello!'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
