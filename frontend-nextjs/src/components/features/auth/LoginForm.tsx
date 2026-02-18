import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvelopeSimple, Lock, SignIn } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { extractFieldErrors, extractErrorMessage, isValidationError } from '@/utils/errorHandler';
import { Spinner } from '@/components/ui/Spinner';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess?: () => void;
  showRegisterLink?: boolean;
}

/**
 * Reusable login form used on the login page and in the sidebar profile drawer.
 */
export const LoginForm = ({ onSuccess, showRegisterLink = true }: LoginFormProps) => {
  const { login } = useAuth();
  const { getBoolean } = useSettings();
  const allowRegister = getBoolean('allow_register', true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch (error: unknown) {
      if (isValidationError(error)) {
        const fieldErrors = extractFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginFormData, { message });
        });
      } else {
        const message = extractErrorMessage(error, 'Login failed. Please try again.');
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 text-gray-600 dark:text-gray-400">
        <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300">Email</Label>
        <div className="relative">
          <EnvelopeSimple
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <Input
            id="login-email"
            type="email"
            placeholder="admin@example.com"
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
            autoComplete="email"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2 text-gray-600 dark:text-gray-400">
        <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">Password</Label>
        <div className="relative">
          <Lock
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
            autoComplete="current-password"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 dark:bg-primary-600 dark:hover:bg-primary-700 text-primary-foreground" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" className="border-white border-t-transparent" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <SignIn size={20} />
            Sign In
          </span>
        )}
      </Button>

      {showRegisterLink && allowRegister && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Create one here
            </Link>
          </p>
        </div>
      )}
    </form>
  );
};
