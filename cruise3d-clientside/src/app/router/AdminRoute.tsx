import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/app/store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Allows only authenticated admins. Non-authenticated users go to /login;
 * authenticated non-admin users are redirected to home.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
