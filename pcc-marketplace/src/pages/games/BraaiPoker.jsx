import { useState } from 'react';
import api from '../../api';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../components/Toast';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = Object.fromEntries(RANKS.map((r, i) => [r, i + 2]));

function randomCard() {
  return {
    rank: RANKS[Math.floor(Math.random() * 13)],
    suit: SUITS[Math.floor(Math.random() * 4)]
  };
}

function CardDisplay({ card, hidden }) {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  return (
    <div style={{
      width: '80px', height: '110px',
      background: hidden ? 'linear-gradient(135deg, #1e3a5f, #0f172a)' : '#fff',
      borderRadius: '10px', border: '2px solid #374151',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: hidden ? '32px' : '22px',
      color: hidden ? '#60a5fa' : (isRed ? '#dc2626' : '#111'),
      fontWeight: '800', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      flexDirection: 'column', gap: '2px',
      transition: 'all 0.3s'
    }}>
      {hidden ? '🂠' : card ? (
        <>
          <span style={{ fontSize: '14px', alignSelf: 'flex-start', marginLeft: '6px', marginTop: '4px' }}>{card.rank}</span>
          <span style={{ fontSize: '28px' }}>{card.suit}</span>
        </>
      ) : null}
    </div>
  );
}

export default function BraaiPoker() {
  const toast = useToast();
  const [betAmount, setBetAmount] = useState(10);
  const [playerCard, setPlayerCard] = useState(null);
  const [dealerCard, setDealerCard] = useState(null);
  const [showDealer, setShowDealer] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const { balance, refreshBalance } = useWallet();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  const dealCards = async () => {
    if (!user?.id) { toast.error('Please login to play'); return; }
    if (betAmount <= 0) return;
    if (balance !== null && betAmount > balance) { toast.warning('Insufficient PCC balance'); return; }

    setPlaying(true);
    setResult(null);
    setShowDealer(false);

    const pCard = randomCard();
    const dCard = randomCard();
    setPlayerCard(pCard);
    setDealerCard(dCard);

    await new Promise(r => setTimeout(r, 800));
    setShowDealer(true);
    await new Promise(r => setTimeout(r, 400));

    const pVal = RANK_VALUES[pCard.rank];
    const dVal = RANK_VALUES[dCard.rank];

    let outcome, payout;
    if (pVal > dVal) {
      outcome = 'win';
      payout = +(betAmount * 1.9).toFixed(2);
    } else if (pVal === dVal) {
      outcome = 'refund';
      payout = betAmount;
    } else {
      outcome = 'loss';
      payout = 0;
    }

    const apiResult = outcome === 'loss' ? 'loss' : 'win';
    const pnl = outcome === 'win' ? +(payout - betAmount).toFixed(2)
      : outcome === 'refund' ? 0 : -betAmount;

    setResult({ outcome, payout, pnl, pCard, dCard });

    try {
      await api.recordGameSession({
        userId: user.id,
        gameId: 'braai_poker',
        betAmount: parseFloat(betAmount),
        result: apiResult,
        payout,
        gameData: { playerCard: pCard, dealerCard: dCard, outcome }
      });
      await refreshBalance();
    } catch (err) {
      console.error('Session failed:', err.message);
    }

    setPlaying(false);
  };

  const resultConfig = {
    win: { color: '#22c55e', bg: '#064e3b', border: '#059669', emoji: '🥩', text: 'BRAAI WIN!' },
    loss: { color: '#ef4444', bg: '#450a0a', border: '#dc2626', emoji: '💀', text: 'DEALER WINS' },
    refund: { color: '#f5a623', bg: '#431407', border: '#d97706', emoji: '🤝', text: 'TIE - REFUND' }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', padding: '24px', color: '#fff' }}>
      <div style={{
        background: 'linear-gradient(135deg, #431407, #7c2d12)',
        borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔥</div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>Braai Poker</h1>
        <p style={{ margin: '8px 0 0', color: '#fed7aa', fontSize: '14px' }}>
          High card wins the braai. Dealer gets the coals. - South Africa Edition
        </p>
        <div style={{ marginTop: '12px', color: '#fbbf24', fontWeight: '700' }}>
          Balance: {balance === null ? '...' : `${balance.toFixed(2)} PCC`}
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Card Table */}
        <div style={{
          background: '#14532d', borderRadius: '20px',
          padding: '32px', marginBottom: '24px', textAlign: 'center',
          border: '3px solid #166534'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>YOU</p>
              <CardDisplay card={playerCard} hidden={false} />
              {playerCard && (
                <p style={{ color: '#fff', marginTop: '8px', fontWeight: '700' }}>
                  {playerCard.rank}{playerCard.suit}
                </p>
              )}
            </div>
            <div style={{ fontSize: '32px', color: '#fbbf24' }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>DEALER</p>
              <CardDisplay card={dealerCard} hidden={!showDealer} />
              {showDealer && dealerCard && (
                <p style={{ color: '#fff', marginTop: '8px', fontWeight: '700' }}>
                  {dealerCard.rank}{dealerCard.suit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            background: resultConfig[result.outcome].bg,
            border: `2px solid ${resultConfig[result.outcome].border}`,
            borderRadius: '16px', padding: '20px', marginBottom: '20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px' }}>{resultConfig[result.outcome].emoji}</div>
            <h2 style={{ color: resultConfig[result.outcome].color, margin: '8px 0' }}>
              {resultConfig[result.outcome].text}
            </h2>
            <p style={{ color: '#d1d5db', margin: 0 }}>
              {result.outcome === 'win' && `Won ${result.payout} PCC (+${result.pnl} PCC)`}
              {result.outcome === 'loss' && `Lost ${betAmount} PCC`}
              {result.outcome === 'refund' && `Tie - ${betAmount} PCC refunded`}
            </p>
          </div>
        )}

        {/* Bet Controls */}
        <div style={{
          background: '#1a1a2e', border: '1px solid #374151',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <label style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '600' }}>BET (PCC)</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input type="number" value={betAmount} min="1"
              onChange={e => setBetAmount(Number(e.target.value))}
              style={{
                flex: 1, minWidth: '70px', padding: '10px',
                background: '#0f172a', border: '1px solid #374151',
                borderRadius: '8px', color: '#fff', fontSize: '16px'
              }}
            />
            {[2, 5, 10, 25].map(v => (
              <button key={v} onClick={() => setBetAmount(v)} style={{
                padding: '10px 12px',
                background: betAmount === v ? '#f5a623' : '#374151',
                color: betAmount === v ? '#000' : '#fff',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '700'
              }}>{v}</button>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '12px' }}>
            Win pays <strong style={{ color: '#22c55e' }}>1.9x</strong> · Tie = refund · House edge: 5%
          </p>
        </div>

        <button onClick={dealCards}
          disabled={playing || (balance !== null && betAmount > balance)}
          style={{
            width: '100%', padding: '16px',
            background: playing ? '#374151' :
              (balance !== null && betAmount > balance) ? '#374151' : '#dc2626',
            color: playing ? '#6b7280' :
              (balance !== null && betAmount > balance) ? '#9ca3af' : '#fff',
            border: 'none', borderRadius: '12px',
            fontWeight: '800', fontSize: '18px', cursor: 'pointer'
          }}>
          {playing ? '🃏 Dealing...' :
            (balance !== null && betAmount > balance) ? '⚠ Insufficient PCC' :
              `🔥 DEAL CARDS - ${betAmount} PCC`}
        </button>
      </div>
    </div>
  );
}
