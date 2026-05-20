import { useState, useEffect } from 'react';
import api from '../api';
import TransactionFeed from '../components/TransactionFeed';

const GAME_ICONS = { aviator: '✈️', slots: '🎰', roulette: '🎡', default: '🎮' };

export default function GameHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPlayed: 0, totalWon: 0, totalLost: 0, netPnl: 0, winRate: 0 });

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    if (!user?.id) return;
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getGameHistory(user.id);
      const list = data.sessions || [];
      setSessions(list);

      // Calculate stats
      const won = list.filter(s => s.result === 'win');
      const lost = list.filter(s => s.result === 'loss');
      const netPnl = list.reduce((sum, s) => sum + parseFloat(s.net_pnl || 0), 0);
      setStats({
        totalPlayed: list.length,
        totalWon: won.length,
        totalLost: lost.length,
        netPnl: +netPnl.toFixed(2),
        winRate: list.length > 0 ? +((won.length / list.length) * 100).toFixed(1) : 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', fontWeight: '800', marginBottom: '8px' }}>📊 Game History</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>All your past rounds across Aviator, Slots & Roulette</p>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Games Played', value: stats.totalPlayed, color: '#ffffff' },
          { label: 'Wins', value: stats.totalWon, color: '#02C767' },
          { label: 'Losses', value: stats.totalLost, color: '#ef4444' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: '#02C767' },
          { label: 'Net P&L', value: `${stats.netPnl > 0 ? '+' : ''}${stats.netPnl} PCC`,
            color: stats.netPnl >= 0 ? '#02C767' : '#ef4444' }
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#121212', border: '1px solid #2a2a2a',
            borderRadius: '12px', padding: '16px', textAlign: 'center'
          }}>
            <div style={{ color: stat.color, fontWeight: '800', fontSize: '22px' }}>{stat.value}</div>
            <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sessions Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading history...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎮</div>
          <p>No games played yet. Go win some PCC!</p>
        </div>
      ) : (
        <div className="history-table" style={{ background: '#121212', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table Header */}
          <div className="history-table-row" style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 140px',
            padding: '12px 20px',
            background: '#0a0a0a',
            color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
            gap: '8px'
          }}>
            <span></span>
            <span>Game</span>
            <span style={{ textAlign: 'right' }}>Bet</span>
            <span className="history-col-payout" style={{ textAlign: 'right' }}>Payout</span>
            <span style={{ textAlign: 'right' }}>Net P&L</span>
            <span style={{ textAlign: 'center' }}>Result</span>
            <span className="history-col-time" style={{ textAlign: 'right' }}>Time</span>
          </div>

          {/* Rows */}
          {sessions.map((session, i) => {
            const pnl = parseFloat(session.net_pnl || 0);
            return (
              <div key={session.id} className="history-table-row" style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 140px',
                padding: '14px 20px', gap: '8px',
                borderTop: i > 0 ? '1px solid #2a2a2a' : 'none',
                alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : '#ffffff03'
              }}>
                <span style={{ fontSize: '20px' }}>{GAME_ICONS[session.game_id] || GAME_ICONS.default}</span>
                <span style={{ color: '#eaeaea', fontWeight: '600', textTransform: 'capitalize' }}>
                  {session.game_id}
                </span>
                <span style={{ color: '#9ca3af', textAlign: 'right', fontSize: '13px' }}>
                  {parseFloat(session.bet_amount).toFixed(2)} PCC
                </span>
                <span className="history-col-payout" style={{ color: '#9ca3af', textAlign: 'right', fontSize: '13px' }}>
                  {parseFloat(session.payout || 0).toFixed(2)} PCC
                </span>
                <span style={{
                  textAlign: 'right', fontWeight: '700', fontSize: '13px',
                  color: pnl >= 0 ? '#02C767' : '#ef4444'
                }}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} PCC
                </span>
                <span style={{ textAlign: 'center' }}>
                  <span style={{
                    background: session.result === 'win' ? 'rgba(2, 199, 103, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: session.result === 'win' ? '#02C767' : '#ef4444',
                    border: `1px solid ${session.result === 'win' ? 'rgba(2, 199, 103, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                  }}>{session.result}</span>
                </span>
                <span className="history-col-time" style={{ color: '#888', textAlign: 'right', fontSize: '12px' }}>
                  {formatDate(session.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add this section below the sessions table JSX: */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#fff', fontWeight: '700', marginBottom: '16px' }}>
          💳 Full Ledger
        </h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
          All PCC movements including top-ups and transfers
        </p>
        <TransactionFeed userId={user?.id} limit={30} showTitle={false} />
      </div>
    </div>
  );
}
