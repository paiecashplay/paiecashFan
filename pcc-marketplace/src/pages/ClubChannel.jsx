// ═══════════════════════════════════════════════════════════════
// pages/ClubChannel.jsx
// Dedicated Club Community Channel
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClubChannel } from '../context/ClubChannelContext';
import { getClubTheme, injectClubTheme } from '../clubThemes';
import MatchMessageBubble from '../components/MatchMessageBubble';
import ChallengeModal from '../components/ChallengeModal';
import Chatbot from '../components/Chatbot'; // The AI Chatbot
import { useChatbot } from '../context/ChatbotContext';

const QUICK_REACTIONS = ['🔥', '⚽', '👑', '👏', '🏆'];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('pcc_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function ClubChannel() {
  const { slugOrId } = useParams();
  const [theme, setTheme] = useState(() => getClubTheme(slugOrId) || null);
  const pageRef = useRef(null);
  
  // Contexts
  const { activeClubId, messages, onlineCount, loading, setActiveClub, sendMessage, respondChallenge } = useClubChannel();
  const { openChat, closeChat } = useChatbot();

  // Local UI state
  const [input, setInput] = useState('');
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [activePanel, setActivePanel] = useState('community'); // 'community' | 'ai'
  const messagesContainerRef = useRef(null);
  const currentUser = getCurrentUser();

  // 1. Initialize Theme & Context
  useEffect(() => {
    const t = getClubTheme(slugOrId);
    setTheme(t);
    if (t) setActiveClub(t.id);
  }, [slugOrId, setActiveClub]);

  // 2. Inject CSS Theme
  useEffect(() => {
    if (theme && pageRef.current) {
      injectClubTheme(pageRef.current, theme.id);
      document.body.style.background = theme.darkColor;
    }
    return () => { document.body.style.background = ''; };
  }, [theme]);

  // 3. Auto-scroll chat
  useEffect(() => {
    if (activePanel === 'community' && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activePanel]);

  // 4. Chatbot integration
  useEffect(() => {
    if (activePanel === 'ai' && theme) {
      openChat(theme.id);
    } else {
      closeChat();
    }
  }, [activePanel, theme, openChat, closeChat]);


  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed, 'text');
    setInput('');
  }, [input, sendMessage]);

  const handleReaction = useCallback((emoji) => {
    sendMessage(emoji, 'reaction');
  }, [sendMessage]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!theme) {
    return (
      <div className="club-channel-empty">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}>
          <h2>Club not found</h2>
          <Link to="/clubs" style={{ color: '#00e676', textDecoration: 'none' }}>← Back to Clubs</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="club-channel-page" style={{ background: theme.darkColor, minHeight: '100vh', paddingTop: 64, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="club-channel-header" style={{
        background: theme.bgGradient,
        borderBottom: `1px solid ${theme.primaryColor}33`,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 64, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to={`/clubs/${theme.id}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
            color: '#fff', textDecoration: 'none'
          }}>
            ←
          </Link>
          <img src={theme.crestUrl} alt={theme.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif" }}>
              {theme.name} <span style={{ color: theme.primaryColor }}>Community</span>
            </h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#00ff88' }}>●</span> {onlineCount} Fans Online
            </div>
          </div>
        </div>

        {/* Panel Toggle */}
        <div className="club-channel-toggle" style={{
          display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 4,
          border: `1px solid ${theme.primaryColor}40`
        }}>
          <button
            onClick={() => setActivePanel('community')}
            style={{
              background: activePanel === 'community' ? theme.primaryColor : 'transparent',
              color: activePanel === 'community' ? theme.darkColor : '#fff',
              border: 'none', borderRadius: 999, padding: '8px 16px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px'
            }}
          >
            LIVE FAN CHAT
          </button>
          <button
            onClick={() => setActivePanel('ai')}
            style={{
              background: activePanel === 'ai' ? theme.primaryColor : 'transparent',
              color: activePanel === 'ai' ? theme.darkColor : '#fff',
              border: 'none', borderRadius: 999, padding: '8px 16px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px'
            }}
          >
            ASK CLUB AI
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="club-channel-content" style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        
        {/* Community Chat Panel */}
        <div style={{
          display: activePanel === 'community' ? 'flex' : 'none',
          flexDirection: 'column', width: '100%', maxWidth: 900,
          background: 'rgba(255,255,255,0.02)',
          borderLeft: `1px solid ${theme.primaryColor}20`,
          borderRight: `1px solid ${theme.primaryColor}20`,
        }}>
          {/* Messages */}
          <div ref={messagesContainerRef} style={{
            flex: 1, overflowY: 'auto', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {loading && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading history...</div>}
            
            {!loading && messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{theme.crestEmoji}</div>
                <h3>Welcome to the {theme.name} Community</h3>
                <p>Be the first to say hello to other fans!</p>
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

          {/* Chat Input */}
          <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.5)', borderTop: `1px solid ${theme.primaryColor}30` }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.primaryColor}40`,
                    borderRadius: '50%', width: 36, height: 36, fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Talk to the community..."
                maxLength={1000}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${theme.primaryColor}50`, borderRadius: 12,
                  padding: '12px 16px', color: '#fff', fontSize: 15, outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  background: theme.primaryColor, color: theme.darkColor,
                  border: 'none', borderRadius: 12, padding: '0 24px',
                  fontWeight: 800, cursor: input.trim() ? 'pointer' : 'not-allowed',
                  opacity: input.trim() ? 1 : 0.5
                }}
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* AI Chatbot Panel */}
        <div style={{
          display: activePanel === 'ai' ? 'block' : 'none',
          width: '100%', maxWidth: 900,
          position: 'relative'
        }}>
          {/* The AI Chatbot is rendered globally by App.jsx, but since its route is matched 
              (if we adjust App.jsx), it will show up. 
              Wait, the user said "build the club channel as a side-by-side toggle UI... 
              Do not modify the existing chatbot component". 
              Since Chatbot is typically an overlay, we will just render a wrapper here 
              and the actual Chatbot will be triggered by `openChat`. 
              To make it appear embedded, we can't easily change its fixed positioning without modifying it.
              But we CAN provide a placeholder here that explains the AI is open. */}
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: 40
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
            <h2>{theme.name} AI Assistant is Active</h2>
            <p>The AI chatbot widget is now open on your screen.<br/>Use the chat interface to ask questions about the club!</p>
          </div>
        </div>

      </div>

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
