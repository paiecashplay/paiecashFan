import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { TicketingCartProvider } from '@/hooks/useTicketingCart';
import { CheckoutModal } from '@/components/cart/CheckoutModal';
import { CartToast } from '@/components/cart/CartToast';
import { CartPage } from './pages/CartPage';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollTopButton } from './components/ScrollTopButton';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Boutique } from './pages/Boutique';
import { Tombola } from './pages/Tombola';
import { FanClub } from './pages/FanClub';
import { FanClubHub } from './pages/FanClubHub';
import { MatchLive } from './pages/MatchLive';
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
import { AdminPlatform } from './pages/admin/AdminPlatform';
import { AdminRedtaag } from './pages/admin/AdminRedtaag';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminTombola } from './pages/admin/AdminTombola';
import { AdminPrizes } from './pages/admin/AdminPrizes';
import { AdminBingo } from './pages/admin/AdminBingo';
import { AdminModeration } from './pages/admin/AdminModeration';
import { BingoPlay } from './pages/BingoPlay';
import { SportBingo } from './pages/SportBingo';
import { BingoResults } from './pages/BingoResults';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminClubEdit } from './pages/admin/AdminClubEdit';
import { AdminFederations } from './pages/admin/AdminFederations';
import { AdminFederationEdit } from './pages/admin/AdminFederationEdit';
import { AdminApplications } from './pages/admin/AdminApplications';
import { Billetterie } from './pages/Billetterie';
import { ClubBilletterie } from './pages/ClubBilletterie';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { MonClub } from './pages/MonClub';
import { MonClubBO } from './pages/MonClubBO';
import { Transactions } from './pages/Transaction';
import { MonCompte } from './pages/MonCompte';
import { Parametres } from './pages/Parametres';
import { FanDashboardLayout } from './pages/mon-compte/FanDashboardLayout';
import { FanOverview } from './pages/mon-compte/FanOverview';
import {
  FanCommandes, FanPccPage, FanGainsPage, FanActivitesPage, FanModerationPage,
  FanClubsPage, FanAmisPage, FanClassementsPage, FanProfilPage, FanSecuritePage, FanParametresPage,
} from './pages/mon-compte/FanPages';
import { CheckoutReturn } from './pages/CheckoutReturn';
import { IdleLogout } from './components/IdleLogout';
import { supabase } from '@/lib/supabase';

