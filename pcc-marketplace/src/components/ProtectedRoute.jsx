import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const raw = localStorage.getItem('pcc_user');
  if (!raw) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(raw);
    if (!user?.token || !user?.id) return <Navigate to="/login" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
