import { useState } from "react";
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { ApplicationListSkeleton } from "@/components/skeleton/ApplicationListSkeleton";
import { getImageUrl } from "@/utils/utils";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, ArrowRight, Info, AppWindow } from "@phosphor-icons/react";
import { ApplicationDetailsDrawer } from "@/components/features/applications/ApplicationDetailsDrawer";

interface Application {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
  href?: string;
  url?: string;
  image?: string;
  logo?: string;
  category?: string | { _id?: string; title?: string };
}

const appDisplayName = (app: Application) => app.name ?? app.title ?? "";
const appLink = (app: Application) => app.href ?? app.url ?? "#";
const appImage = (app: Application) => app.image ?? app.logo ?? "";
const appId = (app: Application) => app.id ?? app._id ?? "";

function AppLogo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  const usePlaceholder = !url || failed;

  if (usePlaceholder) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500" aria-hidden>
        <AppWindow size={40} weight="duotone" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className="max-w-full max-h-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

const ApplicationsPage = () => {
  const { data, isLoading, error } = useGetData<Application[]>('applications');
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedApp, setSelectedApp] = useState<{ id: number | string; name: string; logo: string } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredApps = data?.filter((app) => {
    const name = appDisplayName(app);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenDrawer = (e: React.MouseEvent, app: Application) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedApp({ id: appId(app), name: appDisplayName(app), logo: appImage(app) });
    setIsDrawerOpen(true);
  };

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="flex flex-col lg:flex-row gap-8">

        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                placeholder="Search applications..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <StateRenderer
            isLoading={isLoading}
            loadingComponent={<ApplicationListSkeleton />}
            error={error?.message ?? null}
            data={filteredApps}
            isEmpty={filteredApps && filteredApps.length === 0}
          >
            {(apps) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {apps.map((app) => (
                  <div key={String(appId(app))} className="relative group h-full">
                    <a
                      href={appLink(app)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center hover:shadow-lg transition-all h-full block"
                    >
                      <div className="w-20 h-20 mb-4 flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
                        <AppLogo src={appImage(app)} alt={appDisplayName(app)} />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 mb-4 line-clamp-2">{appDisplayName(app)}</h4>

                      <div className="mt-auto flex items-center text-sm text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Launch <ArrowRight className="ml-1" size={16} />
                      </div>
                    </a>

                    <button
                      onClick={(e) => handleOpenDrawer(e, app)}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600 z-10"
                      aria-label="View Details"
                      title="View Details"
                    >
                      <Info size={20} weight="fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </StateRenderer>

          <ApplicationDetailsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            appId={selectedApp?.id || null}
            appName={selectedApp?.name}
            appLogo={selectedApp?.logo}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default ApplicationsPage;
