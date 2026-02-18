import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { siteConfig } from "@/config/site";
// @ts-expect-error - DDA design system types may not be fully available
import { DdaHeader } from "@dubai-design-system/components-react";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
function logoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return base ? `${base}${path.startsWith("/") ? "" : "/"}${path}` : path;
}

const HeaderDesktop = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getString } = useSettings();

  const currentLang = i18n.resolvedLanguage || i18n.language || "en";
  const isArabic = currentLang === "ar";

  const siteLogo = getString("site_logo");
  const logoSrc = siteLogo ? logoUrl(siteLogo) : siteConfig.logos.dark;
  const logoWhiteSrc = siteLogo ? logoUrl(siteLogo) : siteConfig.logos.white;

  const handleLanguageSwitch = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const handleSearch = () => {
    navigate("/search");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const sideMenuItems = JSON.stringify([
    { label: t("sidebar.mainMenu"), active: "true", href: "/", subMenu: [] },
    { label: t("sidebar.search"), href: "/search", subMenu: [] },
    { label: t("sidebar.magazines"), href: "/magazines", subMenu: [] },
    { label: t("sidebar.videos"), href: "/videos", subMenu: [] },
    { label: t("sidebar.photos"), href: "/photos", subMenu: [] },
    { label: t("sidebar.employees"), href: "/employees", subMenu: [] },
    { label: t("sidebar.eventsCalendar"), href: "/search", subMenu: [] },
    { label: t("sidebar.applications"), href: "/applications", subMenu: [] },
    { label: t("sidebar.faqs"), href: "/faqs", subMenu: [] },
    { label: t("sidebar.importantFiles"), href: "/files", subMenu: [] },
    { label: t("sidebar.attendance"), href: "/attendance", subMenu: [] },
    { label: t("sidebar.contactUs"), href: "#", subMenu: [] },
  ]);

  const quickLinks = JSON.stringify([
    { headerMenuLabel: t("sidebar.mainMenu"), active: "true", url: "/" },
    { headerMenuLabel: t("sidebar.magazines"), url: "/magazines" },
    { headerMenuLabel: t("sidebar.videos"), url: "/videos" },
    { headerMenuLabel: t("sidebar.photos"), url: "/photos" },
    { headerMenuLabel: t("sidebar.eventsCalendar"), url: "/search" },
    { headerMenuLabel: t("sidebar.applications"), url: "/applications" },
    { headerMenuLabel: t("sidebar.importantFiles"), url: "/files" },
    { headerMenuLabel: t("sidebar.contactUs"), url: "#" },
  ]);

  const loginPopupLinks = isAuthenticated
    ? JSON.stringify([
        { popupItemLabel: t("common.profile"), url: "#" },
        { popupItemLabel: t("common.logout"), url: "#" },
      ])
    : "[]";

  return (
    <div className="relative w-full">
      <DdaHeader
        first-logo-href="/"
        first-logo-src={logoSrc}
        first-logo-white-src={logoWhiteSrc}
        first-logo-alt={siteConfig.name}
        second-logo-href="https://www.mohesr.gov.ae"
        second-logo-src={logoSrc}
        second-logo-white-src={logoWhiteSrc}
        second-logo-alt={siteConfig.name}
        search_button_name="search_button"
        search_input_name="search_input"
        search_input_placeholder={t("header.searchPlaceholder")}
        search_tooltip={t("header.search")}
        mobile-menu-search-id="mobileSearch"
        mobile-menu-search-url="/search"
        use-predesigned-accessibility-menu="false"
        language_tooltip={t("language.switchTo")}
        language_text={isArabic ? "English" : "العربية"}
        language_button_name="language_switch"
        onLanguageSwitch={handleLanguageSwitch}
        login_tooltip={isAuthenticated ? t("common.profile") : t("auth.login")}
        login-text={isAuthenticated ? t("common.profile") : t("auth.login")}
        login-link="/login"
        login-icon="account_circle"
        use-login-popup={isAuthenticated ? "true" : "false"}
        login-popup-links={loginPopupLinks}
        onLoginClick={handleLoginClick}
        onSearchfunctionality={handleSearch}
        hamburger_menu_button_name={t("sidebar.mainMenu")}
        side-main-menu-title={t("sidebar.mainMenu")}
        side-menu-items={sideMenuItems}
        hide-other-menu="true"
        close_menu_button_name={t("common.close")}
        quick-links={quickLinks}
      />
    </div>
  );
};

export default HeaderDesktop;
