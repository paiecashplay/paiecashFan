import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { GAMES } from '../data/gamesData';
import { Trophy, Users, Ticket, ArrowLeft, Wallet } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';

export default function GameLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = GAMES.find(g => g.id === id);
  const { wallet } = useAuth();
  const { balance: liveBalance } = useWallet();
  const { showToast } = useToast();
  const balance = liveBalance ?? wallet?.balance ?? 0;
  const canAfford = game ? balance >= game.entryFee : false;
  const [entered, setEntered] = useState(false);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  if (!game) {
    return (
      <div className="section" style={{ textAlign: 'center', padding: 80 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Game not found</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>The game you&apos;re looking for doesn&apos;t exist.</p>
        <button className="btn btn-outline" onClick={() => navigate('/gaming')}>
          <ArrowLeft size={16} /> Back to Gaming Hub
        </button>
      </div>
    );
  }

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => {
      navigate(`/gaming/play/${id}`);
    }, 1500);
  };

  const handleJoinWaitlist = () => {
    if (email.includes('@')) {
      setJoined(true);
      showToast({ type: 'success', message: `✅ You're on the waitlist! 10 PCC bonus reserved for ${email}`, duration: 5000 });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({ type: 'info', message: 'Link copied to clipboard!', duration: 2000 });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .lobby-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
        @media (max-width: 480px) { .lobby-stats { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      {/* Back Button */}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/gaming')}
        style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> Back to Gaming Hub
      </button>

      {/* Game Hero Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>
        {/* Top Accent Bar */}
        <div style={{ height: 6, background: game.accentColor, width: '100%' }} />

        {/* Hero Body */}
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64,
              background: `${game.accentColor}26`,
              borderRadius: 'var(--radius-lg)',
              fontSize: '2.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {game.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.7rem', background: 'var(--bg-glass)', color: 'var(--text-dim)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'inline-block',
                marginBottom: 8, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px',
              }}>
                {game.category}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                {game.title}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.5 }}>
                {game.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lobby-stats">
            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
              <Trophy size={20} style={{ color: game.accentColor, margin: '0 auto' }} />
              <div style={{ fontWeight: 800, fontSize: '1.4rem', marginTop: 6, color: 'var(--gold)' }}>
                {game.prizePool.toLocaleString()} PCC
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Prize Pool</div>
            </div>
            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
              <Ticket size={20} style={{ color: game.accentColor, margin: '0 auto' }} />
              <div style={{ fontWeight: 800, fontSize: '1.4rem', marginTop: 6, color: 'var(--accent)' }}>
                {game.entryFee} PCC
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Entry Fee</div>
            </div>
            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
              <Users size={20} style={{ color: game.accentColor, margin: '0 auto' }} />
              <div style={{ fontWeight: 800, fontSize: '1.4rem', marginTop: 6, color: '#fff' }}>
                {game.players.toLocaleString()}{game.maxPlayers > 0 ? `/${game.maxPlayers.toLocaleString()}` : ''}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Players</div>
            </div>
          </div>

          {/* ─── PLAYABLE GAMES: Wallet + Enter ─── */}
          {game.playable !== false && (
            <>
              {/* Wallet Status Box */}
              <div style={{
                marginTop: 20, padding: 16,
                background: canAfford ? 'rgba(0,230,118,0.08)' : 'rgba(244,67,54,0.08)',
                border: `1px solid ${canAfford ? 'rgba(0,230,118,0.25)' : 'rgba(244,67,54,0.25)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: canAfford ? 'var(--accent)' : 'var(--red)', fontWeight: 700,
                }}>
                  <Wallet size={20} />
                  Your Balance: {balance.toLocaleString()} PCC
                </div>
                {!canAfford && (
                  <button className="btn btn-sm btn-gold"
                    onClick={() => {
                      const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                      const BUY_PCC_URL = import.meta.env.VITE_MINT_URL || (IS_LOCAL ? 'http://localhost:5173' : 'https://paiecashcoin.frostrek.com');
                      window.open(BUY_PCC_URL, '_blank');
                    }}>
                    Buy PCC →
                  </button>
                )}
              </div>

              {/* Enter Button */}
              <button
                onClick={entered || !canAfford ? undefined : handleEnter}
                disabled={entered || !canAfford}
                style={{
                  marginTop: 16, width: '100%', padding: 16,
                  borderRadius: 'var(--radius-md)', border: 'none',
                  fontSize: '1rem', fontWeight: 700,
                  cursor: entered || !canAfford ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  background: entered ? 'var(--bg-glass)' : canAfford ? game.accentColor : 'var(--bg-glass)',
                  color: entered ? 'var(--text-dim)' : canAfford ? '#fff' : 'var(--text-muted)',
                  boxShadow: canAfford && !entered ? `0 4px 20px ${game.accentColor}66` : 'none',
                }}
              >
                {entered ? '⏳ Entering game...' : canAfford ? `▶ Enter & Play - ${game.entryFee} PCC` : 'Insufficient PCC Balance'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Entry fee is deducted from your PCC wallet. Winnings are credited instantly.
              </p>
            </>
          )}

          {/* ─── COMING SOON: Non-playable games ─── */}
          {game.playable === false && (
            <>
              {/* Coming Soon Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${game.accentColor}1a, rgba(0,0,0,0))`,
                border: `1px solid ${game.accentColor}33`,
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                textAlign: 'center',
                marginTop: 20,
              }}>
                <div style={{ fontSize: '2.5rem' }}>🚧</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>
                  Coming Soon
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  This game is currently in development. Join the waitlist to get early access
                  and a 10 PCC bonus when it launches!
                </p>
              </div>

              {/* Waitlist Form */}
              {!joined ? (
                <div style={{ marginTop: 16 }}>
                  <input
                    type="email"
                    placeholder="Enter your email for early access"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                      padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleJoinWaitlist}
                    style={{
                      width: '100%', marginTop: 8, padding: 12,
                      background: `linear-gradient(135deg, ${game.accentColor}, var(--secondary))`,
                      color: '#fff', fontWeight: 700, border: 'none',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    🔔 Notify Me + 10 PCC Bonus
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(0,230,118,0.08)',
                  border: '1px solid rgba(0,230,118,0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20, textAlign: 'center', marginTop: 16,
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                    ✅ You&apos;re on the waitlist!
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 6 }}>
                    We&apos;ll email you when {game.title} launches with your 10 PCC bonus.
                  </div>
                </div>
              )}

              {/* Share Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join me on PaieCash Market - ${game.title} is coming soon! 🎮&url=${window.location.href}`, '_blank')}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem',
                    color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 600,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  𝕏 Share
                </button>
                <button onClick={handleCopyLink}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem',
                    color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 600,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  📋 Copy Link
                </button>
                <button onClick={() => window.open(`https://wa.me/?text=Join me on PaieCash Market - ${game.title} launching soon! ${window.location.href}`, '_blank')}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem',
                    color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 600,
                    background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)',
                  }}>
                  📲 WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
