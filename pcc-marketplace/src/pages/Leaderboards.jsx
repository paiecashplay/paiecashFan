import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Globe, Calendar, CalendarDays } from 'lucide-react';

export default function Leaderboards() {
  const [boardType, setBoardType] = useState('global');
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(boardType).then(d => setBoard(d?.leaderboard || [])).catch(() => {}).finally(() => setLoading(false));
  }, [boardType]);

  const rankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default';

  return (
    <div className="section fade-up">
      <h1 className="section-title" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={32} /> Leaderboards</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>Top players across contests, clubs, and rewards pools.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['global', 'weekly', 'monthly', 'all_time'].map(t => (
          <button key={t} className={`btn ${boardType === t ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setBoardType(t)}>
            {t === 'global' ? <Globe size={14} /> : t === 'weekly' ? <Calendar size={14} /> : t === 'monthly' ? <CalendarDays size={14} /> : <Trophy size={14} />} {t.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : board.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}><Trophy size={48} /></div>
            <h3>No rankings yet</h3>
            <p>Compete in contests and participate in reward pools to earn your spot on the leaderboard!</p>
          </div>
        ) : (
          <div>
            {/* Top 3 podium */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 24, background: 'var(--bg-glass)' }}>
              {board.slice(0, 3).map((entry, i) => (
                <div key={entry.id} style={{ textAlign: 'center', padding: 20 }}>
                  <div className={`leaderboard-rank ${rankClass(i)}`} style={{ width: 48, height: 48, fontSize: '1.2rem', margin: '0 auto 12px' }}>
                    {i + 1}
                  </div>
                  <div style={{ fontWeight: 700 }}>{entry.users?.full_name || 'Player'}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--gold)', marginTop: 4 }}>
                    {parseFloat(entry.score || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    {entry.wins || 0}W · {entry.losses || 0}L
                  </div>
                </div>
              ))}
            </div>

            {/* Rest of leaderboard */}
            {board.slice(3).map((entry, i) => (
              <div key={entry.id} className="leaderboard-item">
                <div className={`leaderboard-rank rank-default`}>{i + 4}</div>
                <div style={{ flex: 1, fontWeight: 600 }}>{entry.users?.full_name || 'Player'}</div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', marginRight: 16 }}>{parseFloat(entry.score || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{entry.wins || 0}W · {entry.losses || 0}L</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
