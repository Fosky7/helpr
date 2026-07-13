import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export function ProtectedRoute() {
  const { user, loading = false } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
        <p className="ml-3 text-muted-foreground">Verifying session…</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login and remember where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
