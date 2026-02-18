import { useNavigate } from 'react-router-dom';
import { SignIn } from '@phosphor-icons/react';
import { LoginForm } from '@/components/features/auth/LoginForm';

/**
 * Login Page Component
 *
 * Full-page login using the shared LoginForm; navigates to admin on success.
 */
const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-4">
              <SignIn size={32} className="text-primary-600 dark:text-primary-400" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Sign in to access the admin panel
            </p>
          </div>

          <LoginForm
            showRegisterLink
            onSuccess={() => navigate('/admin', { replace: true })}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
