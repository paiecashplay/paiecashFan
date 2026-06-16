import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />;
  }

  const hasRole =
    !requiredRole ||
    (requiredRole === 'super_admin' && profile?.role === 'super_admin') ||
    (requiredRole === 'club_admin'  && (profile?.role === 'club_admin' || profile?.role === 'super_admin'));

  if (!hasRole) {
    // L'utilisateur est connecté mais n'a pas encore le bon rôle.
    // On lui propose de rafraîchir ses droits (utile après changement manuel en DB)
    // plutôt que de le rediriger silencieusement.
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="font-display text-xl font-black text-bone-50">Accès restreint</h2>
        <p className="text-sm text-bone-400 max-w-xs">
          Tu n'as pas les droits pour accéder à cette page.
          Si tes droits viennent d'être mis à jour, rafraîchis ta session.
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => { setRefreshing(true); await refreshProfile(); setRefreshing(false); }}
            disabled={refreshing}
            className="h-10 px-5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Chargement…' : 'Rafraîchir mes droits'}
          </button>
          <a href="/" className="h-10 px-5 rounded-xl border border-white/10 text-sm font-bold text-bone-300 hover:text-bone-50 flex items-center transition-colors">
            Retour
          </a>
        </div>
        <p className="text-xs text-bone-600">Rôle actuel : <span className="font-mono text-bone-400">{profile?.role || 'fan'}</span></p>
      </div>
    );
  }

  return children;
}
