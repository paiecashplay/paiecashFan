import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msgOrObj, typeArg = 'info', durationArg = 3000) => {
    // Support both: showToast('msg', 'type') AND showToast({ message, type })
    let message, type, duration;
    if (typeof msgOrObj === 'object' && msgOrObj !== null) {
      message = msgOrObj.message;
      type = msgOrObj.type || 'info';
      duration = msgOrObj.duration || 3000;
    } else {
      message = msgOrObj;
      type = typeArg;
      duration = durationArg;
    }
    if (!message) return; // Don't show empty toasts
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const COLORS = {
    success: { bg: 'rgba(0,230,118,0.12)', border: 'rgba(0,230,118,0.35)', color: '#00e676', icon: '✅' },
    error:   { bg: 'rgba(244,67,54,0.12)', border: 'rgba(244,67,54,0.35)', color: '#f44336', icon: '❌' },
    warning: { bg: 'rgba(255,152,0,0.12)', border: 'rgba(255,152,0,0.35)', color: '#ff9800', icon: '⚠️' },
    info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#3b82f6', icon: 'ℹ️' },
    win:     { bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.35)', color: '#ffd700', icon: '🏆' },
    pcc:     { bg: 'rgba(108,92,231,0.12)', border: 'rgba(108,92,231,0.35)', color: '#6c5ce7', icon: '🪙' },
  };

  const toastHelpers = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={{ showToast, ...toastHelpers }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '340px',
        width: 'calc(100vw - 40px)',
      }}>
        {toasts.map(toast => {
          const c = COLORS[toast.type] || COLORS.info;
          return (
            <div key={toast.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.color}`,
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'toast-in 0.3s ease-out forwards',
              color: 'white',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', fontSize: '1rem', padding: '0 0 0 4px', flexShrink: 0,
                }}
              >✕</button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
