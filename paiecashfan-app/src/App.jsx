import { Routes, Route} from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollTopButton } from './components/ScrollTopButton';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Boutique } from './pages/Boutique';
import { Tombola } from './pages/Tombola';
import { FanClub } from './pages/FanClub';
import { FederationDetail } from './pages/FederationDetail';
import { ClubDetail } from './pages/ClubDetail';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminClubs } from './pages/admin/AdminClubs';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminClubEdit } from './pages/admin/AdminClubEdit';
import { AdminFederations } from './pages/admin/AdminFederations';
import { AdminFederationEdit } from './pages/admin/AdminFederationEdit';
import { Billetterie } from './pages/Billetterie';
import { ClubBilletterie } from './pages/ClubBilletterie';

export default function App() {
  return (
    <AuthProvider>
      {/* Remonte en haut à chaque navigation (clic sur une card, etc.) */}
      <ScrollToTop />
      {/* Routes admin : pas de Navbar/Footer public */}
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                      element={<AdminOverview />} />
          <Route path="users"               element={<AdminUsers />} />
          <Route path="federations"         element={<AdminFederations />} />
          <Route path="federations/:id/edit" element={<AdminFederationEdit />} />
          <Route path="clubs"               element={<AdminClubs />} />
          <Route path="clubs/new"           element={<AdminClubEdit />} />
          <Route path="clubs/:id/edit"      element={<AdminClubEdit />} />
          <Route path="products"            element={<AdminProducts />} />
          <Route path="settings"            element={<AdminSettings />} />
        </Route>

        {/* Routes publiques : avec Navbar/Footer */}
        <Route
          path="/*"
          element={
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
                  <Route path="/clubs/:slug/billetterie" element={<ClubBilletterie />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/mon-compte"
                    element={
                      <ProtectedRoute>
                        <div className="p-8 text-center text-bone-400">Mon compte — bientôt disponible</div>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Home />} />
                  <Route path="/billetterie" element={<Billetterie />} />
                </Routes>
              </main>
              <Footer />
              <ScrollTopButton />
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
