import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/app/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects to /login when the user is not authenticated. Preserves the
 * intended destination so a successful login can return the user there.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
