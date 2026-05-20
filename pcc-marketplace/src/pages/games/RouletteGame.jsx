import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/Toast';
import { useWallet } from '../../context/WalletContext';
import api from '../../api';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const getColor = (n) => n === 0 ? 'green' : RED_NUMBERS.includes(n) ? 'red' : 'black';
const BET_OPTIONS = [
  { id: 'red', label: '🔴 Red', payout: 2, check: (n) => getColor(n) === 'red' },
  { id: 'black', label: '⚫ Black', payout: 2, check: (n) => getColor(n) === 'black' },
  { id: 'odd', label: 'ODD', payout: 2, check: (n) => n > 0 && n % 2 !== 0 },
  { id: 'even', label: 'EVEN', payout: 2, check: (n) => n > 0 && n % 2 === 0 },
  { id: 'low', label: '1–18', payout: 2, check: (n) => n >= 1 && n <= 18 },
  { id: 'high', label: '19–36', payout: 2, check: (n) => n >= 19 && n <= 36 },
  { id: '1st12', label: '1st 12', payout: 3, check: (n) => n >= 1 && n <= 12 },
  { id: '2nd12', label: '2nd 12', payout: 3, check: (n) => n >= 13 && n <= 24 },
  { id: '3rd12', label: '3rd 12', payout: 3, check: (n) => n >= 25 && n <= 36 },
];
const colorBg = (c) => c === 'green' ? '#166534' : c === 'red' ? '#991b1b' : '#1c1c1c';
const colorBorder = (c) => c === 'green' ? '#22c55e' : c === 'red' ? '#ef4444' : '#525252';

const SA_BET_LABELS = {
  red: '🔴 Bafana Red',
  black: '🔵 Cape Blue',
  green: '🟢 Springbok',
  odd: '↕️ Odd',
  even: '↔️ Even'
};

export default function RouletteGame({ game }) {
  const toast = useToast();
  const { balance, refreshBalance } = useWallet();
  const uid = useRef(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(3);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => { try { uid.current = JSON.parse(localStorage.getItem('pcc_user') || '{}').id; } catch { } }, []);

  const noFunds = balance !== null && betAmount > balance;

  const spin = () => {
    if (!selectedBet) return;
    if (!uid.current) { toast.error('Please login first'); return; }
    if (noFunds) { toast.error('Insufficient PCC balance'); return; }
    setSpinning(true); setResult(null);
    setTimeout(async () => {
      const number = Math.floor(Math.random() * 37);
      const color = getColor(number);
      const betOpt = BET_OPTIONS.find(b => b.id === selectedBet);
      const won = betOpt.check(number);
      const winAmount = won ? betAmount * betOpt.payout : 0;
      setResult({ number, color, won, winAmount: won ? winAmount - betAmount : 0 });
      setHistory(prev => [number, ...prev].slice(0, 10));
      setSpinning(false);
      won ? toast.success(`🎡 ${number} ${color}! +${winAmount - betAmount} PCC!`, 4000)
        : toast.error(`${number} ${color} - not this time.`, 2500);
      try {
        await api.recordGameSession({
          userId: uid.current, gameId: 'roulette',
          betAmount: parseFloat(betAmount),
          result: won ? 'win' : 'loss',
          payout: won ? winAmount : 0,
          gameData: { landedNumber: number, landedColor: color, betType: selectedBet, betPayout: betOpt.payout }
        });
        await refreshBalance();
      } catch (e) { console.error('Session record failed:', e.message); }
    }, 2000);
  };

  const canSpin = selectedBet && !spinning && !noFunds;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #001489, #DE3831)',
        borderRadius: '16px', padding: '20px', marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '40px' }}>🌊</div>
        <h2 style={{ margin: '8px 0 0', color: '#fff', fontWeight: '900' }}>Cape Town Roulette</h2>
        <p style={{ color: '#bfdbfe', margin: '4px 0 0', fontSize: '13px' }}>
          From the Mother City to the Money - Table Mountain Stakes
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: 'var(--gold)' }}>💰 Balance: {balance !== null ? balance.toFixed(2) : '...'} PCC</div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Spins: {history.length}</div>
      </div>
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {history.map((n, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colorBg(getColor(n)), border: `1px solid ${colorBorder(getColor(n))}`, color: '#fff' }}>{n}</div>
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className={result && !spinning ? 'result-pop' : ''} style={{ width: 120, height: 120, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px auto', fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, background: result ? colorBg(result.color) : 'var(--bg-glass)', border: result ? `3px solid ${colorBorder(result.color)}` : '2px solid rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.3s' }}>
          {spinning ? <span style={{ animation: 'rotate 0.6s linear infinite', display: 'inline-block' }}>⟳</span> : result ? result.number : '?'}
        </div>
        {result && !spinning && (
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8, color: result.won ? '#00e676' : '#f44336' }}>
            {result.won ? `+${result.winAmount} PCC 🎉` : `-${betAmount} PCC`}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '20px 0' }}>
        {BET_OPTIONS.map(opt => (
          <button key={opt.id} onClick={() => !spinning && setSelectedBet(opt.id)} style={{ padding: '12px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', cursor: spinning ? 'not-allowed' : 'pointer', border: `2px solid ${selectedBet === opt.id ? 'var(--secondary)' : 'rgba(255,255,255,0.08)'}`, background: selectedBet === opt.id ? 'rgba(108,92,231,0.3)' : 'var(--bg-glass)', color: selectedBet === opt.id ? '#fff' : 'var(--text-dim)', transition: 'all 0.2s' }}>
            <div>{SA_BET_LABELS[opt.id] || opt.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: 4 }}>×{opt.payout}</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Bet:</span>
        <input type="number" min="1" max="50" value={betAmount} onChange={e => setBetAmount(Math.max(1, +e.target.value))} disabled={spinning} style={{ background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', width: 70, fontSize: '0.9rem', outline: 'none' }} />
        {[1, 3, 5, 10].map(v => <button key={v} className="btn btn-sm btn-outline" disabled={spinning} onClick={() => setBetAmount(v)} style={{ opacity: spinning ? 0.5 : 1 }}>{v}</button>)}
      </div>
      <button onClick={canSpin ? spin : undefined} disabled={!canSpin} style={{ width: '100%', padding: 14, fontWeight: 700, fontSize: '1rem', background: canSpin ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'var(--bg-glass)', color: canSpin ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius-md)', cursor: canSpin ? 'pointer' : 'not-allowed', opacity: !canSpin ? 0.6 : 1 }}>
        {spinning ? 'Spinning...' : !selectedBet ? 'Select a bet first' : noFunds ? '⚠ Insufficient PCC' : `🎡 Spin - ${betAmount} PCC`}
      </button>
    </div>
  );
}
