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
import { ResetPassword } from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminClubs } from './pages/admin/AdminClubs';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminClubEdit } from './pages/admin/AdminClubEdit';
import { AdminFederations } from './pages/admin/AdminFederations';
import { AdminFederationEdit } from './pages/admin/AdminFederationEdit';
import { AdminApplications } from './pages/admin/AdminApplications';
import { Billetterie } from './pages/Billetterie';
import { ClubBilletterie } from './pages/ClubBilletterie';
import { MonClub } from './pages/MonClub';
import { MonClubBO } from './pages/MonClubBO';
import { Transactions } from './pages/Transaction';
import { MonCompte } from './pages/MonCompte';
import { Parametres } from './pages/Parametres';
import { CheckoutReturn } from './pages/CheckoutReturn';
import { IdleLogout } from './components/IdleLogout';

export default function App() {
  return (
    <AuthProvider>
      {/* Gestion de la déconnexion automatique après inactivité */}
       <IdleLogout />
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
          <Route path="applications"        element={<AdminApplications />} />
          <Route path="federations"         element={<AdminFederations />} />
          <Route path="federations/:id/edit" element={<AdminFederationEdit />} />
          <Route path="clubs"               element={<AdminClubs />} />
          <Route path="clubs/new"           element={<AdminClubEdit />} />
          <Route path="clubs/:id/edit"      element={<AdminClubEdit />} />
          <Route path="products"            element={<AdminProducts />} />
          <Route path="orders"              element={<AdminOrders />} />
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
                  <Route
                    path="/mon-club"
                    element={
                      <ProtectedRoute>
                        <MonClub />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mon-club/bo"
                    element={
                      <ProtectedRoute requiredRole="club_admin">
                        <MonClubBO />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/clubs/:slug/transactions" element={<Transactions />} />
                  <Route
                    path="/checkout/success"
                    element={<ProtectedRoute><CheckoutReturn variant="success" /></ProtectedRoute>}
                  />
                  <Route
                    path="/checkout/cancel"
                    element={<ProtectedRoute><CheckoutReturn variant="cancel" /></ProtectedRoute>}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/mon-compte"
                    element={
                      <ProtectedRoute>
                        <MonCompte />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/parametres"
                    element={
                      <ProtectedRoute>
                        <Parametres />
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
