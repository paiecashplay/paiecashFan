import { Link } from 'react-router-dom';

export default function ClubCard({ club, featured = false }) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className={`club-card-v2 ${featured ? 'club-card-v2--featured' : ''}`}
      style={{
        '--card-primary': club.primaryColor,
        '--card-secondary': club.secondaryColor,
        '--card-accent': club.accentColor,
        '--card-glow': club.glowColor,
        '--card-glow-strong': club.glowColorStrong,
        '--card-gradient': club.cardGradient,
      }}
    >
      {/* Stadium background image */}
      {club.cardBgImage && (
        <div className="club-card-v2__bg-image" style={{ backgroundImage: `url(${club.cardBgImage})` }} />
      )}

      {/* Dark overlay gradient for readability */}
      <div className="club-card-v2__overlay" />

      {/* Noise overlay */}
      <div className="club-card-v2__noise" />

      {/* Background glow */}
      <div className="club-card-v2__glow" />

      {/* Top metadata row */}
      <div className="club-card-v2__meta-row">
        <span className="club-card-v2__league-tag">{club.league}</span>
        <span className="club-card-v2__country-tag">{club.country}</span>
      </div>

      {/* Crest */}
      <div className="club-card-v2__crest-wrap">
        {club.crestUrl ? (
          <img src={club.crestUrl} alt={club.name} className="club-card-v2__crest-img" />
        ) : (
          <span className="club-card-v2__crest-emoji">{club.crestEmoji}</span>
        )}
      </div>

      {/* Club name */}
      <h3 className="club-card-v2__name">{club.name}</h3>

      {/* Tagline */}
      <p className="club-card-v2__tagline">{club.tagline}</p>

      {/* Stats row */}
      <div className="club-card-v2__stats">
        <div className="club-card-v2__stat">
          <span className="club-card-v2__stat-value">{club.fanTokens}</span>
          <span className="club-card-v2__stat-label">Fan Tokens</span>
        </div>
        <div className="club-card-v2__stat-divider" />
        <div className="club-card-v2__stat">
          <span className="club-card-v2__stat-value">{club.merchandiseCount}</span>
          <span className="club-card-v2__stat-label">Products</span>
        </div>
        <div className="club-card-v2__stat-divider" />
        <div className="club-card-v2__stat">
          <span className="club-card-v2__stat-value">{club.founded}</span>
          <span className="club-card-v2__stat-label">Est.</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="club-card-v2__accent-line" />
    </Link>
  );
}
