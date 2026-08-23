// Guards all /admin/* routes: shows a spinner while loading, redirects to
// /admin/login when not authenticated as admin (docs/frontend-spec.md §5).

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald text-parchment">
        <span className="text-xs uppercase tracking-[0.3em] text-brass">Loading&#8230;</span>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}