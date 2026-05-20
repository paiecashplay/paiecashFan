import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { getInitials, getAvatarColor, formatLastSeen } from '../lib/chatHelpers';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState({});
  const dropdownRef = useRef(null);

  const { pendingRequests, acceptRequest, declineRequest } = useChatContext();
  const { showToast } = useToast();

  const prevRequestsCount = useRef(pendingRequests?.length || 0);
  const [pulse, setPulse] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const notifChannelRef = useRef(null);
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    if (!currentUser.id) return;

    let cancelled = false;

    const setup = async () => {
      const { supabase } = await import('../api');
      if (cancelled) return;

      // Fetch existing unread notifications
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (!cancelled && data) setNotifications(data);

      // Subscribe to new notifications - unique channel name per user
      const channel = supabase
        .channel(`bell-notifs-${currentUser.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        }, payload => {
          if (!cancelled) {
            setNotifications(prev => [payload.new, ...prev]);
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
          }
        })
        .subscribe();

      notifChannelRef.current = channel;
    };

    setup();

    return () => {
      cancelled = true;
      if (notifChannelRef.current) {
        import('../api').then(({ supabase }) => {
          supabase.removeChannel(notifChannelRef.current);
          notifChannelRef.current = null;
        });
      }
    };
  }, [currentUser.id]);


  useEffect(() => {
    if (pendingRequests && pendingRequests.length > prevRequestsCount.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }
    prevRequestsCount.current = pendingRequests?.length || 0;
  }, [pendingRequests]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAccept = async (e, requestId) => {
    e.stopPropagation();
    setLoadingAction(prev => ({ ...prev, [requestId]: 'accept' }));
    try {
      await acceptRequest(requestId);
    } catch (err) {
      // Toast handled by context
    } finally {
      setLoadingAction(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const handleDecline = async (e, requestId) => {
    e.stopPropagation();
    setLoadingAction(prev => ({ ...prev, [requestId]: 'decline' }));
    try {
      await declineRequest(requestId);
    } catch (err) {
      // Toast handled by context
    } finally {
      setLoadingAction(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className={`nav-link notification-bell-btn ${pulse ? 'pulse-anim' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#e0e0e0' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {((pendingRequests?.length || 0) + notifications.length) > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {((pendingRequests?.length || 0) + notifications.length) > 9 ? '9+' : ((pendingRequests?.length || 0) + notifications.length)}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: '-10px',
          width: '340px',
          backgroundColor: '#111118',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'dropdownFadeIn 0.2s ease-out forwards',
          transformOrigin: 'top right'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #2a2a3a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#f0c040' }}>Friend Requests</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#888899', cursor: 'pointer' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {(!pendingRequests || pendingRequests.length === 0) && notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888899' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>✓</div>
                <p style={{ margin: 0 }}>You're all caught up!</p>
              </div>
            ) : (
              <>
                {pendingRequests?.map(req => (
                  <div key={req.requestId} style={{
                    padding: '16px',
                    borderBottom: '1px solid #1a1a28',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(req.sender.username),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {getInitials(req.sender.username)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#e0e0e0', lineHeight: 1.4 }}>
                        <strong style={{ color: '#fff' }}>{req.sender.username}</strong> wants to connect with you
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#888899' }}>
                        {formatLastSeen(req.created_at)}
                      </span>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={(e) => handleAccept(e, req.requestId)}
                          disabled={loadingAction[req.requestId]}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            backgroundColor: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: loadingAction[req.requestId] ? 'not-allowed' : 'pointer',
                            opacity: loadingAction[req.requestId] === 'accept' ? 0.7 : 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          {loadingAction[req.requestId] === 'accept' ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={(e) => handleDecline(e, req.requestId)}
                          disabled={loadingAction[req.requestId]}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            backgroundColor: '#2a2a3a',
                            color: '#e0e0e0',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: loadingAction[req.requestId] ? 'not-allowed' : 'pointer',
                            opacity: loadingAction[req.requestId] === 'decline' ? 0.7 : 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          {loadingAction[req.requestId] === 'decline' ? '...' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.map(notif => (
                  <div key={notif.id}
                    onClick={async () => {
                      import('../api').then(({ supabase }) => {
                        supabase.from('notifications').update({ is_read: true }).eq('id', notif.id).then(() => {
                          setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        });
                      });
                      setIsOpen(false);
                      if (notif.type === 'challenge_received') {
                        window.location.href = '/match-discussion';
                      } else if (notif.type === 'challenge_accepted') {
                        window.location.href = `/challenge-lobby/${notif.metadata?.session_id}`;
                      }
                    }}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #1a1a28',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      cursor: 'pointer'
                    }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      🔔
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#e0e0e0', lineHeight: 1.4 }}>
                        <strong style={{ color: '#fff' }}>{notif.title}</strong>
                      </p>
                      <span style={{ fontSize: '0.85rem', color: '#888899', display: 'block', marginBottom: '4px' }}>
                        {notif.message}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#666677' }}>
                        {formatLastSeen(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bellPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1); }
        }
        .pulse-anim {
          animation: bellPulse 0.5s ease-in-out 3;
        }
      `}} />
    </div>
  );
};

export default NotificationBell;
