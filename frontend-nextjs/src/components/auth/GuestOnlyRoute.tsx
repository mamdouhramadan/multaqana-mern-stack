import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Guest-Only Route Component
 *
 * For login and register pages. If already authenticated, redirects to /admin.
 * Loading is handled by AuthProvider (gate) and AdminLayout for admin.
 */
export const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};
