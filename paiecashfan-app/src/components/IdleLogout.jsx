import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const IDLE_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 1 minute avant déconnexion


// Composant qui gère la déconnexion automatique après une période d'inactivité.
export function IdleLogout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  function clearAllTimers() {
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);
  }

  // Déconnecte l'utilisateur et le redirige vers la page de login avec un message.
  async function handleLogout() {
    clearAllTimers();
    setShowWarning(false);

    await signOut();

    navigate('/login', {
      replace: true,
      state: { reason: 'session_expired' }
    });
  }

  // Démarre le compte à rebours de 60 secondes avant la déconnexion.
  function startCountdown() {
    setSecondsLeft(60);

    clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }

  // Réinitialise le timer d'inactivité et démarre le compte à rebours si nécessaire.
  function resetTimer() {
    if (!user) return;

    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, IDLE_TIME - WARNING_TIME);

    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIME);
  }

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart'
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });

      clearAllTimers();
    };
  }, [user]);

  if (!user || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-900 p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-400">
          <ShieldAlert size={28} />
        </div>

        <h2 className="mt-5 text-xl font-black text-bone-50">
          Votre session va expirer
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-bone-400">
          Pour protéger votre compte, vous serez automatiquement déconnecté dans{' '}
          <span className="font-black text-amber-400">
            {secondsLeft} seconde{secondsLeft > 1 ? 's' : ''}
          </span>
          .
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={resetTimer}
            className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-ink-950 transition hover:scale-[1.02]"
          >
            Continuer ma session
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-bone-300 transition hover:bg-white/5"
          >
            Me déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}