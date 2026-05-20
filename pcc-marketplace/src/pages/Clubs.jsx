import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClubCard from '../components/ClubCard';
import { getAllClubs, getFeaturedClub } from '../clubThemes';
import { useChatbot } from '../context/ChatbotContext';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { setActiveClub } = useChatbot();

  useEffect(() => {
    // Reset chatbot to default theme on listing page
    setActiveClub(null);
    setClubs(getAllClubs());
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const featured = getFeaturedClub();
  
  // Group clubs by category
  const groupedClubs = clubs.reduce((acc, club) => {
    if (club.id === featured?.id) return acc; // Skip featured from categories
    const cat = club.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(club);
    return acc;
  }, {});

  // Predefined order for categories
  const categoryOrder = [
    'French Football Clubs',
    'Morocco / Arabic Football',
    'Rugby',
    'Tanzania (Swahili Region)',
    'Senegal'
  ];

  return (
    <div className={`clubs-page ${mounted ? 'clubs-page--mounted' : ''}`}>
      <div className="clubs-page__noise" />

      <header className="clubs-page__header">
        <div className="clubs-page__header-bg" style={{ backgroundImage: 'url(/images/clubs-hero-banner.png)' }} />
        <div className="clubs-page__header-content">
          <span className="clubs-page__header-tag">Global Marketplace</span>
          <h1 className="clubs-page__title">
            Elite Sports
            <br />
            <span className="clubs-page__title-accent">Ecosystem</span>
          </h1>
          <p className="clubs-page__subtitle">
            Explore world-class football clubs, national federations, and elite rugby teams.
          </p>
        </div>
        <div className="clubs-page__orb clubs-page__orb--1" />
        <div className="clubs-page__orb clubs-page__orb--2" />
      </header>

      <section className="clubs-page__content">
        {/* Featured Section */}
        {featured && (
          <div className="clubs-section">
            <h2 className="clubs-section__title">Featured Organization</h2>
            <div className="clubs-page__featured">
              <ClubCard club={featured} featured={true} />
            </div>
          </div>
        )}

        {/* Categorized Sections */}
        {categoryOrder.map((cat) => (
          groupedClubs[cat] && groupedClubs[cat].length > 0 && (
            <div key={cat} className="clubs-section">
              <div className="clubs-section__header">
                <h2 className="clubs-section__title">{cat}</h2>
                <div className="clubs-section__line" />
              </div>
              <div className="clubs-page__grid">
                {groupedClubs[cat].map((club, i) => (
                  <div
                    key={club.id}
                    className="clubs-page__card-wrap"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <ClubCard club={club} />
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </section>

      <section className="clubs-page__cta">
        <div className="clubs-page__cta-content">
          <h2 className="clubs-page__cta-title">Own a club?</h2>
          <p className="clubs-page__cta-text">Register your organization on the PCC marketplace and reach millions of fans worldwide.</p>
          <Link to="/clubs/onboarding" className="clubs-page__cta-btn">
            Apply for Onboarding
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
