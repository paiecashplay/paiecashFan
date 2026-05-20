import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/Toast';
import { useWallet } from '../../context/WalletContext';
import api from '../../api';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🪙'];
const PAYOUTS = { '💎💎💎': 50, '7️⃣7️⃣7️⃣': 30, '⭐⭐⭐': 20, '🪙🪙🪙': 15, '🍇🍇🍇': 10, '🍊🍊🍊': 8, '🍋🍋🍋': 5, '🍒🍒🍒': 3 };
const TWO_MATCH_PAYOUT = 2;
const rSym = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const genReels = () => [[rSym(), rSym(), rSym()], [rSym(), rSym(), rSym()], [rSym(), rSym(), rSym()]];

export default function SlotsGame({ game }) {
  const toast = useToast();
  const { balance, refreshBalance } = useWallet();
  const uid = useRef(null);
  const [reels, setReels] = useState([['🍒', '🍋', '🍊'], ['🍇', '⭐', '💎'], ['7️⃣', '🪙', '🍒']]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(2);
  const [result, setResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);

  useEffect(() => { try { uid.current = JSON.parse(localStorage.getItem('pcc_user') || '{}').id; } catch { } }, []);

  const noFunds = balance !== null && betAmount > balance;

  const spin = () => {
    if (!uid.current) { toast.error('Please login first'); return; }
    if (noFunds) { toast.error('Insufficient PCC balance'); return; }
    setSpinning(true); setResult(null);
    setTimeout(async () => {
      const nr = genReels(); setReels(nr);
      const wl = [nr[0][1], nr[1][1], nr[2][1]];
      const tk = wl.join('');
      let mr;
      if (PAYOUTS[tk]) { mr = { won: true, amount: PAYOUTS[tk] * betAmount, line: wl.join(' ') }; }
      else if (wl[0] === wl[1]) { mr = { won: true, amount: TWO_MATCH_PAYOUT * betAmount, line: wl.join(' ') }; }
      else { mr = { won: false, amount: 0, line: wl.join(' ') }; }
      setResult(mr); setSpinning(false); setSpinCount(p => p + 1);
      mr.won ? toast.success(`🎰 ${mr.line} - +${mr.amount} PCC!`, 4000) : toast.error('No match this time.', 2000);
      try {
        await api.recordGameSession({ userId: uid.current, gameId: 'slots', betAmount: parseFloat(betAmount), result: mr.won ? 'win' : 'loss', payout: mr.won ? mr.amount : 0, gameData: { reels: nr, winLine: mr.line } });
        await refreshBalance();
      } catch (e) { console.error('Session record failed:', e.message); }
    }, 1200);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: 'var(--gold)' }}>💰 Balance: {balance !== null ? balance.toFixed(2) : '...'} PCC</div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Spins: {spinCount}</div>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {reels.map((reel, ri) => (
            <div key={ri} className="reel-wrap" style={{ width: 80, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)' }}>
              {reel.map((sym, si) => (
                <div key={si} className={`reel-cell ${spinning ? 'spinning-reel' : ''}`} style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: si === 1 ? 'rgba(255,215,0,0.1)' : 'transparent', borderTop: si === 1 ? '2px solid rgba(255,215,0,0.3)' : 'none', borderBottom: si === 1 ? '2px solid rgba(255,215,0,0.3)' : 'none' }}>{sym}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ height: 2, width: '90%', margin: '-24px auto 20px', background: result?.won ? 'var(--gold)' : 'rgba(255,255,255,0.15)', position: 'relative', zIndex: 3 }} />
        <div style={{ minHeight: 48, textAlign: 'center', marginBottom: 16 }}>
          {spinning && <div style={{ color: 'var(--text-dim)' }}>🎰 Spinning...</div>}
          {result?.won && !spinning && <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.1rem' }}>🎉 {result.line} - +{result.amount} PCC!</div>}
          {result && !result.won && !spinning && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No match - {result.line}</div>}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Bet:</span>
          <input type="number" min="1" max="50" value={betAmount} onChange={e => setBetAmount(Math.max(1, +e.target.value))} disabled={spinning} style={{ background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', width: 70, fontSize: '0.9rem', outline: 'none' }} />
          {[1, 2, 5, 10].map(v => <button key={v} className="btn btn-sm btn-outline" disabled={spinning} onClick={() => setBetAmount(v)} style={{ opacity: spinning ? 0.5 : 1 }}>{v}</button>)}
        </div>
        <button onClick={spin} disabled={spinning || noFunds} style={{ width: '100%', padding: 14, fontSize: '1rem', fontWeight: 700, background: spinning || noFunds ? 'var(--bg-glass)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: spinning || noFunds ? 'not-allowed' : 'pointer', opacity: spinning || noFunds ? 0.6 : 1 }}>
          {spinning ? 'Spinning...' : noFunds ? '⚠ Insufficient PCC' : `🎰 SPIN - ${betAmount} PCC`}
        </button>
        <button onClick={() => setShowPaytable(!showPaytable)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginTop: 16, fontSize: '0.8rem', textDecoration: 'underline' }}>{showPaytable ? 'Hide Paytable' : 'View Paytable'}</button>
        {showPaytable && (
          <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>Winning Combinations (×bet):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.8rem' }}>
              {Object.entries(PAYOUTS).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}><span>{k}</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>×{v}</span></div>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}><span>Any 2 match</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>×{TWO_MATCH_PAYOUT}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
