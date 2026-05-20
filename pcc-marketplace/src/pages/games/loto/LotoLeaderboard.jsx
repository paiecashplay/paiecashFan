export default function LotoLeaderboard({ leaderboard, onBack }) {
  const isEmpty = !leaderboard || leaderboard.length === 0;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="llb-page">

      {/* ── Header ── */}
      <div className="llb-header fly-in">
        <button className="ll-back-btn" onClick={onBack}>← Back</button>
        <div className="llb-title-wrap">
          <span className="llb-eyebrow">Hall of Fame</span>
          <h2 className="llb-title">Leaderboard</h2>
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty state ── */
        <div className="llb-empty fly-in">
          <div className="llb-empty-icon">🏆</div>
          <p className="llb-empty-text">No scores yet.</p>
          <p className="llb-empty-sub">Win a game to claim the top spot.</p>
        </div>
      ) : (
        /* ── Table ── */
        <div className="llb-table-wrap fly-in">
          {/* Column headers */}
          <div className="llb-col-heads">
            <span>#</span>
            <span>Player</span>
            <span>Wins</span>
            <span>Games</span>
            <span>Score</span>
          </div>

          {leaderboard.map((entry, i) => {
            const isTop3 = i < 3;
            return (
              <div
                key={entry.user_id || i}
                className={`llb-row ${isTop3 ? 'llb-row-top' : ''} ${i === 0 ? 'llb-row-gold' : ''}`}
              >
                {/* Rank */}
                <span className="llb-rank">
                  {isTop3 ? medals[i] : `#${i + 1}`}
                </span>

                {/* Player */}
                <span className="llb-player">
                  <span className="llb-avatar">
                    {(entry.username || 'A').charAt(0).toUpperCase()}
                  </span>
                  <span className="llb-name">{entry.username}</span>
                </span>

                {/* Wins */}
                <span className="llb-wins">{entry.total_wins}</span>

                {/* Games */}
                <span className="llb-games">{entry.total_games}</span>

                {/* Score */}
                <span className="llb-score">
                  {entry.total_score?.toLocaleString() ?? '-'}
                </span>

                {/* Gold shimmer bar for #1 */}
                {i === 0 && <div className="llb-gold-bar" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}