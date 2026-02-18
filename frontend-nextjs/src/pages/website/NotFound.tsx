import { Link } from 'react-router-dom';
import { Warning, ArrowLeft, House } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/layout/PageLayout';

const NotFound = () => {
  return (
    <PageLayout title="Page Not Found">
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <Warning size={40} className="text-gray-400" weight="duotone" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
          Please check the URL or go back to the homepage.
        </p>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2" size={18} />
              Go Back
            </Link>
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

export default NotFound;
