import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, Clock, CircleDollarSign, X, ShieldCheck, ArrowLeft, Activity, Flame, Users, Calendar, TrendingUp, History, Star, Filter, Search, ChevronRight, PlayCircle, BarChart3, Swords, ChevronDown, ChevronUp, Receipt, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import { useMatchDiscussion } from '../context/MatchDiscussionContext';
import FloatingMatchChat from '../components/FloatingMatchChat';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../App';
import api from '../api';

const FALLBACK_LOGO = 'https://www.thesportsdb.com/images/media/team/badge/small/utvrtx1421439244.png';

const DEMO_SPORTS_SIDEBAR = [
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'fantasy11', name: 'Fantasy 11', icon: '🏆' },
  { id: 'casino', name: 'Casino', icon: '🎰' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'esports', name: 'E-Sports', icon: '🎮' },
  { id: 'racing', name: 'Horse Racing', icon: '🏇' },
  { id: 'kabaddi', name: 'Kabaddi', icon: '🤼' }
];

const MOCK_USERS = ['@cryptoKing', '@alex99', '@satoshi_fan', '@betPro22', '@winner_circle', '@pcc_whale', '@luckyStrike', '@sportsGuru', '@john_doe_88', '@proBettor'];

function getRandomParticipants(count) {
  const shuffled = [...MOCK_USERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(u => ({
    username: u,
    amount: (Math.floor(Math.random() * 50) + 5) * 100, // 500 to 5000
    isA: Math.random() > 0.5,
    time: Math.floor(Math.random() * 59) + 1 + 'm ago'
  })).sort((a,b) => parseInt(a.time) - parseInt(b.time));
}

const DEMO_MATCHES = [
  // === CRICKET ===
  {
    id: 'm1', sport: 'cricket', league: 'IPL 2026', status: 'live', time: 'Live (16.2)',
    home_team: 'Chennai Super Kings', away_team: 'Mumbai Indians',
    home_score: '154/4', away_score: 'Yet to bat',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/120px-Chennai_Super_Kings_Logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/120px-Mumbai_Indians_Logo.svg.png',
    invested_pcc: 452000, players_count: 1420
  },
  {
    id: 'm2', sport: 'cricket', league: 'T20 World Cup', status: 'upcoming', time: 'Today, 07:30 PM',
    home_team: 'India', away_team: 'Australia',
    home_score: '', away_score: '',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/120px-Flag_of_India.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Flag_of_Australia.svg/120px-Flag_of_Australia.svg.png',
    invested_pcc: 1250000, players_count: 4500
  },
  {
    id: 'm3', sport: 'cricket', league: 'BBL', status: 'upcoming', time: 'Tomorrow, 02:00 PM',
    home_team: 'Perth Scorchers', away_team: 'Sydney Sixers',
    invested_pcc: 1250000, players_count: 5400
  },
  {
    id: 'm2b', sport: 'cricket', league: 'BBL', status: 'live', time: '8.4 Overs',
    home_team: 'Scorchers', away_team: 'Sixers',
    home_score: '74/2', away_score: '165/6',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Perth_Scorchers_Logo.svg/120px-Perth_Scorchers_Logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Sydney_Sixers_Logo.svg/120px-Sydney_Sixers_Logo.svg.png',
    invested_pcc: 450000, players_count: 1200
  },
  {
    id: 'm3b', sport: 'cricket', league: 'The Ashes', status: 'live', time: 'Day 2, S1',
    home_team: 'Australia', away_team: 'England',
    home_score: '210/4', away_score: '315',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Cricket_Australia_logo.svg/120px-Cricket_Australia_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/England_and_Wales_Cricket_Board.svg/120px-England_and_Wales_Cricket_Board.svg.png',
    invested_pcc: 2100000, players_count: 8500
  },
  
  // === FOOTBALL ===
  {
    id: 'm4', sport: 'football', league: 'Champions League', status: 'live', time: '65\'',
    home_team: 'Real Madrid', away_team: 'Man City',
    home_score: '2', away_score: '1',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/120px-Real_Madrid_CF.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/120px-Manchester_City_FC_badge.svg.png',
    invested_pcc: 890000, players_count: 3200
  },
  {
    id: 'm5', sport: 'football', league: 'Premier League', status: 'live', time: '12\'',
    home_team: 'Arsenal', away_team: 'Chelsea',
    home_score: '1', away_score: '0',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/120px-Arsenal_FC.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/120px-Chelsea_FC.svg.png',
    invested_pcc: 670000, players_count: 2100
  },
  {
    id: 'm5b', sport: 'football', league: 'Serie A', status: 'live', time: '45\'',
    home_team: 'Juventus', away_team: 'AC Milan',
    home_score: '0', away_score: '0',
    home_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/120px-Juventus_FC_2017_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/120px-Logo_of_AC_Milan.svg.png',
    invested_pcc: 540000, players_count: 1750
  },
  {
    id: 'm6', sport: 'football', league: 'La Liga', status: 'live', time: '88\'',
    home_team: 'Barcelona', away_team: 'Sevilla',
    home_score: '3', away_score: '1',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/120px-FC_Barcelona_%28crest%29.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/120px-Sevilla_FC_logo.svg.png',
    invested_pcc: 230000, players_count: 950
  },

  // === BASKETBALL ===
  {
    id: 'm7', sport: 'basketball', league: 'NBA Finals', status: 'live', time: 'Q4 02:30',
    home_team: 'Lakers', away_team: 'Celtics',
    home_score: '105', away_score: '102',
    home_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/120px-Los_Angeles_Lakers_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/120px-Boston_Celtics.svg.png',
    invested_pcc: 320000, players_count: 850
  },
  {
    id: 'm8', sport: 'basketball', league: 'NBA', status: 'live', time: 'Q3 04:12',
    home_team: 'Warriors', away_team: 'Bulls',
    home_score: '84', away_score: '78',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/120px-Golden_State_Warriors_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Chicago_Bulls_logo.svg/120px-Chicago_Bulls_logo.svg.png',
    invested_pcc: 210000, players_count: 1100
  },
  {
    id: 'm8b', sport: 'basketball', league: 'EuroLeague', status: 'live', time: 'Q1 08:45',
    home_team: 'Real Madrid Baloncesto', away_team: 'Olympiacos',
    home_score: '14', away_score: '10',
    home_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Real_Madrid_Baloncesto_logo.svg/120px-Real_Madrid_Baloncesto_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Olympiacos_BC_logo.svg/120px-Olympiacos_BC_logo.svg.png',
    invested_pcc: 75000, players_count: 420
  },

  // === TENNIS ===
  {
    id: 'm9', sport: 'tennis', league: 'Wimbledon', status: 'live', time: 'Set 2',
    home_team: 'Alcaraz', away_team: 'Djokovic',
    home_score: '1 (4)', away_score: '0 (3)',
    home_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/ATP_Cup_logo.svg/120px-ATP_Cup_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/ATP_Cup_logo.svg/120px-ATP_Cup_logo.svg.png',
    invested_pcc: 550000, players_count: 2400
  },
  {
    id: 'm10', sport: 'tennis', league: 'US Open', status: 'live', time: 'Set 1',
    home_team: 'Sinner', away_team: 'Medvedev',
    home_score: '0 (5)', away_score: '0 (4)',
    home_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/ATP_Cup_logo.svg/120px-ATP_Cup_logo.svg.png',
    away_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/ATP_Cup_logo.svg/120px-ATP_Cup_logo.svg.png',
    invested_pcc: 190000, players_count: 850
  }
];

const SPORT_CONTEST_TEMPLATES = {
  cricket: [
    { id: 'c1', type: 'Match Winner', optionA: 'Home', optionB: 'Away', baseOddsA: 1.85, baseOddsB: 2.05 },
    { id: 'c2', type: 'Total Match Runs (Over/Under)', optionA: 'Over 325.5', optionB: 'Under 325.5', baseOddsA: 1.90, baseOddsB: 1.90 },
    { id: 'c3', type: 'Highest Opening Partnership', optionA: 'Home', optionB: 'Away', baseOddsA: 1.80, baseOddsB: 2.10 },
    { id: 'c4', type: 'Will there be a Super Over?', optionA: 'Yes', optionB: 'No', baseOddsA: 15.00, baseOddsB: 1.05 }
  ],
  football: [
    { id: 'f1', type: 'Match Winner', optionA: 'Home', optionB: 'Away', baseOddsA: 1.95, baseOddsB: 3.20 },
    { id: 'f2', type: 'Total Goals (Over/Under)', optionA: 'Over 2.5', optionB: 'Under 2.5', baseOddsA: 1.85, baseOddsB: 1.95 },
    { id: 'f3', type: 'Both Teams to Score', optionA: 'Yes', optionB: 'No', baseOddsA: 1.75, baseOddsB: 2.15 },
    { id: 'f4', type: 'First Team to Score', optionA: 'Home', optionB: 'Away', baseOddsA: 1.65, baseOddsB: 2.45 }
  ],
  basketball: [
    { id: 'b1', type: 'Match Winner', optionA: 'Home', optionB: 'Away', baseOddsA: 1.75, baseOddsB: 2.25 },
    { id: 'b2', type: 'Total Points (Over/Under)', optionA: 'Over 218.5', optionB: 'Under 218.5', baseOddsA: 1.90, baseOddsB: 1.90 },
    { id: 'b3', type: 'First to 20 Points', optionA: 'Home', optionB: 'Away', baseOddsA: 1.80, baseOddsB: 2.05 },
    { id: 'b4', type: 'Will the game go to Overtime?', optionA: 'Yes', optionB: 'No', baseOddsA: 12.50, baseOddsB: 1.08 }
  ],
  tennis: [
    { id: 't1', type: 'Match Winner', optionA: 'Home', optionB: 'Away', baseOddsA: 1.60, baseOddsB: 2.50 },
    { id: 't2', type: 'Total Sets (Over/Under)', optionA: 'Over 3.5', optionB: 'Under 3.5', baseOddsA: 1.85, baseOddsB: 1.95 },
    { id: 't3', type: 'First Set Winner', optionA: 'Home', optionB: 'Away', baseOddsA: 1.65, baseOddsB: 2.30 },
    { id: 't4', type: 'Will there be a Tie-break?', optionA: 'Yes', optionB: 'No', baseOddsA: 2.10, baseOddsB: 1.75 }
  ]
};

export default function Rewards() {
  const { showToast } = useToast();
  const { toggleRoom, activeRooms, rooms } = useMatchDiscussion();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { balance, refreshBalance } = useWallet();
  const { user } = useAuth();
  
  // Persisted view states from URL
  const view = searchParams.get('view') || 'sports';
  const matchId = searchParams.get('matchId');
  const activeSportParam = searchParams.get('sport') || 'cricket';
  
  const [activeSport, setActiveSport] = useState(activeSportParam);
  const [activeFilter, setActiveFilter] = useState('all'); // all, live, upcoming
  const [selectedGame, setSelectedGame] = useState(() => {
    if (view === 'detail' && matchId) {
      return DEMO_MATCHES.find(m => m.id === matchId) || null;
    }
    return null;
  });
  
  // Sync view helper
  const setRewardsView = (newView, params = {}) => {
    const newParams = { view: newView, sport: activeSport, ...params };
    setSearchParams(newParams);
  };

  const [slip, setSlip] = useState(null);
  const [slipOpen, setSlipOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('100');
  const [gameContests, setGameContests] = useState([]);
  
  // My Bets History
  const [myBets, setMyBets] = useState(() => {
    try {
      const saved = localStorage.getItem('pcc_demo_my_bets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved bets", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('pcc_demo_my_bets', JSON.stringify(myBets));
  }, [myBets]);

  const mainRef = useRef(null);

  // Sync selected game if URL changes
  useEffect(() => {
    const v = searchParams.get('view') || 'sports';
    const mId = searchParams.get('matchId');
    const s = searchParams.get('sport') || 'cricket';
    
    if (v === 'detail' && mId) {
      const match = DEMO_MATCHES.find(m => m.id === mId);
      if (match) {
        setSelectedGame(match);
        // Regenerate contests if needed
        const templates = SPORT_CONTEST_TEMPLATES[match.sport] || SPORT_CONTEST_TEMPLATES['football'];
        setGameContests(templates.map(t => ({
          ...t,
          poolA: Math.floor(Math.random() * 80000) + 5000,
          poolB: Math.floor(Math.random() * 80000) + 5000,
          players: Math.floor(Math.random() * 2000) + 100,
          oddsA: t.baseOddsA, oddsB: t.baseOddsB,
          recentParticipants: getRandomParticipants(4)
        })));
      }
    } else {
      setSelectedGame(null);
    }
    if (s) setActiveSport(s);
  }, [searchParams]);

  // Apply filters
  const filteredMatches = DEMO_MATCHES.filter(m => {
    if (m.sport !== activeSport) return false;
    if (activeFilter === 'live' && m.status !== 'live') return false;
    if (activeFilter === 'upcoming' && m.status !== 'upcoming') return false;
    return true;
  });

  const openMatch = (game) => {
    setRewardsView('detail', { matchId: game.id, sport: game.sport });
  };

  const selectOption = (contest, optionType, odds) => {
    const label = optionType === 'A' 
      ? (contest.optionA === 'Home' ? selectedGame.home_team : contest.optionA)
      : (contest.optionB === 'Away' ? selectedGame.away_team : contest.optionB);

    setSlip({ 
      game: selectedGame, 
      contest, 
      optionLabel: label, 
      isA: optionType === 'A',
      odds 
    });
    setSlipOpen(true);
  };

  const placeBet = async () => {
    if (!slip) return;
    if (parseFloat(stakeAmount) > balance) return showToast({ message: 'Insufficient PCC Balance', type: 'error' });
    
    try {
      // If user is logged in, attempt real API call
      if (user) {
        await api.joinRewardPool(slip.game.id, user.id, slip.isA ? 'A' : 'B', parseFloat(stakeAmount));
      }

      // Add to My Bets history locally
      const newBet = {
        id: Math.random().toString(36).substr(2, 9),
        game: slip.game,
        contest: slip.contest,
        optionLabel: slip.optionLabel,
        stake: parseFloat(stakeAmount),
        odds: slip.odds,
        potentialWin: (parseFloat(stakeAmount) * slip.odds).toFixed(2),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: 'Active'
      };
      setMyBets(prev => [newBet, ...prev]);

      showToast({ message: `Contest Joined Successfully! You invested ${stakeAmount} PCC.`, type: 'success' });
      
      // Refresh real balance if wallet connected
      if (refreshBalance) refreshBalance();
      
      // Add user to recent participants visually
      const updatedContests = gameContests.map(c => {
        if (c.id === slip.contest.id) {
          return {
            ...c,
            recentParticipants: [{username: user?.username || 'You', amount: stakeAmount, isA: slip.isA, time: 'just now'}, ...c.recentParticipants].slice(0, 4),
            poolA: slip.isA ? c.poolA + parseFloat(stakeAmount) : c.poolA,
            poolB: !slip.isA ? c.poolB + parseFloat(stakeAmount) : c.poolB,
          };
        }
        return c;
      });
      setGameContests(updatedContests);
      setSlip(null);
      setSlipOpen(false);
    } catch (err) {
      console.error('Failed to join pool:', err);
      showToast({ message: 'Failed to join reward pool. Please try again.', type: 'error' });
    }
  };

  return (
    <div style={{maxWidth:'100%',background:'var(--color-bg)',minHeight:'100vh',color:'#f8fafc',fontFamily:"'Rajdhani', sans-serif", display:'flex', flexDirection:'column'}}>
      {/* Background Decorations */}
      <div style={{position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(circle at 20% 30%, rgba(0,230,118,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,230,118,0.02) 0%, transparent 50%)'}}/>


      {/* Main Layout */}
      <div style={{display:'flex', flex:1, position:'relative', zIndex:1, overflow:'hidden', height:'100vh'}}>
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside style={{width:260, background:'transparent', borderRight:'1px solid rgba(0,230,118,0.15)', overflowY:'auto'}}>
          <div style={{padding:'20px 16px'}}>
            <div style={{fontSize:'0.75rem', fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:16, paddingLeft:12}}>Sports & Categories</div>
            
            <div style={{display:'flex', flexDirection:'column', gap:4}}>
              {DEMO_SPORTS_SIDEBAR.map(sport => (
                <button key={sport.id} onClick={() => { setRewardsView('sports', { sport: sport.id }); setActiveFilter('all'); }}
                  style={{
                    background: activeSport === sport.id && view !== 'myBets' ? '#00e676' : 'transparent',
                    color: activeSport === sport.id && view !== 'myBets' ? '#000' : 'rgba(255,255,255,0.8)',
                    border:'none', padding:'12px 16px', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
                    fontWeight:800, fontSize:'1rem', transition:'all 0.2s', textAlign:'left'
                  }}
                  onMouseEnter={e=>{if(!(activeSport === sport.id && view !== 'myBets')) e.currentTarget.style.background='rgba(255,255,255,0.05)'}}
                  onMouseLeave={e=>{if(!(activeSport === sport.id && view !== 'myBets')) e.currentTarget.style.background='transparent'}}
                >
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <span>{sport.icon}</span> {sport.name}
                  </div>
                  {activeSport !== sport.id && view !== 'myBets' && <ChevronRight size={16} color="rgba(255,255,255,0.2)"/>}
                </button>
              ))}
            </div>

            <div style={{fontSize:'0.75rem', fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, margin:'32px 0 16px', paddingLeft:12}}>Account</div>
            
            <button onClick={() => { setRewardsView('myBets'); }}
              style={{
                background: view === 'myBets' ? '#00e676' : 'transparent',
                color: view === 'myBets' ? '#000' : 'rgba(255,255,255,0.8)',
                border:'none', padding:'12px 16px', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
                fontWeight:800, fontSize:'1rem', transition:'all 0.2s', textAlign:'left', width:'100%'
              }}
              onMouseEnter={e=>{if(view !== 'myBets') e.currentTarget.style.background='rgba(255,255,255,0.05)'}}
              onMouseLeave={e=>{if(view !== 'myBets') e.currentTarget.style.background='transparent'}}
            >
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <span>🧾</span> My Rewards
              </div>
              <div style={{background: view === 'myBets' ? '#000' : '#00e676', color: view === 'myBets' ? '#00e676' : '#000', padding:'2px 8px', borderRadius:10, fontSize:'0.7rem', fontWeight:900}}>{myBets.length}</div>
            </button>

          </div>
        </aside>

        {/* MIDDLE COLUMN: Main Content Area */}
        <main ref={mainRef} style={{flex:1, overflowY:'auto', padding:'24px 32px', position:'relative'}}>
          
          {view === 'detail' && (
            <button onClick={() => setRewardsView('sports')} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(0,230,118,0.05)',border:'1px solid rgba(255,255,255,0.1)',padding:'10px 18px',borderRadius:12,color:'#fff',cursor:'pointer',marginBottom:24,fontSize:'0.9rem',fontWeight:700,transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(0,230,118,0.05)'}>
              <ArrowLeft size={18}/> Back to Matches
            </button>
          )}

          {/* VIEW: MY BETS */}
          {view === 'myBets' && (
            <div style={{maxWidth:900}}>
              <h2 style={{fontSize:'2.2rem', fontWeight:900, marginBottom:24, display:'flex', alignItems:'center', gap:12}}>
                <Receipt size={32} color="#00e676"/> My Rewards History
              </h2>

              {myBets.length === 0 ? (
                <div style={{padding:80, textAlign:'center', background:'transparent', borderRadius:24, border:'1px dashed rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
                  <div style={{fontSize:'1.2rem', fontWeight:800, marginBottom:8}}>No bets placed yet</div>
                  <div>You haven't invested in any contests. Head over to the sports tab to participate!</div>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:16}}>
                  {myBets.map(bet => (
                    <div key={bet.id} style={{background:'transparent', border:'1px solid rgba(0,230,118,0.15)', borderRadius:16, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.2s'}}
                         onMouseEnter={e=>e.currentTarget.style.borderColor='#00e676'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,230,118,0.15)'}>
                      
                      <div style={{display:'flex', gap:20, alignItems:'center'}}>
                        <div style={{background:'rgba(255,255,255,0.05)', width:60, height:60, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <img src={bet.game.home_logo} alt="" style={{width:24, height:24, position:'absolute', transform:'translate(-10px, -10px)', background:'#fff', borderRadius:'50%', padding:2}} />
                          <img src={bet.game.away_logo} alt="" style={{width:24, height:24, position:'absolute', transform:'translate(10px, 10px)', background:'#fff', borderRadius:'50%', padding:2}} />
                        </div>
                        <div>
                          <div style={{color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', fontWeight:700, marginBottom:4}}>{bet.game.league} • Placed today at {bet.time}</div>
                          <div style={{fontWeight:900, fontSize:'1.2rem'}}>{bet.game.home_team} vs {bet.game.away_team}</div>
                          <div style={{display:'flex', gap:12, marginTop:8, alignItems:'center'}}>
                            <div style={{background:'rgba(0,230,118,0.1)', color:'#00e676', padding:'4px 10px', borderRadius:8, fontSize:'0.8rem', fontWeight:800}}>{bet.contest.type}</div>
                            <div style={{fontWeight:800, fontSize:'0.9rem'}}>Selected: <span style={{color:'#fff'}}>{bet.optionLabel}</span> @ <span style={{color:'#00e676'}}>{bet.odds}x</span></div>
                          </div>
                        </div>
                      </div>

                      <div style={{textAlign:'right', paddingLeft:24, borderLeft:'1px solid rgba(255,255,255,0.1)'}}>
                        <div style={{color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', fontWeight:700, marginBottom:4}}>Stake / Potential Win</div>
                        <div style={{fontWeight:900, fontSize:'1.4rem'}}>{bet.stake} <span style={{color:'rgba(255,255,255,0.2)', fontSize:'1rem'}}>→</span> <span style={{color:'#00e676'}}>{bet.potentialWin} PCC</span></div>
                        <div style={{marginTop:8, background:'rgba(255,255,255,0.1)', display:'inline-block', padding:'4px 12px', borderRadius:8, fontSize:'0.75rem', fontWeight:800, color:'#fff'}}>{bet.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SPORTS DASHBOARD */}
          {view === 'sports' && (
            <>
              {/* Status Filter */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, background:'rgba(0,0,0,0.2)', padding:'12px 24px', borderRadius:16, border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <Filter size={18} color="#00e676"/>
                  <span style={{fontWeight:800, color:'rgba(255,255,255,0.6)', textTransform:'uppercase'}}>Filter Matches:</span>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={() => setActiveFilter('all')} style={{background: activeFilter==='all' ? 'rgba(0,230,118,0.1)' : 'transparent', color: activeFilter==='all' ? '#00e676' : '#fff', border: activeFilter==='all' ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent', padding:'6px 16px', borderRadius:8, fontWeight:700, cursor:'pointer'}}>All Matches</button>
                  <button onClick={() => setActiveFilter('live')} style={{background: activeFilter==='live' ? 'rgba(0,230,118,0.1)' : 'transparent', color: activeFilter==='live' ? '#00e676' : '#fff', border: activeFilter==='live' ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent', padding:'6px 16px', borderRadius:8, fontWeight:700, cursor:'pointer'}}>Live</button>
                  <button onClick={() => setActiveFilter('upcoming')} style={{background: activeFilter==='upcoming' ? 'rgba(0,230,118,0.1)' : 'transparent', color: activeFilter==='upcoming' ? '#00e676' : '#fff', border: activeFilter==='upcoming' ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent', padding:'6px 16px', borderRadius:8, fontWeight:700, cursor:'pointer'}}>Upcoming</button>
                </div>
              </div>

              {/* ALL CONTESTS GRID */}
              <div style={{marginBottom:48}}>
                {filteredMatches.length === 0 ? (
                  <div style={{padding:60, textAlign:'center', background:'transparent', borderRadius:24, border:'1px dashed rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
                    <div style={{fontSize:'1.2rem', fontWeight:800, marginBottom:8}}>No matches available</div>
                    <div>There are no {activeFilter !== 'all' ? activeFilter : ''} matches for {DEMO_SPORTS_SIDEBAR.find(s=>s.id===activeSport)?.name} at this time.</div>
                  </div>
                ) : (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20}}>
                    {filteredMatches.map(m => <MatchCard key={m.id} match={m} onOpen={() => openMatch(m)} />)}
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW: MATCH DETAIL CONTESTS */}
          {view === 'detail' && selectedGame && (
            <>
              {/* Scoreboard Header */}
              <div style={{background:'linear-gradient(135deg,transparent,var(--color-bg))',border:'1px solid rgba(0,230,118,0.15)',borderRadius:24,padding:32,marginBottom:32, position:'relative', overflow:'hidden'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32}}>
                  <div style={{color:'#00e676',fontWeight:900,fontSize:'0.9rem',textTransform:'uppercase',letterSpacing:2, display:'flex', alignItems:'center', gap:8}}>
                    <Trophy size={16}/> {selectedGame.league}
                  </div>
                  <div style={{background: selectedGame.status==='live'?'rgba(239, 68, 68, 0.1)':'rgba(255,255,255,0.05)', color: selectedGame.status==='live'?'#ef4444':'#fff', padding:'6px 16px', borderRadius:12, fontWeight:800, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:8}}>
                    {selectedGame.status==='live' && <span style={{width:8,height:8,background:'#ef4444',borderRadius:'50%',animation:'pulse 1.5s infinite'}}/>}
                    {selectedGame.time}
                  </div>
                </div>

                <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:40, position:'relative', zIndex:2}}>
                  <div style={{textAlign:'center', flex:1}}>
                    <img src={selectedGame.home_logo || FALLBACK_LOGO} alt="" style={{width:64,height:64,marginBottom:12, background:'#fff', borderRadius:16, padding:6}} />
                    <div style={{fontWeight:900,fontSize:'1.4rem', lineHeight:1.2}}>{selectedGame.home_team}</div>
                    <div style={{fontSize:'1.2rem', color:'#00e676', fontWeight:800, marginTop:8}}>{selectedGame.home_score}</div>
                  </div>
                  <div style={{flex:0.5, textAlign:'center'}}>
                    <div style={{fontSize:'1.8rem',fontWeight:900,color:'rgba(255,255,255,0.2)', fontStyle:'italic'}}>VS</div>
                  </div>
                  <div style={{textAlign:'center', flex:1}}>
                    <img src={selectedGame.away_logo || FALLBACK_LOGO} alt="" style={{width:64,height:64,marginBottom:12, background:'#fff', borderRadius:16, padding:6}} />
                    <div style={{fontWeight:900,fontSize:'1.4rem', lineHeight:1.2}}>{selectedGame.away_team}</div>
                    <div style={{fontSize:'1.2rem', color:'#00e676', fontWeight:800, marginTop:8}}>{selectedGame.away_score}</div>
                  </div>
                </div>
              </div>

              {/* Contests List Grid */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                <h3 style={{fontSize:'1.3rem', fontWeight:900}}>Main Markets</h3>
                <div style={{display:'flex', gap:16, alignItems: 'center'}}>
                  <span style={{display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', fontWeight:700}}><Users size={14}/> {selectedGame.players_count} Active</span>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))', gap:20, paddingBottom:80}}>
                {gameContests.map(contest => (
                  <div key={contest.id} style={{background:'transparent',border:'1px solid rgba(0,230,118,0.15)',borderRadius:20,padding:20, display:'flex', flexDirection:'column'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                      <div style={{fontWeight:900,fontSize:'1.1rem', display:'flex', alignItems:'center', gap:8}}><Flame size={16} color="#00e676"/> {contest.type}</div>
                      <div style={{background:'rgba(0,230,118,0.1)', padding:'4px 10px', borderRadius:6, fontSize:'0.75rem', fontWeight:800, color:'#00e676'}}>
                        POOL: {(contest.poolA + contest.poolB).toLocaleString()} PCC
                      </div>
                    </div>
                    
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12, marginBottom:16}}>
                      {/* Option A */}
                      <div onClick={() => selectOption(contest, 'A', contest.oddsA)}
                        style={{
                          background: slip?.contest.id===contest.id && slip?.isA ? '#00e676' : 'rgba(255,255,255,0.03)', 
                          color: slip?.contest.id===contest.id && slip?.isA ? '#000' : '#fff',
                          padding:'14px',borderRadius:12,cursor:'pointer',transition:'all 0.2s', border:'1px solid',
                          borderColor: slip?.contest.id===contest.id && slip?.isA ? '#00e676' : 'rgba(255,255,255,0.05)',
                          display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', overflow:'hidden'
                        }}
                        onMouseEnter={e=>{if(!(slip?.contest.id===contest.id && slip?.isA)) e.currentTarget.style.borderColor='#00e676'}}
                        onMouseLeave={e=>{if(!(slip?.contest.id===contest.id && slip?.isA)) e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}}>
                        <div style={{position:'relative', zIndex:2}}>
                          <div style={{fontSize:'0.95rem', fontWeight:800}}>{contest.optionA === 'Home' ? selectedGame.home_team : contest.optionA}</div>
                          <div style={{fontSize:'0.7rem', marginTop:4, opacity:0.8, fontWeight:700}}>{contest.poolA.toLocaleString()} PCC</div>
                        </div>
                        <div style={{fontWeight:900,fontSize:'1.2rem', position:'relative', zIndex:2}}>{contest.oddsA}x</div>
                        {slip?.contest.id===contest.id && slip?.isA && <div style={{position:'absolute', right:-10, bottom:-10, opacity:0.2}}><ShieldCheck size={48}/></div>}
                      </div>

                      {/* Option B */}
                      <div onClick={() => selectOption(contest, 'B', contest.oddsB)}
                        style={{
                          background: slip?.contest.id===contest.id && !slip?.isA ? '#00e676' : 'rgba(255,255,255,0.03)', 
                          color: slip?.contest.id===contest.id && !slip?.isA ? '#000' : '#fff',
                          padding:'14px',borderRadius:12,cursor:'pointer',transition:'all 0.2s', border:'1px solid',
                          borderColor: slip?.contest.id===contest.id && !slip?.isA ? '#00e676' : 'rgba(255,255,255,0.05)',
                          display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', overflow:'hidden'
                        }}
                        onMouseEnter={e=>{if(!(slip?.contest.id===contest.id && !slip?.isA)) e.currentTarget.style.borderColor='#00e676'}}
                        onMouseLeave={e=>{if(!(slip?.contest.id===contest.id && !slip?.isA)) e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}}>
                        <div style={{position:'relative', zIndex:2}}>
                          <div style={{fontSize:'0.95rem', fontWeight:800}}>{contest.optionB === 'Away' ? selectedGame.away_team : contest.optionB}</div>
                          <div style={{fontSize:'0.7rem', marginTop:4, opacity:0.8, fontWeight:700}}>{contest.poolB.toLocaleString()} PCC</div>
                        </div>
                        <div style={{fontWeight:900,fontSize:'1.2rem', position:'relative', zIndex:2}}>{contest.oddsB}x</div>
                        {slip?.contest.id===contest.id && !slip?.isA && <div style={{position:'absolute', right:-10, bottom:-10, opacity:0.2}}><ShieldCheck size={48}/></div>}
                      </div>
                    </div>

                    {/* LIVE PARTICIPANTS FEED */}
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:12, flex:1}}>
                      <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', fontWeight:800, textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
                        <History size={12}/> Live Activity
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:6}}>
                        {contest.recentParticipants.map((p, idx) => (
                          <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.02)', padding:'6px 10px', borderRadius:8}}>
                            <div style={{display:'flex', alignItems:'center', gap:8}}>
                              <div style={{width:20, height:20, borderRadius:'50%', background:'linear-gradient(135deg, #00e676, #059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontWeight:900, color:'#000'}}>
                                {p.username.substring(1,3).toUpperCase()}
                              </div>
                              <div>
                                <div style={{fontSize:'0.75rem', fontWeight:700, color: p.username==='You'?'#00e676':'#fff'}}>{p.username}</div>
                                <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', fontWeight:600}}>{p.time}</div>
                              </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:'0.75rem', fontWeight:800, color:'#00e676'}}>+{p.amount.toLocaleString()}</div>
                              <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.5)', fontWeight:700}}>on {p.isA ? (contest.optionA === 'Home' ? 'A' : 'A') : (contest.optionB === 'Away' ? 'B' : 'B')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>

      {/* FLOATING BETSLIP OVERLAY DRAWER */}
      {slip && (
        <div style={{
          position:'fixed', bottom:0, right:32, width:360, 
          background:'var(--color-bg)', border:'1px solid rgba(0,230,118,0.3)', 
          borderBottom:'none', borderRadius:'20px 20px 0 0', 
          boxShadow:'0 -10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,230,118,0.1)',
          transition:'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: slipOpen ? 'translateY(0)' : 'translateY(calc(100% - 56px))',
          zIndex:999, display:'flex', flexDirection:'column',
          maxHeight:'calc(100vh - 100px)'
        }}>
          
          {/* Header / Toggle Area */}
          <div onClick={() => setSlipOpen(!slipOpen)} 
               style={{padding:'16px 20px', background:'linear-gradient(90deg, rgba(0,230,118,0.1), transparent)', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', borderBottom: slipOpen ? '1px solid rgba(255,255,255,0.1)' : 'none'}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{background:'#00e676', width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900, fontSize:'0.8rem'}}>1</div>
              <span style={{fontWeight:900, fontSize:'1.1rem'}}>Rewards Slip</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              {!slipOpen && <span style={{fontWeight:800, color:'#00e676'}}>View Selection</span>}
              <button onClick={(e) => { e.stopPropagation(); setSlip(null); setSlipOpen(false); }} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', padding:6, borderRadius:8, display:'flex'}}><X size={14}/></button>
              {slipOpen ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
            </div>
          </div>

          {/* Expanded Content Area */}
          <div style={{padding:20, overflowY:'auto'}}>
            <div style={{display:'flex',alignItems:'center',gap:8, fontSize:'0.85rem', fontWeight:800, color:'#00e676', marginBottom:12}}><Swords size={16}/> SINGLE BET</div>
            
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:12,padding:16,marginBottom:20, border:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.6)',marginBottom:8, fontWeight:700}}>{slip.game.home_team} vs {slip.game.away_team}</div>
              <div style={{fontWeight:900,fontSize:'1.1rem',color:'#fff',marginBottom:4}}>{slip.optionLabel}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)', fontWeight:600}}>{slip.contest.type}</span>
                <span style={{fontWeight:900,fontSize:'1.3rem', color:'#00e676'}}>{slip.odds}x</span>
              </div>
            </div>
            
            <div style={{marginBottom:24}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <label style={{fontSize:'0.75rem',fontWeight:800, color:'rgba(255,255,255,0.6)', textTransform:'uppercase'}}>Stake (PCC)</label>
                <div style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:700}}>Balance: {balance.toLocaleString()}</div>
              </div>
              <div style={{position:'relative'}}>
                <input type="number" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)}
                  style={{width:'100%',background:'var(--color-bg)',border:'1px solid rgba(0,230,118,0.3)',borderRadius:8,padding:'12px 16px',color:'#fff',fontWeight:900,fontSize:'1.1rem',outline:'none',boxSizing:'border-box', textAlign:'right'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginTop:12}}>
                {['100','500','1k','5k'].map((v, idx) => {
                  const val = [100, 500, 1000, 5000][idx];
                  return (
                    <button key={v} onClick={() => setStakeAmount(val.toString())}
                      style={{background: stakeAmount===val.toString() ? '#00e676' : 'rgba(0,230,118,0.05)', color: stakeAmount===val.toString() ? '#000' : '#fff', border:'none',borderRadius:6,padding:'6px 0',fontSize:'0.75rem',fontWeight:800,cursor:'pointer', transition:'all 0.2s'}}>{v}</button>
                  )
                })}
              </div>
            </div>

            <div style={{background:'rgba(0,230,118,0.05)',borderRadius:12,padding:16,marginBottom:24,border:'1px dashed rgba(0,230,118,0.2)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem', fontWeight:600}}>Total Stake</span>
                <span style={{fontWeight:800, fontSize:'0.9rem'}}>{stakeAmount} PCC</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
                <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem', fontWeight:600}}>Potential Win</span>
                <span style={{fontWeight:900,color:'#00e676',fontSize:'1.3rem'}}>{(parseFloat(stakeAmount||0)*slip.odds).toFixed(2)} PCC</span>
              </div>
            </div>

            <button onClick={placeBet} 
              style={{width:'100%',background:'linear-gradient(135deg, #00e676, #059669)',color:'#000',border:'none',borderRadius:12,padding:'16px',fontWeight:900,fontSize:'1rem',cursor:'pointer',letterSpacing:1, boxShadow:'0 5px 20px rgba(0,230,118,0.3)', transition:'all 0.2s', display:'flex', justifyContent:'center', alignItems:'center', gap:8}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <Receipt size={18}/> JOIN POOL
            </button>
          </div>
        </div>
      )}

      {/* FLOATING COMMUNITY CHAT OVERLAYS */}
      {activeRooms.map((room, index) => (
        <FloatingMatchChat key={room.id} roomId={room.id} index={index} />
      ))}

      {/* Floating Chat Launcher Button (visible in detail view) */}
      {view === 'detail' && selectedGame && (
        <button
          onClick={() => {
            const dbRoom = rooms.find(r => r.match_id === selectedGame.id);
            if (dbRoom) toggleRoom(dbRoom.id);
            else showToast({ message: 'No live community chat available for this match yet.', type: 'info' });
          }}
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e676, #00b248)',
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,230,118,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,230,118,0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,230,118,0.4)';
          }}
        >
          <MessageSquare size={28} />
          {rooms.find(r => r.match_id === selectedGame.id) && (
            <span style={{
              position: 'absolute', top: 0, right: 0, width: 14, height: 14, 
              background: '#ef4444', border: '2px solid #060f0a', borderRadius: '50%'
            }} />
          )}
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 230, 118, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 230, 118, 0.4); }
      `}</style>
    </div>
  );
}

// Subcomponent: Match Card
function MatchCard({ match, onOpen }) {
  return (
    <div onClick={onOpen} 
      style={{background:'transparent',border:'1px solid rgba(0,230,118,0.15)',borderRadius:16,cursor:'pointer',overflow:'hidden',transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', display:'flex', flexDirection:'column'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#00e676'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 20px rgba(0,0,0,0.4), 0 0 10px rgba(0,230,118,0.1)'}} 
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,230,118,0.15)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'}}>
      
      <div style={{padding:'12px 16px',background:'rgba(0,230,118,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center', borderBottom:'1px solid rgba(0,230,118,0.15)'}}>
        <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.6)',fontWeight:800}}>{match.league}</div>
        <div style={{display:'flex', alignItems:'center', gap:6, background: match.status==='live'?'rgba(239, 68, 68, 0.1)':'rgba(255,255,255,0.05)', color: match.status==='live'?'#ef4444':'#fff', padding:'4px 8px', borderRadius:6, fontSize:'0.7rem', fontWeight:800}}>
          {match.status === 'live' && <span style={{width:6,height:6,background:'#ef4444',borderRadius:'50%',animation:'pulse 1.5s infinite'}}/>}
          {match.time}
        </div>
      </div>

      <div style={{padding:'20px 16px', flex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <img src={match.home_logo} alt="" style={{width:28, height:28, background:'#fff', borderRadius:8, padding:4}} />
            <span style={{fontWeight:800, fontSize:'1rem'}}>{match.home_team}</span>
          </div>
          <div style={{fontWeight:900, color:'#00e676', fontSize:'1rem'}}>{match.home_score}</div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <img src={match.away_logo} alt="" style={{width:28, height:28, background:'#fff', borderRadius:8, padding:4}} />
            <span style={{fontWeight:800, fontSize:'1rem'}}>{match.away_team}</span>
          </div>
          <div style={{fontWeight:900, color:'#00e676', fontSize:'1rem'}}>{match.away_score}</div>
        </div>
      </div>

      <div style={{padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:12, fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:700}}>
          <span style={{display:'flex', alignItems:'center', gap:4}}><Users size={12}/> {match.players_count}</span>
          <span style={{display:'flex', alignItems:'center', gap:4}}><CircleDollarSign size={12}/> {(match.invested_pcc/1000).toFixed(1)}k</span>
        </div>
        <div style={{color:'#00e676', fontWeight:800, fontSize:'0.75rem'}}>VIEW ODDS →</div>
      </div>
    </div>
  );
}
