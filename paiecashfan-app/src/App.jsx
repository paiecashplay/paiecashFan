import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Boutique } from './pages/Boutique';
import { Tombola } from './pages/Tombola';
import { FanClub } from './pages/FanClub';
import { FederationDetail } from './pages/FederationDetail';
import { ClubDetail } from './pages/ClubDetail';

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col bg-ink-900 text-bone-100">
      <div className="noise-overlay" aria-hidden />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/tombola" element={<Tombola />} />
          <Route path="/fan-club" element={<FanClub />} />
          <Route path="/federations/:fedId" element={<FederationDetail />} />
          <Route path="/clubs/:slug" element={<ClubDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
