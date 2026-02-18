import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvelopeSimple, Lock, User, SignIn, Phone } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { extractFieldErrors, extractErrorMessage, isValidationError } from '@/utils/errorHandler';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Simplified registration form validation schema
 * Only essential fields - users can add more details later
 */
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register Page Component
 * 
 * Simplified registration with minimal fields:
 * - Email (required)
 * - Phone number (optional)
 * - Password (required)
 * - Confirm password (required)
 * 
 * Username is auto-generated from email (part before @)
 * Users can add additional profile info later from their profile
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Auto-generate username from email (part before @)
      const username = data.email.split('@')[0];

      // Prepare minimal registration data
      const userData: any = {
        username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      // Only include phone number if provided
      if (data.phoneNumber && data.phoneNumber.trim()) {
        userData.phoneNumber = data.phoneNumber.trim();
      }

      await registerUser(userData);
      // After successful registration, user is auto-logged in
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (error: unknown) {
      // Check if error contains field-level validation errors
      if (isValidationError(error)) {
        const fieldErrors = extractFieldErrors(error);
        // Map backend errors to form fields
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof RegisterFormData, { message });
        });
      } else {
        // Show general error message as toast
        const message = extractErrorMessage(error, 'Registration failed. Please try again.');
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-4">
              <User size={32} className="text-primary-600 dark:text-primary-400" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Join Multaqana - Add more details later from your profile
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address *</Label>
              <div className="relative">
                <EnvelopeSimple size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">Your username will be auto-generated from your email</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+971 50 123 4567"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password *</Label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
                  autoComplete="new-password"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password *</Label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 dark:bg-primary-600 dark:hover:bg-primary-700 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SignIn size={20} />
                  Create Account
                </span>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
