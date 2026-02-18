import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication. If not authenticated, redirects
 * to login. (For admin, auth + loading are handled in AdminLayout.)
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
