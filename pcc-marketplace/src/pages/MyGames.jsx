import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { useWallet } from '../context/WalletContext';
import { MY_SESSIONS, PCC_TRANSACTIONS, timeAgo } from '../data/mockSessionData';
import { GAMES } from '../data/gamesData';
import { Gamepad2, TrendingUp, TrendingDown, Trophy } from 'lucide-react';

export default function MyGames() {
  const { user, wallet } = useAuth();
  const { balance: liveBalance } = useWallet();
  const [activeTab, setActiveTab] = useState('sessions');
  const balance = liveBalance ?? wallet?.balance ?? 0;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Gamepad2 size={48} style={{ color: '#888', marginBottom: 16 }} />
        <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Login Required</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>You need to be logged in to view your game history.</p>
        <Link to="/login" style={{
          display: 'inline-block', padding: '10px 28px', borderRadius: 99,
          background: '#02C767', color: '#000', fontWeight: 700, textDecoration: 'none'
        }}>Login Now</Link>
      </div>
    );
  }

  const totalGames = MY_SESSIONS.length;
  const wins = MY_SESSIONS.filter(s => s.result === 'win').length;
  const losses = MY_SESSIONS.filter(s => s.result !== 'win').length;
  const totalWon = MY_SESSIONS.filter(s => s.amount > 0).reduce((a, b) => a + b.amount, 0);
  const totalLost = Math.abs(MY_SESSIONS.filter(s => s.amount < 0).reduce((a, b) => a + b.amount, 0));
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
  const netPnl = +(totalWon - totalLost).toFixed(2);

  const sessionDetail = (s) => {
    if (s.gameId === 'aviator') return s.multiplier;
    if (s.gameId === 'slots') return s.combo;
    return s.bet + ' → ' + s.number;
  };

  const stats = [
    { label: 'Games Played', value: totalGames,           color: '#ffffff' },
    { label: 'Wins',         value: wins,                  color: '#02C767' },
    { label: 'Losses',       value: losses,                color: '#ef4444' },
    { label: 'Win Rate',     value: `${winRate}%`,         color: '#02C767' },
    { label: 'Net P&L',      value: `${netPnl >= 0 ? '+' : ''}${netPnl} PCC`, color: netPnl >= 0 ? '#02C767' : '#ef4444' },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Gamepad2 size={26} color="#02C767" /> My Games
        </h1>
        <div style={{
          fontSize: '0.875rem', fontWeight: 700, color: '#02C767',
          background: 'rgba(2,199,103,0.1)', border: '1px solid rgba(2,199,103,0.25)',
          padding: '6px 16px', borderRadius: 99
        }}>
          🪙 {balance.toLocaleString()} PCC
        </div>
      </div>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Your gaming history and PCC transactions</p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: '#121212', border: '1px solid #2a2a2a',
            borderRadius: 12, padding: 16, textAlign: 'center'
          }}>
            <div style={{ color: stat.color, fontWeight: 800, fontSize: 22 }}>{stat.value}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'sessions',     label: '🎮 Game Sessions' },
          { key: 'transactions', label: '💳 PCC Transactions' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '9px 20px', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', border: 'none',
            background: activeTab === t.key ? '#02C767' : '#1e1e1e',
            color:      activeTab === t.key ? '#000'     : '#888',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Sessions Tab ── */}
      {activeTab === 'sessions' && (
        MY_SESSIONS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            <p>No games played yet. Go win some PCC!</p>
          </div>
        ) : (
          <div style={{ background: '#121212', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 80px',
              padding: '12px 20px', background: '#0a0a0a',
              color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', gap: 8
            }}>
              <span>#</span><span>Game</span><span>Details</span><span style={{ textAlign: 'center' }}>Result</span><span style={{ textAlign: 'right' }}>Time</span>
            </div>

            {MY_SESSIONS.map((s, idx) => {
              const g = GAMES.find(g => g.id === s.gameId);
              return (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 80px',
                  padding: '14px 20px', gap: 8,
                  borderTop: '1px solid #2a2a2a',
                  alignItems: 'center',
                  background: idx % 2 === 0 ? 'transparent' : '#ffffff03'
                }}>
                  <span style={{ color: '#555', fontSize: 13 }}>{idx + 1}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, background: '#1e1e1e', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>{s.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#eaeaea' }}>{s.gameName}</div>
                      {g?.playable && (
                        <Link to={`/gaming/play/${s.gameId}`} style={{ fontSize: '0.7rem', color: '#02C767', textDecoration: 'none' }}>
                          Play again →
                        </Link>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{sessionDetail(s)}</span>
                  <span style={{ textAlign: 'center' }}>
                    <span style={{
                      background: s.result === 'win' ? 'rgba(2,199,103,0.15)' : 'rgba(239,68,68,0.15)',
                      color:      s.result === 'win' ? '#02C767'               : '#ef4444',
                      border:    `1px solid ${s.result === 'win' ? 'rgba(2,199,103,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {s.result === 'win' ? '+' : ''}{s.amount} PCC
                    </span>
                  </span>
                  <span style={{ color: '#888', fontSize: '0.78rem', textAlign: 'right' }}>{timeAgo(s.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Transactions Tab ── */}
      {activeTab === 'transactions' && (
        PCC_TRANSACTIONS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div style={{ background: '#121212', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 110px 110px 80px',
              padding: '12px 20px', background: '#0a0a0a',
              color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', gap: 8
            }}>
              <span></span><span>Type</span><span style={{ textAlign: 'right' }}>Amount</span>
              <span style={{ textAlign: 'right' }}>Balance</span><span style={{ textAlign: 'right' }}>Time</span>
            </div>

            {PCC_TRANSACTIONS.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 110px 110px 80px',
                padding: '14px 20px', gap: 8,
                borderTop: i > 0 ? '1px solid #2a2a2a' : 'none',
                alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : '#ffffff03'
              }}>
                <span style={{ fontSize: '1.2rem', textAlign: 'center' }}>{tx.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#eaeaea' }}>{tx.label}</div>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700,
                    display: 'inline-block', marginTop: 3,
                    background: tx.type === 'credit' ? 'rgba(2,199,103,0.15)' : 'rgba(239,68,68,0.15)',
                    color:      tx.type === 'credit' ? '#02C767'               : '#ef4444',
                    border:    `1px solid ${tx.type === 'credit' ? 'rgba(2,199,103,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {tx.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                  </span>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: '0.9rem', textAlign: 'right',
                  color: tx.type === 'credit' ? '#02C767' : '#ef4444'
                }}>
                  {tx.type === 'credit' ? '+' : ''}{tx.amount} PCC
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'right' }}>{tx.balance} PCC</span>
                <span style={{ color: '#888', fontSize: '0.78rem', textAlign: 'right' }}>{timeAgo(tx.timestamp)}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
