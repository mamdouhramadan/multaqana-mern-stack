import { Link, useSearchParams } from 'react-router-dom';
import { House, XCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/layout/PageLayout';

const ServerError = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  return (
    <PageLayout title="Server Error">
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <XCircle size={40} className="text-red-500" weight="duotone" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Internal Server Error
        </h2>

        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          {message || "Something went wrong on our end. We're working to fix it. Please try again later."}
        </p>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>

          <Button asChild>
            <Link to="/">
              <House className="mr-2" size={18} />
              Home Page
            </Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ServerError;
