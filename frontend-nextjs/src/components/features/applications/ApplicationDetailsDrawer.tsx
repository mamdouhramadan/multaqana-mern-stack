import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { ApplicationDetails } from "@/types/application";
import { getImageUrl } from "@/utils/utils";
import {
  CheckCircle,
  XCircle,
  WarningCircle,
  Globe,
  EnvelopeSimple,
  Buildings,
  IdentificationCard,
  FileText,
  DownloadSimple,
  ArrowSquareOut,
  AppWindow,
} from "@phosphor-icons/react";
import QRCode from "react-qr-code";

/** Renders app logo or AppWindow placeholder when URL is empty or image fails */
function DrawerLogo({ logoUrl, appName }: { logoUrl: string; appName?: string }) {
  const [error, setError] = useState(false);
  const usePlaceholder = !logoUrl || error;
  if (usePlaceholder) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
        <AppWindow size={32} weight="duotone" />
      </div>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={appName ?? "Application"}
      className="max-w-full max-h-full object-contain"
      onError={() => setError(true)}
    />
  );
}

/**
 * جلب تفاصيل التطبيق - Fetch application details
 * This generates mock details for an application based on its ID
 * هذا يولد تفاصيل وهمية للتطبيق بناءً على معرفه
 */
const fetchApplicationDetails = async (
  appId: number | string,
  appName: string,
  appLogo: string
): Promise<ApplicationDetails> => {
  // Simulate API delay - محاكاة تأخير API
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock details based on the app - إنشاء تفاصيل وهمية بناءً على التطبيق
  return {
    id: typeof appId === "string" ? 0 : appId,
    title: appName,
    logoUrl: appLogo,
    description: `${appName} is a comprehensive enterprise application designed to streamline operations and enhance productivity. It provides a user-friendly interface for managing daily tasks and accessing important information.`,
    url: `https://app.mohesr.gov.ae/${appName.toLowerCase().replace(/\s/g, "-")}`,
    status: "active" as const,
    isInternal: Math.random() > 0.5,
    department: "Information Technology",
    technicalOwner: "IT Support Team",
    supportEmail: "support@mohesr.gov.ae",
    mobileApps: [],
    attachments: [],
  };
};

interface ApplicationDetailsDrawerProps {
  appId: number | string | null;
  appName?: string; // Passed for initial loading state or fallback
  appLogo?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationDetailsDrawer = ({ appId, appName, appLogo, isOpen, onClose }: ApplicationDetailsDrawerProps) => {
  const [data, setData] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appId) {
      setIsLoading(true);
      setError(null);
      fetchApplicationDetails(appId, appName || "Application", appLogo || "")
        .then(setData)
        .catch(() => setError("Failed to load application details"))
        .finally(() => setIsLoading(false));
    } else if (!isOpen) {
      // Reset data on close so next open allows loading state cleanly if desired
      // Or keep it to cache. Let's reset for "fresh" look or minimal cache.
      setData(null);
    }
  }, [isOpen, appId, appName, appLogo]);

  const statusConfig = {
    active: { color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle, label: "Active" },
    inactive: { color: "text-red-600 bg-red-50 border-red-200", icon: XCircle, label: "Inactive" },
    maintenance: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: WarningCircle, label: "Maintenance" }
  };

  const StatusBadge = ({ status }: { status: ApplicationDetails['status'] }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex w-full items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon weight="fill" />
        {config.label}
      </span>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-5xl">

          {/* Header */}
          <DrawerHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-gray-100 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <DrawerLogo logoUrl={getImageUrl(data?.logoUrl || appLogo || "")} appName={appName} />
                )}
              </div>
              <div className="text-left">
                <DrawerTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {isLoading ? "Loading..." : data?.title || appName}
                </DrawerTitle>
                {data && <StatusBadge status={data.status} />}
              </div>
            </div>
          </DrawerHeader>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-8 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-20 bg-gray-200 rounded w-full" />
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="h-32 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <WarningCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>{error}</p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Quick Facts */}
                <div className="md:col-span-1 space-y-6">
                  <section>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Facts</h4>
                    <ul className="space-y-3">
                      {data.isInternal && (
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <Buildings size={18} className="text-gray-400" />
                          <span className="font-medium">Internal Application</span>
                        </li>
                      )}
                      <li className="flex items-center gap-3 text-sm">
                        <Globe size={18} className="text-gray-400" />
                        <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                          {(() => {
                            try {
                              return new URL(data.url, window.location.origin).hostname;
                            } catch {
                              return data.url;
                            }
                          })()}
                        </a>
                      </li>
                      {data.supportEmail && (
                        <li className="flex items-center gap-3 text-sm">
                          <EnvelopeSimple size={18} className="text-gray-400" />
                          <a href={`mailto:${data.supportEmail}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                            {data.supportEmail}
                          </a>
                        </li>
                      )}
                    </ul>
                  </section>

                  {/* Mobile Apps */}
                  {data.mobileApps && data.mobileApps.length > 0 && (
                    <section>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Mobile Application</h4>
                      <div className="space-y-3">
                        {data.mobileApps.map((app, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <div className="bg-white dark:bg-gray-700 p-1 rounded">
                              <QRCode value={app.qrValue || app.storeUrl} size={48} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                              <p className="text-xs mb-0 text-gray-500 dark:text-gray-400 font-medium">{app.platform === 'ios' ? 'iOS' : 'Android'} App</p>
                              <p className="text-sm mb-0 font-bold text-gray-900 dark:text-gray-100">{app.storeName}</p>
                              <a href={app.storeUrl} target="_blank" rel="noopener" className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                                Download <ArrowSquareOut size={12} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-8">
                  {/* Description */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About Application</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {data.description || "No description provided."}
                    </p>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.department && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</h4>
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <Buildings size={20} className="text-primary-600 opacity-70" />
                          {data.department}
                        </p>
                      </div>
                    )}
                    {data.technicalOwner && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Technical Owner</h4>
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <IdentificationCard size={20} className="text-primary-600 opacity-70" />
                          {data.technicalOwner}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {data.attachments && data.attachments.length > 0 && (
                    <section>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText size={18} />
                        Attachments
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {data.attachments.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            <DownloadSimple size={16} />
                            {file.name}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <DrawerFooter className="border-t border-gray-100 dark:border-gray-700 pt-4 flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            {data && (
              <Button asChild className="gap-2">
                <a href={data.url} target="_blank" rel="noopener noreferrer">
                  Open Application
                  <ArrowSquareOut size={18} weight="bold" />
                </a>
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
