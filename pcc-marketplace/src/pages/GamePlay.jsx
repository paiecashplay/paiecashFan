import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../App';
import { GAMES } from '../data/gamesData';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import AviatorGame from './games/AviatorGame';
import SlotsGame from './games/SlotsGame';
import RouletteGame from './games/RouletteGame';

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wallet } = useAuth();
  const { balance: liveBalance } = useWallet();
  const game = GAMES.find(g => g.id === id);
  const balance = liveBalance ?? wallet?.balance ?? 0;

  if (!game) {
    return (
      <div className="section" style={{ textAlign: 'center', padding: 80 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Game not found</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>This game doesn&apos;t exist or is no longer available.</p>
        <button className="btn btn-outline" onClick={() => navigate('/gaming')}>
          <ArrowLeft size={16} /> Back to Gaming Hub
        </button>
      </div>
    );
  }

  const renderGame = () => {
    switch (id) {
      case 'aviator': return <AviatorGame game={game} />;
      case 'slots': return <SlotsGame game={game} />;
      case 'roulette': return <RouletteGame game={game} />;
      default: return (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{game.emoji}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>
            {game.title} - Coming Soon
          </h2>
          <p style={{ color: 'var(--text-dim)' }}>This game is under development. Check back soon!</p>
        </div>
      );
    }
  };

  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: 'calc(100vh - 70px)', padding: 20 }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,230,118,0.4); }
          50% { box-shadow: 0 0 30px rgba(0,230,118,0.8); }
        }
        @keyframes spin-blur {
          0% { transform: translateY(0); filter: blur(0); }
          50% { transform: translateY(-8px); filter: blur(3px); }
          100% { transform: translateY(0); filter: blur(0); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes number-pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .spinning-reel { animation: spin-blur 0.15s ease-in-out infinite; }
        .result-pop { animation: number-pop 0.4s ease-out forwards; }
        .cashout-btn { animation: pulse-glow 1s infinite; }
        @media (max-width: 480px) {
          .reel-cell { height: 55px !important; font-size: 1.5rem !important; }
          .reel-wrap { width: 65px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem',
          }}>
            {game.emoji} {game.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to={`/gaming/leaderboard/${id}`}
              style={{
                fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600,
                textDecoration: 'none', padding: '4px 10px', background: 'rgba(255,215,0,0.1)',
                borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,215,0,0.2)'
              }}>
              🏆 Leaderboard
            </Link>
            <div style={{
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)',
              background: 'var(--bg-glass)', padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
            }}>
              {balance.toLocaleString()} PCC
            </div>
          </div>
        </div>

        {/* Game Content */}
        {renderGame()}
      </div>
    </div>
  );
}
