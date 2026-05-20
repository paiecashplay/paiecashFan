// ═══════════════════════════════════════════════════════════════
// components/MatchRoomCard.jsx
// Props: { room, isActive, onClick }
// ═══════════════════════════════════════════════════════════════

import { getClubTheme } from '../clubThemes';

function TeamBadge({ slug, name }) {
  const theme = getClubTheme(slug);
  if (theme && theme.badge) {
    return (
      <img
        src={theme.badge}
        alt={name}
        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: '#fff', padding: 3 }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  const initials = (name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
      background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: 13, color: '#00ff88',
    }}>
      {initials}
    </div>
  );
}

export default function MatchRoomCard({ room, isActive, onClick, fanCount = 0 }) {
  const isLive = room.status === 'live';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 14,
        cursor: 'pointer',
        background: isActive ? 'rgba(0,255,136,0.06)' : 'transparent',
        border: isActive
          ? '1px solid rgba(0,255,136,0.35)'
          : '1px solid rgba(255,255,255,0.07)',
        borderLeft: isActive ? '3px solid #00ff88' : '3px solid transparent',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* League + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {room.match_id?.replace(/_/g, ' ')?.slice(0, 20) || 'Match'}
        </span>
        {isLive ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: '#ef4444' }}>
            <span className="md-live-dot" />
            LIVE {room.match_minute > 0 ? `${room.match_minute}'` : ''}
          </span>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99 }}>
            UPCOMING
          </span>
        )}
      </div>

      {/* Teams + Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Team A */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
          <TeamBadge slug={room.team_a_slug} name={room.team_a} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.2 }}>
            {room.team_a?.split(' ').slice(-1)[0]}
          </span>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontSize: isLive ? 22 : 16,
            fontWeight: 900,
            color: isLive ? '#00ff88' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Rajdhani', monospace",
            letterSpacing: 2,
            lineHeight: 1,
          }}>
            {isLive ? `${room.score_a} - ${room.score_b}` : 'vs'}
          </div>
          {!isLive && room.kick_off_time && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              {new Date(room.kick_off_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
          <TeamBadge slug={room.team_b_slug} name={room.team_b} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.2 }}>
            {room.team_b?.split(' ').slice(-1)[0]}
          </span>
        </div>
      </div>

      {/* Fan count */}
      {fanCount > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          🔥 {fanCount} fans discussing
        </div>
      )}
    </div>
  );
}