export default function App() {

  // Gestion des erreurs OAuth (Google, etc.) et redirection vers la page appropriée
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    // Gestion du retour OAuth après la connexion Google
    async function handleOAuthReturn() {
      const searchParams =
        new URLSearchParams(
          window.location.search
        );

      const hashParams =
        new URLSearchParams(
          window.location.hash.replace(
            /^#/,
            ''
          )
        );

      const oauthError =
        searchParams.get('error') ||
        hashParams.get('error');

      const oauthNext =
        searchParams.get('oauth_next');

      const pendingRoleRequest =
        sessionStorage.getItem(
          'google_auth_role_request'
        );

      // Annulation / refus Google.
      if (oauthError) {
        sessionStorage.removeItem(
          'google_auth_role_request'
        );

        if (oauthError === 'access_denied') {
          console.info(
            'Connexion Google annulée par l’utilisateur.'
          );
        } else {
          console.error(
            'Erreur lors de la connexion Google :',
            oauthError
          );
        }

        navigate('/', {
          replace: true,
        });

        return;
      }

      // Aucun retour OAuth à traiter.
      if (
        !oauthNext &&
        pendingRoleRequest !== 'club_admin'
      ) {
        return;
      }

      // Récupération de l’utilisateur connecté après le retour OAuth.
      try {
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user || cancelled) {
          return;
        }

        // Représentant de club :
        // il reste fan tant que sa candidature
        // n'est pas validée.
        if (
          pendingRoleRequest === 'club_admin'
        ) {
          const {
            error: profileError,
          } = await supabase
            .from('profiles')
            .update({
              role_request: 'club_admin',
            })
            .eq('id', user.id);

          if (profileError) {
            throw profileError;
          }

          sessionStorage.removeItem(
            'google_auth_role_request'
          );

          await supabase.auth.refreshSession();

          if (!cancelled) {
            navigate('/mon-club', {
              replace: true,
            });
          }

          return;
        }

        // Fan ou connexion Google classique.
        sessionStorage.removeItem(
          'google_auth_role_request'
        );

        const safeNext =
          oauthNext &&
          oauthNext.startsWith('/') &&
          !oauthNext.startsWith('//')
            ? oauthNext
            : '/';

        if (!cancelled) {
          navigate(safeNext, {
            replace: true,
          });
        }
      } catch (error) {
        sessionStorage.removeItem(
          'google_auth_role_request'
        );

        console.error(
          'Erreur lors de la finalisation Google :',
          error
        );

        if (!cancelled) {
          navigate('/', {
            replace: true,
          });
        }
      }
    }

    handleOAuthReturn();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthProvider>
     <CartProvider>
     <TicketingCartProvider>
      {/* Modal de checkout premium + toast d'ajout (globaux) */}
      <CheckoutModal />
      <CartToast />
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
          <Route path="platform"            element={<AdminPlatform />} />
          <Route path="redtaag"             element={<AdminRedtaag />} />
          <Route path="orders"              element={<AdminOrders />} />
          <Route path="tombola"             element={<AdminTombola />} />
          <Route path="prizes"              element={<AdminPrizes />} />
          <Route path="bingo"               element={<AdminBingo />} />
          <Route path="moderation"          element={<AdminModeration />} />
          <Route path="settings"            element={<AdminSettings />} />
        </Route>

        {/* BO Club : app plein écran (pas de Navbar/Footer public) */}
        <Route
          path="/mon-club/bo"
          element={
            <ProtectedRoute requiredRole="club_admin">
              <MonClubBO />
            </ProtectedRoute>
          }
        />

        {/* Espace Fan : dashboard plein écran (pas de Navbar/Footer public) */}
        <Route
          path="/mon-compte"
          element={
            <ProtectedRoute>
              <FanDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index               element={<FanOverview />} />
          <Route path="commandes"     element={<FanCommandes />} />
          <Route path="favoris"       element={<FanClubsPage />} />
          <Route path="pcc"           element={<FanPccPage />} />
          <Route path="gains"         element={<FanGainsPage />} />
          <Route path="clubs"         element={<FanClubsPage />} />
          <Route path="amis"          element={<FanAmisPage />} />
          <Route path="activites"     element={<FanActivitesPage />} />
          <Route path="classements"   element={<FanClassementsPage />} />
          <Route path="moderation"    element={<FanModerationPage />} />
          <Route path="profil"        element={<FanProfilPage />} />
          <Route path="securite"      element={<FanSecuritePage />} />
          <Route path="parametres"    element={<FanParametresPage />} />
          <Route path="*"             element={<Navigate to="/mon-compte" replace />} />
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
                  <Route path="/panier" element={<CartPage />} />
                  <Route path="/tombola" element={<Tombola />} />
                  <Route path="/fan-club" element={<FanClubHub />} />
                  <Route path="/match/:fixtureId" element={<MatchLive />} />
                  <Route path="/federations/:fedId" element={<FederationDetail />} />
                  <Route path="/clubs/:slug" element={<ClubDetail />} />
                  <Route path="/clubs/:slug/billetterie" element={<ClubBilletterie />} />
                  <Route path="/clubs/:slug/fan-club" element={<FanClub />} />
                  <Route path="/tombola/sport-bingo" element={<SportBingo />} />
                  <Route path="/tombola/resultats" element={<BingoResults />} />
                  <Route path="/bingo/:slug" element={<BingoPlay />} />
                  <Route
                    path="/mon-club"
                    element={
                      <ProtectedRoute>
                        <MonClub />
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
                  {/* Anciennes URLs → nouveau dashboard Fan (compat) */}
                  <Route path="/parametres" element={<Navigate to="/mon-compte/parametres" replace />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
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
     </TicketingCartProvider>
     </CartProvider>
    </AuthProvider>
  );
}
