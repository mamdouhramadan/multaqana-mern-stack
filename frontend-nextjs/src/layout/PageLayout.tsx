import type { ReactNode } from 'react';
import { useMatches } from 'react-router-dom';
import { GradientWrapper } from '@/components/ui/GradientWrapper';
// @ts-expect-error - external lib might not have types
import { Breadcrumbs } from '@aegov/design-system-react';

interface PageLayoutProps {
  children: ReactNode;
  isFullPage?: boolean;
  hasPageTitle?: boolean;
  hasBreadcrumb?: boolean;
  title?: string;
}

const PageLayout = ({
  children,
  isFullPage = false,
  hasPageTitle = true,
  hasBreadcrumb = true,
  title
}: PageLayoutProps) => {
  const matches = useMatches();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentMatch = matches.at(-1) as any;
  const pageTitle = title || currentMatch?.handle?.title || '';

  return (
    <div className="min-h-full w-full flex flex-col gap-8">
      {/* Page Content */}
      {hasPageTitle && hasBreadcrumb && <div className={!isFullPage ? "container " : ""}>
        <GradientWrapper rounded className="mt-8 rounded-xl py-12 flex flex-col gap-4 text-center">
          {hasPageTitle && pageTitle && (
            <h1 className="text-3xl font-bold text-[#fff]">{pageTitle}</h1>
          )}

          {hasBreadcrumb && hasPageTitle && (
            <div className="flex justify-center">
              <Breadcrumbs
                className="text-white [&_a]:text-slate-200 [&_span]:text-white [&_svg]:text-slate-200"
                items={[
                  { href: '#', label: 'Home' },
                  { href: '#', label: 'Press release and features' },
                  { label: ' must be affected' }
                ]}
              />
            </div>
          )}
        </GradientWrapper>
      </div>}
      <div className="main-content">
        <div className={!isFullPage ? "container py-6" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
