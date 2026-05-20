import { useState } from 'react';
import api from '../../api';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../components/Toast';

const SHOTS = [
  { id: 'defense', label: '🛡️ Defense', multiplier: 1.1, risk: 0.05, color: '#60a5fa', desc: '5% wicket risk' },
  { id: 'drive', label: '🏏 Drive', multiplier: 1.5, risk: 0.15, color: '#34d399', desc: '15% wicket risk' },
  { id: 'sweep', label: '↗️ Sweep', multiplier: 2.0, risk: 0.25, color: '#fbbf24', desc: '25% wicket risk' },
  { id: 'slog', label: '💥 Slog', multiplier: 3.0, risk: 0.40, color: '#f97316', desc: '40% wicket risk' },
  { id: 'six', label: '🚀 Six!', multiplier: 5.0, risk: 0.60, color: '#ef4444', desc: '60% wicket risk' },
];

export default function CricketBash() {
  const toast = useToast();
  const [betAmount, setBetAmount] = useState(5);
  const [selectedShot, setSelectedShot] = useState(SHOTS[1]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null); // { outcome, payout, pnl }
  const [animating, setAnimating] = useState(false);
  const { balance, refreshBalance } = useWallet();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  const playShot = async () => {
    if (!user?.id) { toast.error('Please login to play'); return; }
    if (betAmount <= 0) { toast.warning('Please enter a valid bet amount'); return; }
    if (balance !== null && betAmount > balance) { toast.warning('Insufficient PCC balance'); return; }

    setPlaying(true);
    setResult(null);
    setAnimating(true);

    // Simulate ball animation delay
    await new Promise(r => setTimeout(r, 1200));

    const roll = Math.random();
    const isOut = roll < selectedShot.risk;
    const payout = isOut ? 0 : +(betAmount * selectedShot.multiplier).toFixed(2);
    const outcome = isOut ? 'loss' : 'win';

    setResult({
      outcome,
      payout,
      pnl: isOut ? -betAmount : +(payout - betAmount).toFixed(2),
      roll: roll.toFixed(3)
    });
    setAnimating(false);

    try {
      await api.recordGameSession({
        userId: user.id,
        gameId: 'cricket',
        betAmount: parseFloat(betAmount),
        result: outcome,
        payout,
        gameData: { shot: selectedShot.id, multiplier: selectedShot.multiplier, roll }
      });
      await refreshBalance();
    } catch (err) {
      console.error('Session record failed:', err.message);
    }

    setPlaying(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', padding: '24px', color: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #007A4D, #001489)',
        borderRadius: '16px', padding: '24px', marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏏</div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>Cricket Bash</h1>
        <p style={{ margin: '8px 0 0', color: '#86efac', fontSize: '14px' }}>
          Pick your shot. Risk the wicket. Win big. - South Africa Edition
        </p>
        <div style={{ marginTop: '12px', color: '#fbbf24', fontWeight: '700' }}>
          Balance: {balance === null ? '...' : `${balance.toFixed(2)} PCC`}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Shot Selection */}
        <h3 style={{
          color: '#9ca3af', fontSize: '13px', fontWeight: '700',
          textTransform: 'uppercase', marginBottom: '12px'
        }}>Select Your Shot</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          {SHOTS.map(shot => (
            <button key={shot.id} onClick={() => setSelectedShot(shot)} style={{
              background: selectedShot.id === shot.id
                ? shot.color + '33' : '#1a1a2e',
              border: `2px solid ${selectedShot.id === shot.id ? shot.color : '#374151'}`,
              borderRadius: '12px', padding: '14px 8px',
              color: selectedShot.id === shot.id ? shot.color : '#9ca3af',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{shot.label}</div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{shot.multiplier}x</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{shot.desc}</div>
            </button>
          ))}
        </div>

        {/* Bet Amount */}
        <div style={{
          background: '#1a1a2e', border: '1px solid #374151',
          borderRadius: '12px', padding: '20px', marginBottom: '20px'
        }}>
          <label style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '600' }}>BET AMOUNT (PCC)</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input
              type="number" value={betAmount} min="1"
              onChange={e => setBetAmount(Number(e.target.value))}
              style={{
                flex: 1, minWidth: '80px', padding: '10px 14px',
                background: '#0f172a', border: '1px solid #374151',
                borderRadius: '8px', color: '#fff', fontSize: '16px'
              }}
            />
            {[2, 5, 10, 25, 50].map(v => (
              <button key={v} onClick={() => setBetAmount(v)} style={{
                padding: '10px 14px', background: betAmount === v ? '#f5a623' : '#374151',
                color: betAmount === v ? '#000' : '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '700', fontSize: '13px'
              }}>{v}</button>
            ))}
          </div>
          {balance !== null && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
              Balance: <strong style={{ color: '#f5a623' }}>{balance.toFixed(2)} PCC</strong>
              &nbsp;· Potential win: <strong style={{ color: '#22c55e' }}>
                {+(betAmount * selectedShot.multiplier).toFixed(2)} PCC
              </strong>
            </p>
          )}
        </div>

        {/* Result Display */}
        {animating && (
          <div style={{
            textAlign: 'center', padding: '30px',
            background: '#1a1a2e', borderRadius: '16px', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '48px', animation: 'spin 0.5s linear infinite' }}>🏏</div>
            <p style={{ color: '#9ca3af', marginTop: '12px' }}>Ball in flight...</p>
          </div>
        )}

        {result && !animating && (
          <div style={{
            background: result.outcome === 'win'
              ? 'linear-gradient(135deg, #064e3b, #065f46)'
              : 'linear-gradient(135deg, #450a0a, #7f1d1d)',
            border: `2px solid ${result.outcome === 'win' ? '#059669' : '#dc2626'}`,
            borderRadius: '16px', padding: '24px', marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '8px' }}>
              {result.outcome === 'win' ? '🏅' : '🚨'}
            </div>
            <h2 style={{ margin: 0, fontSize: '28px', color: result.outcome === 'win' ? '#6ee7b7' : '#fca5a5' }}>
              {result.outcome === 'win' ? `BOUNDARY! +${result.payout} PCC` : 'WICKET! OUT!'}
            </h2>
            <p style={{ color: result.outcome === 'win' ? '#a7f3d0' : '#fecaca', margin: '8px 0 0' }}>
              {result.outcome === 'win'
                ? `${selectedShot.label} connected! Net P&L: +${result.pnl} PCC`
                : `Caught out. Lost ${betAmount} PCC. Try again!`}
            </p>
          </div>
        )}

        {/* Play Button */}
        <button onClick={playShot} disabled={playing || (balance !== null && betAmount > balance)}
          style={{
            width: '100%', padding: '16px',
            background: playing ? '#374151' :
              (balance !== null && betAmount > balance) ? '#374151' : '#007A4D',
            color: playing ? '#6b7280' :
              (balance !== null && betAmount > balance) ? '#9ca3af' : '#fff',
            border: 'none', borderRadius: '12px',
            fontWeight: '800', fontSize: '18px', cursor: 'pointer',
            letterSpacing: '1px'
          }}>
          {playing ? '🏏 Playing...' :
            (balance !== null && betAmount > balance) ? '⚠ Insufficient PCC' :
              `🏏 PLAY SHOT - ${betAmount} PCC`}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .cricket-shots { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
