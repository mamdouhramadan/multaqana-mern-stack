import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SIDEBAR_MENU, type SidebarItem } from "@/data/sidebarMenu";
import {
  User as UserIcon,
  SignOut,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuth } from "@/providers/AuthProvider";
import { useThemeStore } from "@/store/useThemeStore";
import { ProfileSheet } from "../features/profile/ProfileSheet";
import { LogoutDrawer } from "../features/auth/LogoutDrawer";
import { LoginForm } from "../features/auth/LoginForm";
import { EventsDrawer } from "../features/events/EventsDrawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  width: number;
}

const Sidebar = ({ width }: SidebarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const expanded = useThemeStore((s) => s.sidebarExpanded);
  const toggleSidebarExpanded = useThemeStore((s) => s.toggleSidebarExpanded);

  // Handle sidebar item click - معالجة النقر على عنصر الشريط الجانبي
  const handleItemClick = (item: SidebarItem) => {
    // First item toggles sidebar expand/collapse
    if (item.id === "menu") {
      toggleSidebarExpanded();
      return;
    }

    // Open events drawer - فتح درج الأحداث
    if (item.modalId === "events-calendar") {
      setShowEvents(true);
      return;
    }

    // Navigate to href if it's a link - الانتقال إلى الرابط إذا كان رابطاً
    if (item.href) {
      navigate(item.href);
      return;
    }

    // Handle language switch action - معالجة إجراء تبديل اللغة
    if (item.type === "action" && item.action === "switchLanguage") {
      const newLang = (i18n.resolvedLanguage || i18n.language) === "ar" ? "en" : "ar";
      i18n.changeLanguage(newLang);
      return;
    }
  };

  return (
    <>
      {/* 
        Desktop Sidebar - الشريط الجانبي لسطح المكتب
        Visible on lg and up. Fixed left, full height.
        ظاهر على الشاشات الكبيرة وما فوق. ثابت على اليسار، ارتفاع كامل.
      */}
      <aside
        className="hidden lg:flex sticky top-0 h-[calc(100vh-2rem)] rounded-2xl bg-white dark:bg-gray-900 z-50 flex-col py-6 shadow-sidebar overflow-x-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        <TooltipProvider delayDuration={0}>
        {/* Scrollable Menu Items - عناصر القائمة القابلة للتمرير */}
        <div
          className={`flex-1 w-full flex flex-col space-y-2 overflow-y-auto no-scrollbar ${expanded ? "items-stretch px-3" : "items-center"}`}
        >
          {SIDEBAR_MENU.map((item) => {
            const Icon = item.icon;
            const baseClasses =
              "flex items-center rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 no-underline";
            const sizeClasses = expanded
              ? "w-full min-w-0 h-10 justify-start gap-2 px-3"
              : "w-10 h-10 justify-center shrink-0";

            const content = (
              <>
                <Icon size={24} weight="regular" className="shrink-0" />
                {expanded && (
                  <span className="truncate whitespace-nowrap text-sm">
                    {t(item.labelKey)}
                  </span>
                )}
              </>
            );

            // Link type with href - نوع رابط مع href
            if (item.type === "link" && item.href) {
              const link = (
                <Link
                  to={item.href}
                  className={`${baseClasses} ${sizeClasses}`}
                  aria-label={t(item.labelKey)}
                >
                  {content}
                </Link>
              );
              return (
                <span key={item.id} className="flex">
                  {expanded ? (
                    link
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent>{t(item.labelKey)}</TooltipContent>
                    </Tooltip>
                  )}
                </span>
              );
            }

            // Button type (modal or action) - نوع زر (نافذة منبثقة أو إجراء)
            const button = (
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={`${baseClasses} ${sizeClasses}`}
                aria-label={t(item.labelKey)}
              >
                {content}
              </button>
            );
            return (
              <span key={item.id} className="flex">
                {expanded ? (
                  button
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent>{t(item.labelKey)}</TooltipContent>
                  </Tooltip>
                )}
              </span>
            );
          })}
        </div>

        {/* Bottom Actions - الإجراءات السفلية */}
        <div
          className={`mt-auto pt-4 flex flex-col gap-2 w-full border-t border-gray-100 dark:border-gray-700 ${expanded ? "px-3" : "px-4"}`}
        >
          {expanded ? (
            <>
              <button
                onClick={() => setShowProfile(true)}
                className="w-full h-10 flex items-center justify-start gap-2 px-3 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 no-underline"
              >
                <UserIcon size={24} weight="regular" className="shrink-0" />
                <span className="whitespace-nowrap text-sm">{t('common.profile')}</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setShowLogout(true)}
                  className="w-full h-10 flex items-center justify-start gap-2 px-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 no-underline"
                >
                  <SignOut size={24} weight="regular" className="shrink-0" />
                  <span className="whitespace-nowrap text-sm">{t('common.logout')}</span>
                </button>
              )}
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="w-full h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                  >
                    <UserIcon size={24} weight="regular" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t('common.profile')}</TooltipContent>
              </Tooltip>
              {isAuthenticated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowLogout(true)}
                      className="w-full h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <SignOut size={24} weight="regular" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t('common.logout')}</TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
        </TooltipProvider>
      </aside>

      {/* 
        Mobile Bottom Navigation - التنقل السفلي للجوال
        Visible on sm/md, hidden on lg.
        ظاهر على الشاشات الصغيرة والمتوسطة، مخفي على الكبيرة.
      */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 dark:border-gray-700 z-50 flex items-center justify-around px-2 safe-area-bottom">
        {SIDEBAR_MENU.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-primary-600"
            >
              <Icon size={24} />
              <span className="text-[10px] mt-1 truncate max-w-15">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Drawers & Sheets - الأدراج والصفحات */}
      {isAuthenticated ? (
        <ProfileSheet isOpen={showProfile} onClose={() => setShowProfile(false)} />
      ) : (
        <Sheet open={showProfile} onOpenChange={(open) => !open && setShowProfile(false)}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('common.signIn')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <LoginForm
                showRegisterLink={false}
                onSuccess={() => setShowProfile(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      <EventsDrawer isOpen={showEvents} onClose={() => setShowEvents(false)} />
      <LogoutDrawer
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onLogout={async () => {
          await logout();
          setShowLogout(false);
        }}
      />
    </>
  );
};

export default Sidebar;
