import { useState, useEffect } from 'react';

const TYPE_CONFIG = {
  mint: { icon: '⬇️', color: '#22c55e', label: 'Received' },
  spend: { icon: '⬆️', color: '#ef4444', label: 'Spent' },
  transfer: { icon: '↔️', color: '#60a5fa', label: 'Transfer' },
  topup_initiated: { icon: '💳', color: '#f5a623', label: 'Top-Up' },
  topup_failed: { icon: '❌', color: '#6b7280', label: 'Failed' },
  game_win: { icon: '🎮', color: '#22c55e', label: 'Game Win' },
  game_loss: { icon: '🎮', color: '#ef4444', label: 'Game Loss' },
};

const RAIL_LABELS = {
  stripe: '💳 Stripe',
  internal: '⚡ Internal',
  crypto: '⛓️ Crypto',
  mobile_money: '📱 Mobile'
};

export default function TransactionFeed({ userId, limit = 20, showTitle = true }) {
  const [txns, setTxns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [combined, setCombined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!userId) return;
    loadAll();
  }, [userId]);

  const loadAll = async () => {
    setLoading(true);
    const raw = localStorage.getItem('pcc_user');
    const token = raw ? JSON.parse(raw).token : null;
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    try {
      const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
      // Fetch transactions ledger
      const txRes = await fetch(`${API_BASE}/api/v2/mint/wallet/${userId}/transactions?limit=${limit}`, { headers })
        .then(r => r.ok ? r.json() : { transactions: [] })
        .catch(() => ({ transactions: [] }));

      // Fetch game sessions
      const gsRes = await fetch(`${API_BASE}/api/v2/gaming/sessions/${userId}`, { headers })
        .then(r => r.ok ? r.json() : { sessions: [] })
        .catch(() => ({ sessions: [] }));

      const txList = txRes.transactions || [];
      const gsList = gsRes.sessions || [];

      // Normalize game sessions to transaction shape
      const normalizedSessions = gsList.map(s => ({
        id: s.id,
        type: s.result === 'win' ? 'game_win' : 'game_loss',
        pcc_amount: Math.abs(parseFloat(s.net_pnl || 0)),
        payment_rail: 'internal',
        internal_status: 'complete',
        metadata: { gameId: s.game_id, betAmount: s.bet_amount, payout: s.payout },
        created_at: s.created_at,
        _source: 'game'
      }));

      // Merge and sort by date descending
      const all = [...txList, ...normalizedSessions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);

      setCombined(all);
    } catch (err) {
      console.error('TransactionFeed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? combined
    : filter === 'games' ? combined.filter(t => t._source === 'game')
      : combined.filter(t => t._source !== 'game' && t.type === filter);

  const formatDate = (iso) => new Date(iso).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div>
      {showTitle && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px'
        }}>
          <h3 style={{ margin: 0, color: '#fff', fontWeight: '700' }}>Transaction History</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'mint', 'spend', 'games', 'topup_initiated'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: '16px', border: 'none',
                background: filter === f ? '#f5a623' : '#1f2937',
                color: filter === f ? '#000' : '#9ca3af',
                fontWeight: '600', cursor: 'pointer', fontSize: '12px',
                textTransform: 'capitalize'
              }}>{f === 'topup_initiated' ? 'Top-Up' : f}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
          <p style={{ margin: 0 }}>No transactions yet</p>
        </div>
      ) : (
        <div style={{
          background: '#1a1a2e', border: '1px solid #374151',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          {filtered.map((tx, i) => {
            const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.spend;
            const isPositive = ['mint', 'game_win'].includes(tx.type);
            const gameId = tx.metadata?.gameId;
            const gameIcons = {
              aviator: '✈️', slots: '🎰', roulette: '🎡',
              cricket: '🏏', braai_poker: '🔥'
            };

            return (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px',
                borderTop: i > 0 ? '1px solid #1f2937' : 'none',
                background: i % 2 === 0 ? 'transparent' : '#ffffff03'
              }}>
                {/* Icon */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: cfg.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0
                }}>
                  {tx._source === 'game' && gameId
                    ? (gameIcons[gameId] || '🎮')
                    : cfg.icon}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#e5e7eb', fontWeight: '600', fontSize: '14px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {tx._source === 'game'
                      ? `${gameIcons[gameId] || '🎮'} ${gameId?.replace('_', ' ')} - ${cfg.label}`
                      : cfg.label}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                    {RAIL_LABELS[tx.payment_rail] || tx.payment_rail}
                    {tx._source === 'game' && tx.metadata?.betAmount &&
                      ` · Bet: ${parseFloat(tx.metadata.betAmount).toFixed(2)} PCC`}
                    {' · '}{formatDate(tx.created_at)}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    color: isPositive ? '#22c55e' : '#ef4444',
                    fontWeight: '800', fontSize: '15px'
                  }}>
                    {isPositive ? '+' : '-'}{parseFloat(tx.pcc_amount || 0).toFixed(2)} PCC
                  </div>
                  <div style={{
                    fontSize: '11px', marginTop: '2px',
                    color: tx.internal_status === 'complete' ? '#4b5563'
                      : tx.internal_status === 'pending' ? '#d97706' : '#6b7280'
                  }}>
                    {tx.internal_status || 'complete'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
