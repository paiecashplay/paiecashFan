import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClubTheme, injectClubTheme } from '../clubThemes';
import ClubHero from '../components/ClubHero';
import ClubStats from '../components/ClubStats';
import ClubStory from '../components/ClubStory';
import StarPlayer from '../components/StarPlayer';
import SquadSpotlight from '../components/SquadSpotlight';
import MerchandiseGrid from '../components/MerchandiseGrid';
import { useChatbot } from '../context/ChatbotContext';

export default function ClubStore() {
  const { slugOrId } = useParams();

  // getClubTheme is SYNCHRONOUS - resolve on the very first render
  const [theme, setTheme] = useState(() => getClubTheme(slugOrId) || null);
  const pageRef = useRef(null);
  const { setActiveClub, closeChat } = useChatbot();

  useEffect(() => {
    if (slugOrId) setActiveClub(slugOrId);
    return () => closeChat();
  }, [slugOrId]);

  // Re-runs only when the user navigates to a different club
  useEffect(() => {
    const clubTheme = getClubTheme(slugOrId);
    setTheme(clubTheme || null);
    window.scrollTo(0, 0);
  }, [slugOrId]);

  // Inject CSS tokens for dynamic theming
  useEffect(() => {
    if (theme && pageRef.current) {
      injectClubTheme(pageRef.current, theme.id);
    }

    if (theme) {
      document.body.style.setProperty('--club-page-active', '1');
      document.body.style.setProperty('--club-body-bg', theme.darkColor);
      document.body.style.background = theme.darkColor;
    }

    return () => {
      document.body.style.removeProperty('--club-page-active');
      document.body.style.removeProperty('--club-body-bg');
      document.body.style.background = '';
    };
  }, [theme]);

  // Only show "not found" for genuinely invalid slugs
  if (!theme) {
    return (
      <div className="club-store-empty">
        <div className="club-store-empty__content">
          <span className="club-store-empty__icon">⚽</span>
          <h2>Club not found</h2>
          <p>The club you're looking for doesn't exist in our marketplace yet.</p>
          <Link to="/clubs" className="club-store-empty__btn">
            ← Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="club-store club-store--ready"
      style={{ background: theme.darkColor }}
    >
      {/* Back button */}
      <Link to="/clubs" className="club-store__back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        All Clubs
      </Link>

      <ClubHero theme={theme} />
      <ClubStats theme={theme} />
      <ClubStory theme={theme} />
      <StarPlayer theme={theme} />
      <SquadSpotlight theme={theme} />
      <MerchandiseGrid theme={theme} clubId={theme.id} />


    </div>
  );
}
