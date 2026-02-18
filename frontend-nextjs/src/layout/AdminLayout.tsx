import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/providers/AuthProvider';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

/**
 * Admin Layout Component
 * مكون تخطيط لوحة الإدارة
 *
 * Shows loading until auth is known, then redirects to login or renders
 * sidebar, header, and outlet.
 */
const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-gray-100/50 dark:bg-gray-800">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
