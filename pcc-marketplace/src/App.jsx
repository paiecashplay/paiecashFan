import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import api from './api';
import { WalletProvider } from './context/WalletContext';
import { useWallet } from './context/WalletContext';
import Home from './pages/Home';
import Clubs from './pages/Clubs';
import ClubStore from './pages/ClubStore';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import Gaming from './pages/Gaming';
import Rewards from './pages/Rewards';
import Leaderboards from './pages/Leaderboards';
import Login from './pages/Login';
import ClubOnboarding from './pages/ClubOnboarding';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import GameLobby from './pages/GameLobby';
import GamePlay from './pages/GamePlay';
import GameLeaderboard from './pages/GameLeaderboard';
import MyGames from './pages/MyGames';
import Contests from './pages/Contests';
import GameHistory from './pages/GameHistory';
import ProtectedRoute from './components/ProtectedRoute';
import CricketBash from './pages/games/CricketBash';
import BraaiPoker from './pages/games/BraaiPoker';
import LotoGame from './pages/games/loto/LotoGame';
import LotteryGame from './pages/games/lottery/LotteryGame';
import Leaderboard from './pages/Leaderboard';
import ContestAdmin from './pages/admin/ContestAdmin';
import CartDrawer from './components/CartDrawer';
import { useCart } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import ChatPage from './pages/ChatPage';
import UsersPage from './pages/UsersPage';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import { ChatProvider } from './context/ChatContext';
import Chatbot from './components/Chatbot';
import { MatchDiscussionProvider } from './context/MatchDiscussionContext';
import ChallengeLobby from './pages/ChallengeLobby';
import ChallengePlay from './pages/ChallengePlay';
import { ChallengeSessionProvider } from './context/ChallengeSessionContext';
import ProfilePage from './pages/ProfilePage';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();

  // Live wallet balance from WalletContext
  const { balance: liveBalance, refreshBalance } = useWallet();
  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BUY_PCC_URL = import.meta.env.VITE_MINT_URL || (IS_LOCAL ? 'http://localhost:5173' : 'https://paiecashcoin.frostrek.com');

  // Helper component for displaying live balance
  const LiveBalance = () => {
    if (liveBalance === null) return <span className="notranslate">{wallet?.balance?.toLocaleString() ?? 0}</span>;
    return <span className="notranslate">{liveBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>;
  };

  useEffect(() => { 
    setProfileOpen(false); 
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('pcc_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Support both old format { user, wallet } and new format { id, email, token, ... }
        if (parsed.user) {
          setUser(parsed.user); setWallet(parsed.wallet);
        } else if (parsed.id) {
          setUser(parsed);
          if (parsed.wallet) {
            setWallet(parsed.wallet);
          } else {
            // Support legacy flattened format
            setWallet({
              id: parsed.walletId,
              circle_wallet_id: parsed.walletId,
              wallet_address: parsed.walletAddress,
              balance: parsed.balance || 0
            });
          }
        }
      } catch { }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email) => {
    const data = await api.login(email);
    const stored = {
      ...data.user,
      wallet: data.wallet,
      token: data.token
    };
    setUser(data.user); setWallet(data.wallet);
    localStorage.setItem('pcc_user', JSON.stringify(stored));
    refreshBalance();
    return data;
  }, [refreshBalance]);

  const register = useCallback(async (name, email, sport, team) => {
    const data = await api.register(name, email, sport, team);
    const stored = {
      ...data.user,
      wallet: data.wallet,
      token: data.token
    };
    setUser(data.user); setWallet(data.wallet);
    localStorage.setItem('pcc_user', JSON.stringify(stored));
    refreshBalance();
    return data;
  }, [refreshBalance]);

  const logout = useCallback(() => {
    setUser(null); setWallet(null);
    localStorage.removeItem('pcc_user');
  }, []);

  const updateProfile = useCallback(async (sport, team) => {
    if (!user) return;
    const res = await api.updateProfile(user.id, sport, team);
    const updatedUser = { ...user, country: res.country };
    setUser(updatedUser);
    const stored = JSON.parse(localStorage.getItem('pcc_user') || '{}');
    localStorage.setItem('pcc_user', JSON.stringify({ ...stored, ...updatedUser }));
  }, [user]);

  const refreshWallet = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getBalance(user.id);
      setWallet(prev => ({ ...prev, ...data }));
    } catch { }
  }, [user]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;

  const auth = { user, wallet, login, register, logout, updateProfile, refreshWallet };

  return (
    <AuthContext.Provider value={auth}>
        <ChatProvider>
          <Navbar
          user={user}
          liveBalance={liveBalance}
          cartCount={cartCount}
          onCartOpen={() => setIsCartOpen(true)}
          onLogout={logout}
          buyPccUrl={BUY_PCC_URL}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
        />

        <div className="app-container" style={{ paddingTop: 64 }}>
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:slugOrId" element={<ClubStore />} />

            <Route path="/clubs/:slugOrId/product/:productId" element={<ProductPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/gaming/lobby/:id" element={<GameLobby />} />
            <Route path="/gaming/play/:id" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
            <Route path="/gaming/leaderboard/:id" element={<GameLeaderboard />} />
            <Route path="/games/cricket" element={<ProtectedRoute><CricketBash /></ProtectedRoute>} />
            <Route path="/games/braai-poker" element={<ProtectedRoute><BraaiPoker /></ProtectedRoute>} />
            <Route path="/games/loto" element={<LotoGame />} />
            <Route path="/games/lottery649" element={<ProtectedRoute><LotteryGame /></ProtectedRoute>} />
            <Route path="/my-games" element={<ProtectedRoute><MyGames /></ProtectedRoute>} />
            <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
            <Route path="/rewards" element={<MatchDiscussionProvider><Rewards /></MatchDiscussionProvider>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/admin/contests" element={<ProtectedRoute><ContestAdmin /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/clubs/onboarding" element={<ClubOnboarding />} />
            <Route path="/merchant/login" element={<MerchantLogin />} />
            <Route path="/merchant/dashboard" element={<ProtectedRoute><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/challenge-lobby/:sessionId" element={<ProtectedRoute><ChallengeSessionProvider><ChallengeLobby /></ChallengeSessionProvider></ProtectedRoute>} />
            <Route path="/challenge-play/:sessionId" element={<ProtectedRoute><ChallengeSessionProvider><ChallengePlay /></ChallengeSessionProvider></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/feed/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </div>
        {(location.pathname === '/clubs' || location.pathname.match(/^\/clubs\/[^\/]+$/)) && location.pathname !== '/clubs/onboarding' && (
          <Chatbot />
        )}
        </ChatProvider>
      </AuthContext.Provider>
  );
}
