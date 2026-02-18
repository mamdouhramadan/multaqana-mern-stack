import { Link } from 'react-router-dom';
import { ShieldWarning, CaretLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

/**
 * Centered "no permission" state for admin pages (403).
 * Shown when the user doesn't have access to the current resource.
 */
export function ForbiddenPage() {
  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Soft gradient background for depth */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-amber-50/40 via-transparent to-transparent dark:from-amber-950/10 dark:via-transparent" aria-hidden />
      <div className="max-w-md mx-auto animate-in fade-in duration-500 ease-out">

        {/* Icon with warm accent ring */}
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-8 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, oklch(0.97 0.02 85) 0%, oklch(0.92 0.04 75) 100%)',
            boxShadow: '0 8px 32px -8px oklch(0.45 0.15 75 / 0.2), inset 0 1px 0 0 oklch(1 0 0 / 0.6)',
          }}
        >
          <div className="dark:opacity-90">
            <ShieldWarning
              size={48}
              weight="duotone"
              className="text-amber-600 dark:text-amber-400"
              style={{ filter: 'drop-shadow(0 2px 4px oklch(0.4 0.1 75 / 0.2))' }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
          You don't have permission for this page
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          This area is restricted. If you believe you should have access, please contact your administrator.
        </p>

        <Button asChild variant="outline" className="gap-2 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Link to="/admin">
            <CaretLeft size={18} weight="bold" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Check if the error is a 403 Forbidden response (e.g. from axios) */
export function isForbiddenError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { response?: { status?: number }; status?: number };
  const status = err.response?.status ?? err.status;
  return status === 403;
}
