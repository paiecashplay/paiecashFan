import { useParams, useNavigate } from 'react-router-dom';
import { GAMES } from '../data/gamesData';
import { LEADERBOARDS } from '../data/mockSessionData';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function GameLeaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = GAMES.find(g => g.id === id);
  const entries = LEADERBOARDS[id] || [];

  if (!game) {
    return (
      <div className="section" style={{ textAlign: 'center', padding: 80 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/gaming')}>← Back</button>
      </div>
    );
  }

  const gridCols = id === 'slots' ? '48px 1fr 100px 80px' : '48px 1fr 80px 80px';
  const midH = id === 'aviator' ? 'Cashout' : id === 'slots' ? 'Combo' : 'Bet';
  const midV = (e) => id === 'aviator' ? e.cashOutAt : id === 'slots' ? e.combo : e.bet;
  const ri = (r) => r === 1 ? '#1' : r === 2 ? '#2' : r === 3 ? '#3' : r;
  const fl = (c) => c === 'ZA' ? 'ZA' : 'IN';

  const pod = entries.length >= 3 ? [entries[1], entries[0], entries[2]] : [];
  const ps = [
    { av: 48, bar: 44, c: '#94a3b8', l: '2' },
    { av: 56, bar: 60, c: 'var(--gold)', l: '1' },
    { av: 44, bar: 32, c: '#b45309', l: '3' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/gaming')}
        style={{ marginBottom: 28, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={16} /> Back to Gaming Hub
      </button>

      <div style={{ background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 4, background: game.accentColor }} />
        <div style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, background: `${game.accentColor}26`, borderRadius: 'var(--radius-lg)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{game.emoji}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900 }}>{game.title} Leaderboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Top players this session</p>
          </div>
          <Trophy size={32} style={{ color: 'var(--color-gold)' }} />
        </div>
      </div>

      {pod.length === 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
          {pod.map((e, i) => (
            <div key={e.rank} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: ps[i].av, height: ps[i].av, borderRadius: '50%', background: `${game.accentColor}33`, border: `2px solid ${ps[i].c}`, fontSize: i === 1 ? '1.8rem' : '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{e.avatar}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.name}</div>
              <div style={{ color: 'var(--color-gold)', fontWeight: 800, fontSize: '1.1rem' }}>+{e.won} PCC</div>
              <div style={{ height: ps[i].bar, width: 80, marginTop: 8, background: `linear-gradient(to top, ${ps[i].c}, ${ps[i].c}4d)`, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.6)', fontWeight: 900, fontSize: '1.2rem' }}>{ps[i].l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '12px 20px', background: 'var(--color-surface)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          <span>#</span><span>Player</span><span>{midH}</span><span>Won</span>
        </div>
        {entries.map(e => (
          <div key={e.rank} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>{ri(e.rank)}</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.avatar}</div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.name}</span>
              <span style={{ fontSize: '0.8rem' }}>{fl(e.country)}</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>{midV(e)}</span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.9rem' }}>+{e.won} PCC</span>
          </div>
        ))}
        {entries.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>No leaderboard data yet.</div>}
      </div>

      <button className="btn btn-primary" onClick={() => navigate(game.playable ? `/gaming/play/${id}` : '/gaming')} style={{ width: '100%', marginTop: 24 }}>
        {game.playable ? `Play ${game.title} →` : 'Back to Gaming Hub'}
      </button>
    </div>
  );
}
