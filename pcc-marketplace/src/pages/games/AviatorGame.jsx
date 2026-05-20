import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { useWallet } from '../../context/WalletContext';
import api from '../../api';

function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.35) return +(1.1 + Math.random() * 0.9).toFixed(2);
  if (r < 0.65) return +(2 + Math.random() * 3).toFixed(2);
  if (r < 0.85) return +(5 + Math.random() * 5).toFixed(2);
  return +(10 + Math.random() * 10).toFixed(2);
}

export default function AviatorGame({ game }) {
  const toast = useToast();
  const { balance, refreshBalance } = useWallet();
  const [phase, setPhase] = useState('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(null);
  const [cashedOutAt, setCashedOutAt] = useState(null);
  const [betAmount, setBetAmount] = useState(5);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [graphPoints, setGraphPoints] = useState([]);
  const intervalRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    try { userIdRef.current = JSON.parse(localStorage.getItem('pcc_user') || '{}').id; } catch { }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const insufficientBalance = balance !== null && betAmount > balance;

  const recordSession = async (resultType, payout, crashData) => {
    try {
      await api.recordGameSession({
        userId: userIdRef.current,
        gameId: 'aviator',
        betAmount: parseFloat(betAmount),
        result: resultType,
        payout,
        gameData: crashData
      });
      await refreshBalance();
    } catch (err) {
      console.error('Session record failed:', err.message);
    }
  };

  const startGame = () => {
    if (!userIdRef.current) { toast.error('Please login first'); return; }
    if (insufficientBalance) { toast.error('Insufficient PCC balance'); return; }

    const cp = generateCrashPoint();
    setCrashPoint(cp);
    setPhase('flying');
    setMultiplier(1.00);
    setGraphPoints([]);
    setResult(null);
    setCashedOutAt(null);
    toast.info(`🚀 Game started! ${betAmount} PCC entered.`, 2000);

    let m = 1.00;
    intervalRef.current = setInterval(() => {
      m += 0.03 + (m * 0.002);
      m = +m.toFixed(2);
      setMultiplier(m);
      setGraphPoints(prev => [...prev, m]);
      if (m >= cp) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase('crashed');
        setHistory(prev => [cp, ...prev].slice(0, 8));
        setResult({ won: false, amount: 0 });
        toast.error(`💥 Crashed at ${cp}x! Better luck next time.`, 3000);
        recordSession('loss', 0, { multiplierAtCrash: cp, multiplierAtCashout: null, cashedOut: false });
      }
    }, 100);
  };

  const cashOut = () => {
    if (phase !== 'flying') return;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setPhase('cashedout');
    setCashedOutAt(multiplier);
    const winAmount = +(betAmount * multiplier).toFixed(2);
    setResult({ won: true, amount: winAmount });
    setHistory(prev => [multiplier, ...prev].slice(0, 8));
    toast.success(`🎉 Cashed out at ${multiplier.toFixed(2)}x - +${winAmount} PCC!`, 4000);
    recordSession('win', winAmount, { multiplierAtCrash: crashPoint, multiplierAtCashout: multiplier, cashedOut: true });
  };

  const resetGame = () => {
    setPhase('waiting');
    setMultiplier(1.00);
    setResult(null);
    setCashedOutAt(null);
  };

  const pointsStr = graphPoints.map((p, i) => {
    const x = (i / Math.max(graphPoints.length - 1, 1)) * 300;
    const y = 200 - Math.min(((p - 1) / 15) * 180, 190);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      {/* History Row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {history.map((h, i) => (
          <span key={i} style={{
            padding: '4px 10px', borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem', fontWeight: 700,
            background: h < 2 ? 'rgba(244,67,54,0.2)' : h <= 5 ? 'rgba(255,152,0,0.2)' : 'rgba(0,230,118,0.2)',
            color: h < 2 ? '#f44336' : h <= 5 ? '#ff9800' : '#00e676',
          }}>{h}x</span>
        ))}
      </div>

      {/* Game Arena */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: 24, minHeight: 300, position: 'relative', overflow: 'hidden',
      }}>
        {/* SVG Graph */}
        {phase !== 'waiting' && (
          <svg viewBox="0 0 300 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
            <polyline points={pointsStr} stroke={game.accentColor} strokeWidth="2" fill="none" />
          </svg>
        )}

        {/* Center Display */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, textAlign: 'center' }}>
          {phase === 'waiting' && (
            <>
              <div style={{ fontSize: '3rem' }}>🚀</div>
              <div style={{ color: 'var(--text-dim)', marginTop: 8 }}>Place your bet and start!</div>
            </>
          )}
          {phase === 'flying' && (
            <>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: 900, color: '#00e676',
                textShadow: '0 0 30px rgba(0,230,118,0.5)',
              }}>{multiplier.toFixed(2)}x</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>🚀 Flying...</div>
            </>
          )}
          {phase === 'crashed' && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#f44336' }}>💥 CRASHED!</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Crashed at {crashPoint}x</div>
            </>
          )}
          {phase === 'cashedout' && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#00e676' }}>🎉 CASHED OUT!</div>
              <div style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                at {cashedOutAt.toFixed(2)}x → +{result.amount} PCC
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bet Controls */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Bet Amount:</span>
        <input
          type="number" min="1" max="100" value={betAmount}
          onChange={e => setBetAmount(Math.max(1, +e.target.value))}
          disabled={phase !== 'waiting'}
          style={{
            background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            width: 80, fontSize: '0.9rem', outline: 'none',
          }}
        />
        {[5, 10, 25, 50].map(v => (
          <button key={v} className="btn btn-sm btn-outline" disabled={phase !== 'waiting'}
            onClick={() => setBetAmount(v)} style={{ opacity: phase !== 'waiting' ? 0.5 : 1 }}>
            {v}
          </button>
        ))}
      </div>
      {balance !== null && (
        <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 6 }}>
          Balance: <strong style={{ color: '#f5a623' }}>{balance.toFixed(2)} PCC</strong>
        </p>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        {phase === 'waiting' && (
          <button onClick={startGame} disabled={insufficientBalance} style={{
            background: insufficientBalance ? 'var(--bg-glass)' : 'var(--gradient-hero)',
            color: '#fff', padding: '12px 32px',
            borderRadius: 'var(--radius-md)', fontWeight: 700, border: 'none',
            cursor: insufficientBalance ? 'not-allowed' : 'pointer',
            fontSize: '1rem', opacity: insufficientBalance ? 0.5 : 1,
          }}>{insufficientBalance ? '⚠ Insufficient PCC' : '🚀 Start Game'}</button>
        )}
        {phase === 'flying' && (
          <button onClick={cashOut} className="cashout-btn" style={{
            background: 'linear-gradient(135deg, #00e676, #00c853)', color: '#000',
            fontWeight: 800, padding: '12px 32px', borderRadius: 'var(--radius-md)',
            border: 'none', cursor: 'pointer', fontSize: '1rem',
          }}>💰 Cash Out - {(betAmount * multiplier).toFixed(2)} PCC</button>
        )}
        {(phase === 'crashed' || phase === 'cashedout') && (
          <button onClick={resetGame} className="btn btn-outline" style={{ padding: '12px 32px' }}>
            🔄 Play Again
          </button>
        )}
      </div>
    </div>
  );
}
